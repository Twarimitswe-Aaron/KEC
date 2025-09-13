import { IsEmail } from "class-validator";



export class ForgotPass{
@IsEmail()
email:string;




}