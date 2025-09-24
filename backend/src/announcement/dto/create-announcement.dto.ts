import { IsEmail, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class PosterDto {
    @IsNotEmpty()
    posterId:string;
   
   
}

export class CreateAnnouncementDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @ValidateNested()
    @Type(() => PosterDto)
    @IsNotEmpty()
    poster: PosterDto;
}
