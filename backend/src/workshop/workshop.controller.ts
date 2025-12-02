import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { WorkshopService } from './workshop.service';

@Controller('api/workshops')
export class WorkshopController {
  constructor(
    private readonly workshopService: WorkshopService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/workshops',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `workshop-${uniqueSuffix}.${ext}`);
        },
      }),
    }),
  )
  async create(
    @Body() body: { name: string; location: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file
      ? `${this.configService.get('BACKEND_URL')}/uploads/workshops/${file.filename}`
      : '';
    return this.workshopService.create(body.name, body.location, imageUrl);
  }

  @Get()
  async findAll() {
    return this.workshopService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workshopService.findOne(+id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/workshops',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `workshop-${uniqueSuffix}.${ext}`);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() body: { name: string; location: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file
      ? `${this.configService.get('BACKEND_URL')}/uploads/workshops/${file.filename}`
      : undefined;
    return this.workshopService.update(+id, body.name, body.location, imageUrl);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.workshopService.delete(+id);
  }
}
