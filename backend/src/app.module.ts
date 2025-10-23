import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseMainModule } from './database/main.module';
import { DatabaseRadiusModule } from './database/radius.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { VpnConfigurationModule } from './vpn-configuration/vpn-configuration.module';
import { RadCheckModule } from './radcheck/radcheck.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    DatabaseMainModule,
    DatabaseRadiusModule,
    AuthModule,
    UserModule,
    SubscriptionModule,
    VpnConfigurationModule,
    RadCheckModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
