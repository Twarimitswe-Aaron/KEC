import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    let token = request.cookies?.["jwt_access"];
 

    if (!token && request.headers["authorization"]) {
      const authHeader = request.headers["authorization"];
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]; 
      }
    }
  

    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });
      if(payload.isEmailVerified===false){
        throw new UnauthorizedException("Please verify your email before logging in");
      }

     
      request["user"] = payload;
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      throw new UnauthorizedException("Invalid or expired token");
    }

    return true;
  }
}
