import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class IsMeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.user; // comes from JWT strategy
    const paramId = request.params.id; // route parameter like /users/:id

    if (user.id !== paramId) {
      throw new ForbiddenException('You can only access your own data');
    }

    return true;
  }
}
