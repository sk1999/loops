import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../entities/client.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async findAll(): Promise<Client[]> {
    return await this.clientRepository.find({
      order: { company_name: 'ASC' },
    });
  }

  async findOne(clientId: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { client_id: clientId },
      relations: ['sites'],
    });

    if (!client) {
      throw new NotFoundException(`Client ${clientId} not found`);
    }

    return client;
  }

  async create(clientData: Partial<Client>): Promise<Client> {
    const client = this.clientRepository.create(clientData);
    return await this.clientRepository.save(client);
  }

  async update(
    clientId: string,
    clientData: Partial<Client>,
  ): Promise<Client> {
    const client = await this.findOne(clientId);
    Object.assign(client, clientData);
    return await this.clientRepository.save(client);
  }

  async delete(clientId: string): Promise<void> {
    const client = await this.findOne(clientId);
    await this.clientRepository.remove(client);
  }
}

