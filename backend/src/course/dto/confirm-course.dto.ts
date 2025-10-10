import { IsNumber } from "class-validator";

export class ConfirmCourseDto {
    @IsNumber()
  id: number;
}
