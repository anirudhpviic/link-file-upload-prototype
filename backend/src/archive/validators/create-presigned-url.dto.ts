import { IsNotEmpty, IsNumber, IsString } from '@nestjs/class-validator';

export class CreatePresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsNumber()
  @IsNotEmpty()
  totalChunks: number;
}
