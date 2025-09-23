export class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  profile?: {
    Work?: string;
    Education?: string;
    resident?: string;
    phone?: string;
    createdAt?: string;
    avatar?: string;
  };
}