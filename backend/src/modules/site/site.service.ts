import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Site } from '../../entities/site.entity';
import { Client } from '../../entities/client.entity';

@Injectable()
export class SiteService {
  constructor(
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async findAll(): Promise<Site[]> {
    return await this.siteRepository.find({
      relations: ['client'],
      order: { site_name: 'ASC' },
    });
  }

  async findOne(siteId: string): Promise<Site> {
    const site = await this.siteRepository.findOne({
      where: { site_id: siteId },
      relations: ['client'],
    });

    if (!site) {
      throw new NotFoundException(`Site ${siteId} not found`);
    }

    return site;
  }

  async findByClient(clientId: string): Promise<Site[]> {
    const client = await this.clientRepository.findOne({
      where: { client_id: clientId },
    });
    if (!client) {
      throw new NotFoundException(`Client ${clientId} not found`);
    }

    return await this.siteRepository.find({
      where: { client_id: client.id },
      relations: ['client'],
      order: { site_name: 'ASC' },
    });
  }

  async create(siteData: Partial<Site>): Promise<Site> {
    // Verify client exists and get numeric ID
    const client = await this.clientRepository.findOne({
      where: { client_id: siteData.client_id as any },
    });
    if (!client) {
      throw new NotFoundException(`Client ${siteData.client_id} not found`);
    }

    const site = this.siteRepository.create({
      ...siteData,
      client_id: client.id,
    });
    return await this.siteRepository.save(site);
  }

  async update(siteId: string, siteData: Partial<Site>): Promise<Site> {
    const site = await this.findOne(siteId);
    Object.assign(site, siteData);
    return await this.siteRepository.save(site);
  }

  async delete(siteId: string): Promise<void> {
    const site = await this.findOne(siteId);
    await this.siteRepository.remove(site);
  }

  /**
   * Fuzzy match site by name or code
   */
  async findByFuzzyMatch(identifier: string): Promise<Site | null> {
    // Try exact match on site_id first
    const byId = await this.siteRepository.findOne({
      where: { site_id: identifier },
    });
    if (byId) return byId;

    // Try fuzzy match on name
    const byName = await this.siteRepository.findOne({
      where: { site_name: ILike(`%${identifier}%`) },
    });
    if (byName) return byName;

    // Try site code
    const byCode = await this.siteRepository.findOne({
      where: { site_code: identifier },
    });
    if (byCode) return byCode;

    return null;
  }
}

