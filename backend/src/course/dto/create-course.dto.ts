import { IsBoolean, IsNumber, IsString } from "class-validator";

export class CreateCourseDto {
    @IsNumber()
    id:number;
    @IsString()
    image_url:string;
    @IsString()
    title:string;
    @IsString()
    description:string;
    @IsString()
    price:string;
    @IsBoolean()
    open:boolean;
    @IsBoolean()
    enrolled:boolean;
    @IsString()
    no_lessons:string;
    @IsNumber()
    adminId:number;
  
   
    uploader:{
        id:number;
        name:string;
        avatar_url:string;
    }

}
