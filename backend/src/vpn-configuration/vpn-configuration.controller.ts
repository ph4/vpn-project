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
import { VpnConfigurationService } from './vpn-configuration.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators';
import { User } from '../user/user.entity';

class CreateVpnConfigDto {
  description?: string;
}

@Controller('vpn-configurations')
@UseGuards(JwtAuthGuard)
export class VpnConfigurationController {
  constructor(private readonly vpnConfigService: VpnConfigurationService) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateVpnConfigDto) {
    return await this.vpnConfigService.create(user.id, dto.description);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    return await this.vpnConfigService.findByUserId(user.id);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const config = await this.vpnConfigService.findById(id);

    // Ensure user owns this configuration
    if (config.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    return config;
  }

  @Patch(':id/activate')
  async activate(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const config = await this.vpnConfigService.findById(id);

    if (config.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    return await this.vpnConfigService.activate(id);
  }

  @Patch(':id/deactivate')
  async deactivate(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const config = await this.vpnConfigService.findById(id);

    if (config.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    return await this.vpnConfigService.deactivate(id);
  }

  @Patch(':id/regenerate-password')
  async regeneratePassword(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const config = await this.vpnConfigService.findById(id);

    if (config.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    return await this.vpnConfigService.regeneratePassword(id);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const config = await this.vpnConfigService.findById(id);

    if (config.user_id !== user.id) {
      throw new Error('Unauthorized');
    }

    await this.vpnConfigService.delete(id);

    return { message: 'Configuration deleted successfully' };
  }
}
