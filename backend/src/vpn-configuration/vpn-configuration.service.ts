import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VpnConfiguration, ConfigStatus } from './vpn-configuration.entity';
import { SubscriptionService } from '../subscription/subscription.service';
import { RadCheckService } from '../radcheck/radcheck.service';
import * as crypto from 'crypto';

@Injectable()
export class VpnConfigurationService {
  constructor(
    @InjectRepository(VpnConfiguration, 'main')
    private readonly configRepo: Repository<VpnConfiguration>,
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
    private readonly radCheckService: RadCheckService,
  ) {}

  private generateUsername(userId: number, configCount: number): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `user${userId}_cfg${configCount}_${timestamp}${random}`;
  }

  private generatePassword(length = 16): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      password += chars[randomBytes[i] % chars.length];
    }

    return password;
  }

  async create(
    userId: number,
    description?: string,
  ): Promise<VpnConfiguration> {
    const activeSubscription =
      await this.subscriptionService.getActiveByUserId(userId);
    if (!activeSubscription) {
      throw new BadRequestException('Subscription is not active');
    }

    // Check if user has reached max configurations for this subscription
    const existingConfigs = await this.configRepo.count({
      where: { user_id: userId },
    });

    if (existingConfigs >= activeSubscription.max_configurations) {
      throw new BadRequestException(
        `Maximum configurations (${activeSubscription.max_configurations}) reached for this subscription`,
      );
    }

    // Generate unique username and password
    const username = this.generateUsername(userId, existingConfigs + 1);
    const password = this.generatePassword();

    // Create VPN configuration
    const config = this.configRepo.create({
      user_id: userId,
      username,
      password,
      status: ConfigStatus.ACTIVE,
      description,
    });

    const savedConfig = await this.configRepo.save(config);

    // Add to radcheck table
    await this.radCheckService.addCleartextPassword(username, password);

    return savedConfig;
  }

  async findById(id: number): Promise<VpnConfiguration> {
    const config = await this.configRepo.findOne({
      where: { id },
      relations: ['user', 'subscription'],
    });

    if (!config) {
      throw new NotFoundException('VPN configuration not found');
    }

    return config;
  }

  async findByUserId(userId: number): Promise<VpnConfiguration[]> {
    return await this.configRepo.find({
      where: { user_id: userId },
      relations: ['subscription'],
      order: { created_at: 'DESC' },
    });
  }

  async activate(id: number): Promise<VpnConfiguration> {
    const config = await this.findById(id);

    // Check if subscription is still active
    const activeSubscription = await this.subscriptionService.getActiveByUserId(
      config.user_id,
    );
    if (!activeSubscription) {
      throw new BadRequestException('Subscription is not active');
    }

    config.status = ConfigStatus.ACTIVE;
    const savedConfig = await this.configRepo.save(config);

    // Add to radcheck
    await this.radCheckService.addCleartextPassword(
      config.username,
      config.password,
    );

    return savedConfig;
  }

  async deactivate(id: number): Promise<VpnConfiguration> {
    const config = await this.findById(id);

    config.status = ConfigStatus.INACTIVE;
    const savedConfig = await this.configRepo.save(config);

    // Remove from radcheck
    await this.radCheckService.deleteCleartextPassword(config.username);

    return savedConfig;
  }

  async suspend(id: number): Promise<VpnConfiguration> {
    const config = await this.findById(id);

    config.status = ConfigStatus.SUSPENDED;
    const savedConfig = await this.configRepo.save(config);

    // Remove from radcheck
    await this.radCheckService.deleteCleartextPassword(config.username);

    return savedConfig;
  }

  async delete(id: number): Promise<void> {
    const config = await this.findById(id);

    // Remove from radcheck
    await this.radCheckService.deleteCleartextPassword(config.username);

    // Delete configuration
    await this.configRepo.remove(config);
  }

  async suspendByUserId(userId: number): Promise<void> {
    const configs = await this.findByUserId(userId);

    for (const config of configs) {
      if (config.status === ConfigStatus.ACTIVE) {
        await this.suspend(config.id);
      }
    }
  }

  async reactivateByUserId(userId: number): Promise<void> {
    const configs = await this.findByUserId(userId);

    for (const config of configs) {
      if (config.status === ConfigStatus.SUSPENDED) {
        await this.activate(config.id);
      }
    }
  }

  async updateLastConnection(
    id: number,
    ipAddress: string,
  ): Promise<VpnConfiguration> {
    const config = await this.findById(id);

    config.last_connection_ip = ipAddress;
    config.last_connection_at = new Date();

    return await this.configRepo.save(config);
  }

  async regeneratePassword(id: number): Promise<VpnConfiguration> {
    const config = await this.findById(id);

    const newPassword = this.generatePassword();

    // Update radcheck if active
    if (config.status === ConfigStatus.ACTIVE) {
      await this.radCheckService.deleteCleartextPassword(config.username);
      await this.radCheckService.addCleartextPassword(
        config.username,
        newPassword,
      );
    }

    config.password = newPassword;

    return await this.configRepo.save(config);
  }
}
