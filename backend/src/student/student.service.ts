import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt'
import {CreateStudentDto} from './dto/create-student.dto'

@Injectable()
export class StudentService {
    
    constructor(private readonly prisma: PrismaClient) {}
    async createStudent( dto:CreateStudentDto){
        const {email,password}=dto
        try {
         if(password.length<8){
             throw new BadRequestException("Password must be at least 8 characters long")
         }

         const hashedPassword=await bcrypt.hash(password,10);
         const student =await this.prisma.student.create({
            data:{
                user:{
                    create: {
                        email,
                        password:hashedPassword,
                        role: Role.student
                    }
                }
            },
            include:{user:true}
         })
         return {message:"account was created successfully"}
        
        
     } catch (error) {
         if(error.code==="P2002"){
             throw new BadRequestException("Email already exists")
         }
         throw new InternalServerErrorException("Something went wrong")
     }

    
    
    }
}
