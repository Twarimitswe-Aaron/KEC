import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  ConflictException,
  UnauthorizedException,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@UseGuards(AuthGuard)
@Roles('admin')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const existUser = await this.userService.findOne(createUserDto.email);
    if (existUser) {
      throw new ConflictException('User already exists');
    }
    return this.userService.createUser(createUserDto);
  }

  @Get('findAll')
  async getAll() {
    return this.userService.findAll();
  }

  @Get('team-members')
  async getTeamMembers() {
    return this.userService.getTeamMembers();
  }

  @Get(':id/details')
  async getUserDetails(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserDetails(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(parseInt(id));
  }
}
