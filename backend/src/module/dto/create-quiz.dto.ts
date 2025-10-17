import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateQuizDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() description?: string;
  resourceId: number;
  @IsArray() questions: any[]; // we'll validate minimally here; client should send structured questions
  @IsObject() @IsOptional() settings?: Record<string, any>;
}
