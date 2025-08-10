import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { ColumnQueryDto } from './dto/column-query.dto';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateColumnDto) {
    return this.prisma.column.create({ data });
  }

  findAll(query: ColumnQueryDto = {}) {
    const { skip, take, name, orderById } = query;
    return this.prisma.column.findMany({
      skip,
      take,
      where: name ? { name: { contains: name } } : undefined,
      orderBy: orderById ? { id: orderById } : undefined,
    });
  }

  findOne(id: number) {
    return this.prisma.column.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateColumnDto) {
    return this.prisma.column.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.column.delete({ where: { id } });
  }
}
