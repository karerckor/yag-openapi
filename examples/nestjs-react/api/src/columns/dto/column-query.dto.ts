import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ColumnQueryDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Number of records to skip',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  skip?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Number of records to take',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  take?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by name (contains)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], description: 'Order by id' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  orderById?: 'asc' | 'desc';
}
