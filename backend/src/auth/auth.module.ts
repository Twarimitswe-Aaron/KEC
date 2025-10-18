import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthGuard } from './auth.guard';


@Module({
  imports:[
    UserModule,
    PrismaModule,
    JwtModule.register({
      global:true,
      secret: new ConfigService().get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '1h' },
    })

  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports:[AuthService]
})
export class AuthModule {}
