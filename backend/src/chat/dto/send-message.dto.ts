import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';

enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  LINK = 'LINK'
}

export class SendMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsEnum(MessageType)
  messageType: MessageType;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  fileMimeType?: string;
}
