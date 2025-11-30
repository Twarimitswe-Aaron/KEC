import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(AuthGuard)
  @Post()
  async submitRating(
    @Request() req,
    @Body() body: { score: number; feedback?: string },
  ) {
    return this.ratingService.createRating(
      req.user.id,
      body.score,
      body.feedback,
    );
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMyRating(@Request() req) {
    return this.ratingService.getRating(req.user.id);
  }
}
