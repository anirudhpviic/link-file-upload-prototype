import { IsArray, IsNotEmpty, IsString, ValidateNested } from "@nestjs/class-validator";
import { Type } from "class-transformer";

class UploadPart {
    @IsNotEmpty()
    PartNumber: number;

    @IsString()
    @IsNotEmpty()
    ETag: string;
}

export class CompleteFileUploadDto {
    @IsString()
    @IsNotEmpty()
    fileName: string;

    @IsString()
    @IsNotEmpty()
    uploadId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UploadPart)
    parts: UploadPart[];
}
