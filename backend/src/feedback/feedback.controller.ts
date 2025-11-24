import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Roles('student')
  @Post('/add')
  create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @CurrentUser() user: any,
  ) {
    return this.feedbackService.create(createFeedbackDto, user?.id);
  }

  @Roles('admin')
  @Get()
  findAll() {
    return this.feedbackService.findAll();
  }

  // Removed: findOne, update, delete endpoints - not needed for this feedback system
}
