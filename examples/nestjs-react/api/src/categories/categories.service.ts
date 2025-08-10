import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CategoryQueryDto } from './dto/category-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCategoryDto) {
    return this.prisma.category.create({ data });
  }

  findAll(query: CategoryQueryDto = {}) {
    const { skip, take, name, orderById } = query;
    return this.prisma.category.findMany({
      skip,
      take,
      where: name ? { name: { contains: name } } : undefined,
      orderBy: orderById ? { id: orderById } : undefined,
    });
  }

  findOne(id: number) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.category.delete({ where: { id } });
  }
}
