import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateQuizDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() description?: string;
  resourceId: number;
  @IsArray() questions: any[]; 
  @IsObject() @IsOptional() settings?: Record<string, any>;
}
