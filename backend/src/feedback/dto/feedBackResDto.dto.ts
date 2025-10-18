import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class feedBackResDto{
    @IsString()
    @IsNotEmpty()
    content:string

    @IsString()
    createdAt:string
    
    poster:{
        firstName:string
        lastName:string
        avatar:string
        email:string
    }

}