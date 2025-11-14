import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";
import { Role } from "@prisma/client";

export class CreateUserDto{
    @IsNotEmpty()
    @IsString()
    firstName:string;
    @IsNotEmpty()
    @IsString()
    lastName:string;
    @IsNotEmpty()
    @IsEmail()
    email:string;
    @IsNotEmpty()
    @MinLength(6)
    password:string;
    @IsNotEmpty()
    @IsEnum(Role)
    role:Role;
}