import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Subscription, SubscriptionStatus } from './subscription.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VpnConfigurationService } from '../vpn-configuration/vpn-configuration.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription, 'main')
    private readonly subscriptionRepo: Repository<Subscription>,
    @Inject(forwardRef(() => VpnConfigurationService))
    private readonly vpnConfigService: VpnConfigurationService,
  ) {}

  async create(
    userId: number,
    durationDays: number,
    maxConfigurations = 1,
  ): Promise<Subscription> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const subscription = this.subscriptionRepo.create({
      user_id: userId,
      status: SubscriptionStatus.ACTIVE,
      start_date: startDate,
      end_date: endDate,
      max_configurations: maxConfigurations,
    });

    return await this.subscriptionRepo.save(subscription);
  }

  async findById(id: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async getActiveByUserId(userId: number): Promise<Subscription | null> {
    return await this.subscriptionRepo.findOne({
      where: {
        user_id: userId,
        status: SubscriptionStatus.ACTIVE,
        end_date: MoreThan(new Date()),
      },
      order: { end_date: 'DESC' },
    });
  }

  async findByUserId(userId: number): Promise<Subscription[]> {
    return await this.subscriptionRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findActiveByUserId(userId: number): Promise<Subscription | null> {
    return await this.subscriptionRepo.findOne({
      where: {
        user_id: userId,
        status: SubscriptionStatus.ACTIVE,
        end_date: MoreThan(new Date()),
      },
      order: { end_date: 'DESC' },
    });
  }

  async renew(
    subscriptionId: number,
    durationDays: number,
  ): Promise<Subscription> {
    const subscription = await this.findById(subscriptionId);

    if (subscription.status === SubscriptionStatus.CANCELLED) {
      throw new BadRequestException('Cannot renew cancelled subscription');
    }

    const now = new Date();
    const startDate = subscription.end_date > now ? subscription.end_date : now;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.end_date = endDate;

    await this.vpnConfigService.reactivateByUserId(subscription.user_id);
    return await this.subscriptionRepo.save(subscription);
  }

  async cancel(subscriptionId: number): Promise<Subscription> {
    const subscription = await this.findById(subscriptionId);

    subscription.status = SubscriptionStatus.CANCELLED;

    return await this.subscriptionRepo.save(subscription);
  }

  async checkAndExpire(subscriptionId: number): Promise<void> {
    const subscription = await this.findById(subscriptionId);

    if (
      subscription.status === SubscriptionStatus.ACTIVE &&
      subscription.end_date <= new Date()
    ) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepo.save(subscription);
    }
  }

  // Cron job to check expired subscriptions every hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredSubscriptions(): Promise<void> {
    const expiredSubscriptions = await this.subscriptionRepo.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        end_date: LessThan(new Date()),
      },
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepo.save(subscription);
      if (this.getActiveByUserId(subscription.user_id) === null) {
        await this.vpnConfigService.suspendByUserId(subscription.user_id);
      }
    }
  }
}
