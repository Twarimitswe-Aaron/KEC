import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateModuleDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsOptional() description?: string;
  @IsNumber() @IsOptional() order?: number;
}
