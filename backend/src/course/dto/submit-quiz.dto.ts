import { IsArray, IsNotEmpty } from 'class-validator';

export class SubmitQuizDto {
  @IsArray() @IsNotEmpty() responses: any[]; // array of { questionId, answer }
}
