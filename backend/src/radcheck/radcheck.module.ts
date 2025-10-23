import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RadCheck } from './radcheck.entity';
import { RadCheckService } from './radcheck.service';

@Module({
  imports: [TypeOrmModule.forFeature([RadCheck], 'radius')],
  providers: [RadCheckService],
  exports: [RadCheckService],
})
export class RadCheckModule {}
