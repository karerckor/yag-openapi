import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { TaskQueryDto } from './dto/task-query.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTaskDto) {
    return this.prisma.task.create({ data });
  }

  findAll(query: TaskQueryDto = {}) {
    const { skip, take, title, orderByDate } = query;
    return this.prisma.task.findMany({
      skip,
      take,
      where: title ? { title: { contains: title } } : undefined,
      orderBy: orderByDate ? { createdAt: orderByDate } : undefined,
    });
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateTaskDto) {
    return this.prisma.task.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }
}
