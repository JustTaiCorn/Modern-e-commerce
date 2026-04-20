import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  bio: string;

  @Expose()
  profile_img: string | null;

  @Expose()
  isVerified: boolean;

  @Expose()
  created_at: Date;

  @Expose()
  roles: string[];
}
