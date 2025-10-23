import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators';
import { User } from '../user/user.entity';
import { VpnConfigurationService } from '../vpn-configuration/vpn-configuration.service';

class CreateSubscriptionDto {
  duration_days: number;
  max_configurations?: number;
}

class RenewSubscriptionDto {
  duration_days: number;
}

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly vpnConfigService: VpnConfigurationService,
  ) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateSubscriptionDto) {
    return await this.subscriptionService.create(
      user.id,
      dto.duration_days,
      dto.max_configurations || 1,
    );
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    return await this.subscriptionService.findByUserId(user.id);
  }

  @Get('active')
  async findActive(@CurrentUser() user: User) {
    return await this.subscriptionService.findActiveByUserId(user.id);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const subscription = await this.subscriptionService.findById(id);

    // Ensure user owns this subscription
    if (subscription.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    return subscription;
  }

  @Patch(':id/renew')
  async renew(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RenewSubscriptionDto,
  ) {
    const subscription = await this.subscriptionService.findById(id);

    // Ensure user owns this subscription
    if (subscription.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    const renewedSubscription = await this.subscriptionService.renew(
      id,
      dto.duration_days,
    );

    // Reactivate configurations if subscription was expired
    await this.vpnConfigService.reactivateByUserId(id);

    return renewedSubscription;
  }

  @Delete(':id')
  async cancel(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const subscription = await this.subscriptionService.findById(id);

    // Ensure user owns this subscription
    if (subscription.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    // Suspend all configurations
    await this.vpnConfigService.suspendByUserId(id);

    return await this.subscriptionService.cancel(id);
  }
}
