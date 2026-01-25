import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { TradeCategoryService } from './trade-category.service';
import { TradeCategory } from '../../entities/trade-category.entity';

@Controller('trade-categories')
export class TradeCategoryController {
  constructor(private readonly tradeCategoryService: TradeCategoryService) {}

  @Get()
  async findAll() {
    return await this.tradeCategoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.tradeCategoryService.findOne(id);
  }

  @Post()
  async create(@Body() categoryData: Partial<TradeCategory>) {
    return await this.tradeCategoryService.create(categoryData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() categoryData: Partial<TradeCategory>,
  ) {
    return await this.tradeCategoryService.update(id, categoryData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.tradeCategoryService.delete(id);
    return { message: 'Trade category deleted successfully' };
  }

  @Post('initialize')
  async initializeDefaults() {
    await this.tradeCategoryService.initializeDefaultCategories();
    return { message: 'Default trade categories initialized' };
  }
}

