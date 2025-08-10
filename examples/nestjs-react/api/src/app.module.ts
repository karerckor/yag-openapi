import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { CategoriesModule } from './categories/categories.module';
import { ColumnsModule } from './columns/columns.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    TasksModule,
    CategoriesModule,
    ColumnsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
