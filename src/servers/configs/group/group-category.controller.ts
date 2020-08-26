import {
  Controller,
  UseGuards,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Patch,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ServerRolesGuard, ServerRoles } from '../../guards/server-roles.guard';
import { appSerializeOptions } from '../../../shared/constants';
import { GroupCategoryService } from './group-category.service';
import { GroupCategory } from './group-category.entity';
import { SetServerRoles } from '../../decorators/set-server-roles.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryFiltersDto } from './dto/category-filters.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('/servers/:server/configs/groups')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@SetServerRoles([ServerRoles.OWNER])
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class GroupCategoryController {
  constructor(private categoryService: GroupCategoryService) {}

  @Get()
  getAllCategories(
    @Param('server', ParseIntPipe) serverId: number,
    @Query() filters: CategoryFiltersDto,
  ): Promise<GroupCategory[]> {
    return this.categoryService.getAllCategoriesByServer(
      serverId,
      filters.withGroups,
    );
  }

  @Get('/:id')
  getCategoryById(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GroupCategory> {
    return this.categoryService.getCategoryById({ id, serverId }, true);
  }

  @Post()
  createCategory(
    @Param('server', ParseIntPipe) serverId: number,
    @Body() dto: CreateCategoryDto,
  ): Promise<GroupCategory> {
    return this.categoryService.createCategory(serverId, dto);
  }

  @Patch('/:id')
  updateCategory(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ): Promise<GroupCategory> {
    return this.categoryService.updateCategory(id, serverId, dto);
  }

  @Delete('/:id')
  deleteCategory(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.categoryService.deleteCategory({ id, serverId });
  }
}
