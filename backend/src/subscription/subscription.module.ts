import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Subscription } from './subscription.entity';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { VpnConfigurationModule } from '../vpn-configuration/vpn-configuration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription], 'main'),
    ScheduleModule.forRoot(),
    forwardRef(() => VpnConfigurationModule),
  ],
  providers: [SubscriptionService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
