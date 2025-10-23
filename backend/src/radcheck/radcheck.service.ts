import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RadCheck } from './radcheck.entity';

@Injectable()
export class RadCheckService {
  constructor(
    @InjectRepository(RadCheck, 'radius')
    private readonly radcheckRepo: Repository<RadCheck>,
  ) {}

  async addCleartextPassword(username: string, password: string) {
    const entry = this.radcheckRepo.create({
      username: username,
      attribute: 'Password-Cleartext',
      op: ':=',
      value: password,
    });
    return await this.radcheckRepo.save(entry);
  }

  async deleteCleartextPassword(username: string) {
    return await this.radcheckRepo.delete({
      username: username,
      attribute: 'Password-Cleartext',
      op: ':=',
    });
  }

  async findByUsername(username: string) {
    return await this.radcheckRepo.find({
      where: { username: username, attribute: 'Cleartext-Password' },
    });
  }
}
