import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES_KEY } from './decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.cookies['jwt_access'];
    if (!token) {
      throw new UnauthorizedException();
    }
    let decoded: any;

    try {
      decoded = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException();
    }
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!requiredRoles.includes(user.role)) {
      throw new UnauthorizedException('Access denied');
    }
    (request as any).user = user;
    return true;
  }
}
