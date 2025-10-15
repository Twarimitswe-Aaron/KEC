import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

export class CreateVideoDto {
  @IsUrl() url: string;
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() duration?: string;
}
