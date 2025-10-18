import {IsEmail, isEmail, IsNotEmpty, MinLength} from 'class-validator'
export class CreateStudentDto{
    @IsNotEmpty()
    firstName:string;

    @IsNotEmpty()
    lastName:string;

    @IsNotEmpty()
    @IsEmail()
    email:string;

    @IsNotEmpty()
    @MinLength(6)
    password:string;

    @IsNotEmpty()
    confirmPassword:string;

  

    

}