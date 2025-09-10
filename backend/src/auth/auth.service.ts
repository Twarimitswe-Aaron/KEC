import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(private readonly prisma:PrismaClient){}

    async verifyEmail(token:string){
        const user=await this.prisma.user.findFirst({
            where:{verificationToken:token}
        });

        if(!user){
            throw new BadRequestException("Invalid or expired verification link");
        }

        if(user.tokenExpiresAt && user.tokenExpiresAt <new Date()){
            await this.prisma.user.delete({where:{id:user.id}});
            throw new BadRequestException("Verification link has expired. Please register again.");
        }

        await this.prisma.user.update({
            where:{id:user.id},
            data:{
                isEmailVerified:true,
                verificationToken:null,
                tokenExpiresAt:null
            }
        })
    }
}
