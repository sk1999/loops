import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradeCategoryController } from './trade-category.controller';
import { TradeCategoryService } from './trade-category.service';
import { TradeCategory } from '../../entities/trade-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TradeCategory])],
  controllers: [TradeCategoryController],
  providers: [TradeCategoryService],
  exports: [TradeCategoryService],
})
export class TradeCategoryModule {}

