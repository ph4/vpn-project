import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User, 'main')
    private readonly userRepo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  findByUsername(username: string) {
    return this.userRepo.findOne({ where: { username } });
  }

  findById(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  async create(userData: Partial<User>) {
    const user = this.userRepo.create(userData);
    return await this.userRepo.save(user);
  }

  async updateLastLogin(id: number) {
    await this.userRepo.update(id, { updated_at: new Date() });
  }
}
