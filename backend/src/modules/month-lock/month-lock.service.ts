import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthLock } from '../../entities/month-lock.entity';

@Injectable()
export class MonthLockService {
  constructor(
    @InjectRepository(MonthLock)
    private monthLockRepository: Repository<MonthLock>,
  ) {}

  async isMonthLocked(year: number, month: number): Promise<boolean> {
    const lock = await this.monthLockRepository.findOne({
      where: { year, month },
    });
    return lock?.is_locked || false;
  }

  async lockMonth(
    year: number,
    month: number,
    lockedBy: string,
  ): Promise<MonthLock> {
    let lock = await this.monthLockRepository.findOne({
      where: { year, month },
    });

    if (lock && lock.is_locked) {
      throw new ConflictException(
        `Month ${year}-${month.toString().padStart(2, '0')} is already locked`,
      );
    }

    if (!lock) {
      lock = this.monthLockRepository.create({ year, month });
    }

    lock.is_locked = true;
    lock.locked_by = lockedBy;
    lock.locked_at = new Date();
    lock.unlocked_by = null;
    lock.unlock_reason = null;
    lock.unlocked_at = null;

    return await this.monthLockRepository.save(lock);
  }

  async unlockMonth(
    year: number,
    month: number,
    unlockedBy: string,
    reason: string,
  ): Promise<MonthLock> {
    const lock = await this.monthLockRepository.findOne({
      where: { year, month },
    });

    if (!lock || !lock.is_locked) {
      throw new ConflictException(
        `Month ${year}-${month.toString().padStart(2, '0')} is not locked`,
      );
    }

    lock.is_locked = false;
    lock.unlocked_by = unlockedBy;
    lock.unlock_reason = reason;
    lock.unlocked_at = new Date();

    return await this.monthLockRepository.save(lock);
  }

  async getMonthLock(year: number, month: number): Promise<MonthLock | null> {
    return await this.monthLockRepository.findOne({
      where: { year, month },
    });
  }

  async getAllLocks(): Promise<MonthLock[]> {
    return await this.monthLockRepository.find({
      order: { year: 'DESC', month: 'DESC' },
    });
  }
}

