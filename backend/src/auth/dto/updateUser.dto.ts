export class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  profile?: {
    work?: string;
    education?: string;
    resident?: string;
    phone?: string;
    createdAt?: string;
    avatar?: string;
  };
}