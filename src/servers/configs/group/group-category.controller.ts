import {
  Controller,
  UseGuards,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
  Post,
  Param,
  Body,
  ValidationPipe,
  ParseIntPipe,
  Patch,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ServerRolesGuard, ServerRoles } from '../../guards/server-roles.guard';
import {
  appSerializeOptions,
  appValidationPipeOptions,
} from '../../../shared/constants';
import { GroupCategoryService } from './group-category.service';
import { GroupCategory } from './group-category.entity';
import { SetServerRoles } from '../../decorators/set-server-roles.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryFiltersDto } from './dto/category-filters.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('/servers/:server/configs/groups')
@UseGuards(JwtAuthGuard, ServerRolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions(appSerializeOptions)
export class GroupCategoryController {
  constructor(private categoryService: GroupCategoryService) {}

  @Get()
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
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
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  getCategoryById(
    @Param('server', ParseIntPipe) serverId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<GroupCategory> {
    return this.categoryService.getCategoryById(
      { id, serverId },
      true,
    );
  }

  @Post()
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  createCategory(
    @Param('server', ParseIntPipe) serverId: number,
    @Body(new ValidationPipe(appValidationPipeOptions)) dto: CreateCategoryDto,
  ): Promise<GroupCategory> {
    return this.categoryService.createCategory(serverId, dto);
  }

  @Patch('/:id')
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe(appValidationPipeOptions)) dto: UpdateCategoryDto,
  ): Promise<GroupCategory> {
    return this.categoryService.updateCategory(id, dto);
  }

  @Delete('/:id')
  @SetServerRoles({
    idParam: 'server',
    roles: [ServerRoles.OWNER],
  })
  deleteCategory(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoryService.deleteCategory(id);
  }
}