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
import { DeploymentService } from './deployment.service';
import { Deployment } from '../../entities/deployment.entity';

@Controller('deployments')
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Get()
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('siteId') siteId?: string,
  ) {
    if (employeeId) {
      return await this.deploymentService.findByEmployee(employeeId);
    }
    if (siteId) {
      return await this.deploymentService.findBySite(siteId);
    }
    return await this.deploymentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.deploymentService.findOne(id);
  }

  @Post()
  async create(@Body() deploymentData: Partial<Deployment>) {
    return await this.deploymentService.create(deploymentData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() deploymentData: Partial<Deployment>,
  ) {
    return await this.deploymentService.update(id, deploymentData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deploymentService.delete(id);
    return { message: 'Deployment deleted successfully' };
  }
}

