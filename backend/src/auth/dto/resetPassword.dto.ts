import { IsEmail, IsString } from "class-validator";

export class ResetPassword{
    @IsEmail()
    email:string;
    @IsString()
    password:string;

    @IsString()
    confirmPassword:string;

   
}