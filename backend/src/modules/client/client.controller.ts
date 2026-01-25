import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { Client } from '../../entities/client.entity';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  async findAll() {
    return await this.clientService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.clientService.findOne(id);
  }

  @Post()
  async create(@Body() clientData: Partial<Client>) {
    return await this.clientService.create(clientData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() clientData: Partial<Client>,
  ) {
    return await this.clientService.update(id, clientData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.clientService.delete(id);
    return { message: 'Client deleted successfully' };
  }
}

