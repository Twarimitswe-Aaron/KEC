import { IsArray, IsBoolean, IsOptional, IsString, ArrayMinSize } from 'class-validator';

export class CreateChatDto {
  @IsArray()
  @ArrayMinSize(1)
  participantIds: number[];

  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  groupAvatar?: string;
}
