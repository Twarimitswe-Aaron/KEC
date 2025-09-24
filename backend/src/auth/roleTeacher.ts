import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from "@nestjs/common";
  import { ConfigService } from "@nestjs/config";
  import { JwtService } from "@nestjs/jwt";
  import { Request } from "express";
  import { PrismaService } from "../prisma/prisma.service"; 
  
  @Injectable()
  export class RoleTeacherGuard implements CanActivate {
    constructor(
      private readonly jwtService: JwtService,
      private readonly prisma: PrismaService,
      private readonly configService: ConfigService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
  
     
      const token =
        request.cookies["jwt_access"] ;
      if (!token) {
        throw new UnauthorizedException("No token provided");
      }
  
  
      let decoded: any;
      try {
        decoded = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get("JWT_SECRET"),
        });
      } catch (err) {
        throw new UnauthorizedException("Invalid or expired token");
      }
  
    
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
      });
      if (!user) {
        throw new UnauthorizedException("User not found");
      }
  
     
      if (user.role !== "teacher") {
        throw new UnauthorizedException("Only teachers are allowed");
      }
  
      // Attach user to request (optional, useful in controllers)
      (request as any).user = user;
  
      return true;
    }
  
 
  }
  