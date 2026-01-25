import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductivityService } from './productivity.service';

@Controller('productivity')
export class ProductivityController {
  constructor(private readonly productivityService: ProductivityService) {}

  @Post('calculate')
  async calculateProductivity(
    @Body()
    body: {
      employeeId: string;
      siteId: string;
      year: number;
      month: number;
      productivityRate: number;
    },
  ) {
    return await this.productivityService.calculateProductivity(
      body.employeeId,
      body.siteId,
      body.year,
      body.month,
      body.productivityRate,
    );
  }

  @Get('employee/:employeeId/site/:siteId')
  async getProductivity(
    @Param('employeeId') employeeId: string,
    @Param('siteId') siteId: string,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return await this.productivityService.getProductivity(
      employeeId,
      siteId,
      year,
      month,
    );
  }

  @Get('site/:siteId')
  async getProductivityForSite(
    @Param('siteId') siteId: string,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return await this.productivityService.getProductivityForSite(
      siteId,
      year,
      month,
    );
  }
}

