import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';
import { Deployment } from '../../entities/deployment.entity';
import { Employee } from '../../entities/employee.entity';
import { Site } from '../../entities/site.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Deployment, Employee, Site])],
  controllers: [DeploymentController],
  providers: [DeploymentService],
  exports: [DeploymentService],
})
export class DeploymentModule {}

