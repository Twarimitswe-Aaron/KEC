import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleAdminGuard } from 'src/auth/roleAdmin.guard';
import { RoleTeacherGuard } from 'src/auth/roleTeacher';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('announcement')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  @Post()
  create(@Body() createAnnouncementDto: CreateAnnouncementDto) {
    return this.announcementService.create(createAnnouncementDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.announcementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.announcementService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ) {
    return this.announcementService.update(+id, updateAnnouncementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @Req() req) {
    const userId=req.sub;
    
    return this.announcementService.remove(id,userId);
  }
}
