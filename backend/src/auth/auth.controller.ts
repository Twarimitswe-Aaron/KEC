import { BadRequestException, Controller, Get, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService:ConfigService) {}

  @Get('verify')
  async verifyEmail(@Query('token') token:string, @Res() res:Response){
    if(!token){
      throw new BadRequestException("Invalid verification link");
    }
     this.authService.verifyEmail(token)
     return res.redirect(`${this.configService.get("FRONTEND_URL")}/dashboard`)
  }
}
