import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateQuizDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() description?: string;
  @IsArray() questions: any[]; // we'll validate minimally here; client should send structured questions
}
