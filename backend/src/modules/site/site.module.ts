import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { Site } from '../../entities/site.entity';
import { Client } from '../../entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Site, Client])],
  controllers: [SiteController],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}

