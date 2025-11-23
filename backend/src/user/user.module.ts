import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserPublicController } from './user.public.controller';

@Module({
  controllers: [UserController, UserPublicController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
