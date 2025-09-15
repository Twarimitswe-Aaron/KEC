import { IsEmail, IsString } from "class-validator";

export class ResetKnownPassDto{
    @IsEmail()
    email:string;

    @IsString()
    password:string;

    @IsString()
    confirmPassword:string
}