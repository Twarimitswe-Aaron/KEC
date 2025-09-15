import { IsEmail, IsString } from "class-validator";

export class VerifyToken{
    @IsEmail()
    email:string;
    @IsString()
    code:string;

}