import { IsString, IsNotEmpty, IsNumber, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsString()
  @IsOptional()
  country?: string;
}

export class InitiatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;
}
