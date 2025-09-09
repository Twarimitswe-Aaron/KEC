import {IsEmail, isEmail, IsNotEmpty, MinLength} from 'class-validator'
export class CreateStudentDto{
    @IsEmail()
    email:string;

    @IsNotEmpty()
    @MinLength(8)
    password:string;

}