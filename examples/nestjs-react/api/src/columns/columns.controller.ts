import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ColumnQueryDto } from './dto/column-query.dto';
import { ColumnDto } from './dto/column.dto';

@ApiTags('Columns')
@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new column' })
  @ApiResponse({ status: 200, type: ColumnDto })
  create(@Body() createColumnDto: CreateColumnDto) {
    return this.columnsService.create(createColumnDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all columns with optional filters' })
  @ApiResponse({ status: 200, type: [ColumnDto] })
  getAll(@Query() query: ColumnQueryDto) {
    return this.columnsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a column by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ColumnDto })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.columnsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a column by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: ColumnDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateColumnDto: UpdateColumnDto,
  ) {
    return this.columnsService.update(id, updateColumnDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a column by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Column deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.columnsService.remove(id);
  }
}
