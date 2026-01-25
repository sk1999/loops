import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { SiteService } from './site.service';
import { Site } from '../../entities/site.entity';

@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get()
  async findAll(@Query('clientId') clientId?: string) {
    if (clientId) {
      return await this.siteService.findByClient(clientId);
    }
    return await this.siteService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.siteService.findOne(id);
  }

  @Post()
  async create(@Body() siteData: Partial<Site>) {
    return await this.siteService.create(siteData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() siteData: Partial<Site>) {
    return await this.siteService.update(id, siteData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.siteService.delete(id);
    return { message: 'Site deleted successfully' };
  }
}

