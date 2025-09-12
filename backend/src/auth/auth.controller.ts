import { BadRequestException, Body, Controller, Get, HttpStatus, Post, Query, Res, HttpCode, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { Request as ExpressRequest } from 'express';
import { AuthGuard } from './auth.guard';
import { LoginDto } from './dto/login.dto';

import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';



@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, 
    private readonly configService: ConfigService,
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto:LoginDto, @Res({passthrough:true}) res:Response){
    const { access_token,refresh_token } = await this.authService.Login(signInDto.email, signInDto.password);
    try {
      const user=await this.prisma.user.findUnique({
        where:{email:signInDto.email}
      })
      if(!user){
        throw new BadRequestException("Login failed")
      }
  
      res.cookie('jwt_access', access_token,{
        httpOnly:true,
        secure:this.configService.get("NODE_ENV")==='production',
        sameSite:'strict',
        path:'/'
      })
  
      res.cookie("jwt_refresh", refresh_token,{
        httpOnly:true,
        secure:this.configService.get("NODE_ENV")==='production',
        sameSite:'strict',
        path:'/'
      })
  
      return {id:user.id, firstName:user.firstName, lastName:user.lastName, email:user.email, role:user.role};
      
    } catch (error) {
      throw new BadRequestException("Login failed")
      
    }
  }

  @Get('me')
  async me(@Request() req:ExpressRequest){
    try{
      const token=req.cookies['jwt_access'];
      if(!token){
        throw new BadRequestException("No access token provided")
      }
      const decoded=await this.jwtService.verifyAsync(token,{
        secret:this.configService.get("JWT_SECRET")
      })

      const user=await this.prisma.user.findUnique({
        where :{id:decoded.sub},
      })

      return user;

      
    }catch(error){
      throw new BadRequestException("Invalid token")
    }
  }

  @UseGuards(AuthGuard)
  @Get('Dashboard')
  getDashboard(@Request() req){
    return req.user
  }

  @Post('refresh')
  async refresh(@Res({passthrough:true}) res:Response, @Request() req:ExpressRequest){
    const refresh_token=req.cookies['jwt_refresh']
    if(!refresh_token){
      throw new BadRequestException("No refresh token provided")

    }

    const {access_token}=await this.authService.refreshToken(refresh_token)
    res.cookie('jwt_access', access_token,{
      httpOnly:true,
      secure:this.configService.get("NODE_ENV")==='production',
      sameSite:'strict',
      path:'/'
    })
  }

  @Get('verify')
  async verifyEmail(@Query('token') token:string, @Res() res:Response){
    if(!token){
      throw new BadRequestException("Invalid verification link");
    }
     try {
      await this.authService.verifyEmail(token)
     return res.redirect(`${this.configService.get("FRONTEND_URL")}/dashboard`)
     } catch (error) {
      return res.redirect(`${this.configService.get('FRONTEND_URL')}/verification-failed`);
     }
  }
}
