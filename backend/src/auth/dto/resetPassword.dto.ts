import { IsEmail, IsString } from "class-validator";

export class ResetPassword{
    @IsString()
    password:string;

    @IsString()
    confirmPassword:string;

    @IsEmail()
    email:string;
}