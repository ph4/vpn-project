import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VpnConfiguration } from './vpn-configuration.entity';
import { VpnConfigurationService } from './vpn-configuration.service';
import { VpnConfigurationController } from './vpn-configuration.controller';
import { SubscriptionModule } from '../subscription/subscription.module';
import { RadCheckModule } from '../radcheck/radcheck.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VpnConfiguration], 'main'),
    forwardRef(() => SubscriptionModule),
    RadCheckModule,
  ],
  providers: [VpnConfigurationService],
  controllers: [VpnConfigurationController],
  exports: [VpnConfigurationService],
})
export class VpnConfigurationModule {}
