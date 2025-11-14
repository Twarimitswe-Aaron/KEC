import { IsString, IsNotEmpty } from 'class-validator';

export class EditMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
