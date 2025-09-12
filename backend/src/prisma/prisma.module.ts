import { Module,Global } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';


@Global()
@Module({
    providers:[
        {
            provide:PrismaClient,
            useValue:new PrismaClient()
        },
        PrismaService
    ],
    
    exports:[PrismaClient]
})
export class PrismaModule {}
