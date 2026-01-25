import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deployment } from '../../entities/deployment.entity';
import { Employee } from '../../entities/employee.entity';
import { Site } from '../../entities/site.entity';

@Injectable()
export class DeploymentService {
  constructor(
    @InjectRepository(Deployment)
    private deploymentRepository: Repository<Deployment>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
  ) {}

  async findAll(): Promise<Deployment[]> {
    return await this.deploymentRepository.find({
      relations: ['employee', 'site'],
      order: { from_date: 'DESC' },
    });
  }

  async findOne(deploymentId: string): Promise<Deployment> {
    const deployment = await this.deploymentRepository.findOne({
      where: { deployment_id: deploymentId },
      relations: ['employee', 'site'],
    });

    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    return deployment;
  }

  async findByEmployee(employeeId: string): Promise<Deployment[]> {
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee ${employeeId} not found`);
    }

    return await this.deploymentRepository.find({
      where: { employee_id: employee.id },
      relations: ['site'],
      order: { from_date: 'DESC' },
    });
  }

  async findBySite(siteId: string): Promise<Deployment[]> {
    const site = await this.siteRepository.findOne({
      where: { site_id: siteId },
    });
    if (!site) {
      throw new NotFoundException(`Site ${siteId} not found`);
    }

    return await this.deploymentRepository.find({
      where: { site_id: site.id },
      relations: ['employee'],
      order: { from_date: 'DESC' },
    });
  }

  async create(deploymentData: Partial<Deployment>): Promise<Deployment> {
    // Verify employee and site exist and get their numeric IDs
    const employee = await this.employeeRepository.findOne({
      where: { employee_id: deploymentData.employee_id as any },
    });
    if (!employee) {
      throw new NotFoundException(`Employee ${deploymentData.employee_id} not found`);
    }

    const site = await this.siteRepository.findOne({
      where: { site_id: deploymentData.site_id as any },
    });
    if (!site) {
      throw new NotFoundException(`Site ${deploymentData.site_id} not found`);
    }

    const deployment = this.deploymentRepository.create({
      ...deploymentData,
      employee_id: employee.id,
      site_id: site.id,
    });
    return await this.deploymentRepository.save(deployment);
  }

  async update(
    deploymentId: string,
    deploymentData: Partial<Deployment>,
  ): Promise<Deployment> {
    const deployment = await this.findOne(deploymentId);
    Object.assign(deployment, deploymentData);
    return await this.deploymentRepository.save(deployment);
  }

  async delete(deploymentId: string): Promise<void> {
    const deployment = await this.findOne(deploymentId);
    await this.deploymentRepository.remove(deployment);
  }
}

