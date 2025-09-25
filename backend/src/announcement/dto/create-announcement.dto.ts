import { IsInt, IsNotEmpty, IsString } from "class-validator";



export class CreateAnnouncementDto {
    body:body
}

class body{
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsInt()
    posterId: number;

}
