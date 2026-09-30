import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'johndoe', minLength: 3, maxLength: 128 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(128)
  username?: string;

  @ApiPropertyOptional({ example: 'I am a developer' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  profile_img?: string;
}
