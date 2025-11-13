import { IsArray, IsNumber } from 'class-validator';

export class MarkMessagesReadDto {
  @IsArray()
  @IsNumber({}, { each: true })
  messageIds: number[];
}
