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

   
    @IsNumber()
    adminId:number;
  
   
    uploader:{
        id:number;
    
    }

}
