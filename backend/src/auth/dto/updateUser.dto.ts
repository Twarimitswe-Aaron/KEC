export class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  profile?: {
    work?: string;
    education?: string;
    phone?: string;
    dateOfBirth?: string;
    avatar?: string;
    province?: string;
    district?: string;
    sector?: string;
  };
}