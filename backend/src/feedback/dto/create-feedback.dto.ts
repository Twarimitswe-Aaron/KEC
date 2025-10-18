import { IsNumber, IsString } from "class-validator";

export class CreateFeedbackDto {
    @IsNumber()
    posterId:number

    @IsString()
    content:string
}
