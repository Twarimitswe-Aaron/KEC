import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CleanupService {
    constructor(private readonly prisma:PrismaClient){}

    @Cron(CronExpression.EVERY_MINUTE)
    async removeExpiredUnverifiedUsers(){
        const result=await this.prisma.user.deleteMany({
            where:{
                isEmailVerified:false,
                tokenExpiresAt:{lt:new Date()}
            }
        })

        if(result.count>0){
            console.log(`Removed ${result.count} expired unverified users`);
        }
    }
}
