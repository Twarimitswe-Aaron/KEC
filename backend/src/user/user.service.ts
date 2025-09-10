import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private readonly prisma:PrismaClient){}
    async findOne(email:string){
        return this.prisma.user.findUnique({where:{email}})

    }

    async hashPassword(password:string){
        return await bcrypt.hash(password,10);
    }
    

}
