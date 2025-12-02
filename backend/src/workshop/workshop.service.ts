import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkshopService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, location: string, imageUrl: string) {
    return this.prisma.workshop.create({
      data: {
        name,
        location,
        image: imageUrl,
      },
    });
  }

  async findAll() {
    const workshops = await this.prisma.workshop.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform response to match frontend expectations (image -> imageUrl)
    return workshops.map((workshop) => ({
      ...workshop,
      imageUrl: workshop.image,
    }));
  }

  async findOne(id: number) {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id },
    });

    if (!workshop) {
      throw new NotFoundException(`Workshop with ID ${id} not found`);
    }

    // Transform response to match frontend expectations
    return {
      ...workshop,
      imageUrl: workshop.image,
    };
  }

  async update(id: number, name: string, location: string, imageUrl?: string) {
    const workshop = await this.findOne(id);

    return this.prisma.workshop.update({
      where: { id },
      data: {
        name,
        location,
        ...(imageUrl && { image: imageUrl }),
      },
    });
  }

  async delete(id: number) {
    const workshop = await this.findOne(id);

    return this.prisma.workshop.delete({
      where: { id },
    });
  }
}
