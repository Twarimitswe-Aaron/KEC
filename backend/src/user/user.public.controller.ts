import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserPublicController {
  constructor(private readonly userService: UserService) {}

  @Get('team-members')
  async getTeamMembers() {
    return this.userService.getTeamMembers();
  }
}
