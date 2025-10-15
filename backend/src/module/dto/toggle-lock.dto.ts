import { IsBoolean } from 'class-validator';

export class ToggleLockDto {
  @IsBoolean()
  isUnlocked: boolean;
}
