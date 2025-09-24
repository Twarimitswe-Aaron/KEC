import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly roles = ['admin', 'teacher'];
 constructor(
    private readonly jwtService:JwtService,
    private readonly prisma:PrismaService,
    private readonly configService:ConfigService,
    
 ){}

 async canActivate(context: ExecutionContext):   Promise<boolean> {
     const request=context.switchToHttp().getRequest();
     const token=request.cookies['jwt_access']
     if(!token){
        throw new UnauthorizedException();
     }
     let decoded:any;

     try {
         decoded=await this.jwtService.verifyAsync(token,{secret:this.configService.get('JWT_SECRET')});
        
     } catch (error) {
        throw new UnauthorizedException();
        
     }
     const user=await this.prisma.user.findUnique({where:{id:decoded.sub}});
     if(!user){
        throw new UnauthorizedException();
     }
     if(!this.roles.includes(user.role)){
        throw new UnauthorizedException("Access denied");
     }
     (request as any).user=user;
     return true;
 }
}