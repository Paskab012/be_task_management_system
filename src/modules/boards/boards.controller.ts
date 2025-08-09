import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateBoardDto, UpdateBoardDto } from './dtos';
import { JwtAuthGuard, RolesGuard, PermissionsGuard } from '@/common/guards';
import { Roles, CurrentUser, Public } from '@/common/decorators';
import { Board } from '@/database/models';
import { ApiResponse as ApiResponseType } from '@/common/helpers/response.helper';
import { AuthenticatedUser } from '@/modules/auth/interfaces';
import { BoardVisibility, BoardStatus } from '@/common/enums';

@ApiTags('Boards')
@Controller('boards')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new board (Admin/Super Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Board created successfully',
  })
  async createBoard(
    @Body() createBoardDto: CreateBoardDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<Board>> {
    console.log('🎯 CREATE BOARD CONTROLLER REACHED');
    return this.boardsService.createBoard(createBoardDto, currentUser);
  }

  @Get()
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({ summary: 'Get all boards with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'project' })
  @ApiQuery({
    name: 'visibility',
    required: false,
    enum: BoardVisibility,
    example: BoardVisibility.PUBLIC,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BoardStatus,
    example: BoardStatus.ACTIVE,
  })
  async getAllBoards(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('visibility') visibility?: BoardVisibility,
    @Query('status') status?: BoardStatus,
    @CurrentUser() currentUser?: AuthenticatedUser,
  ): Promise<ApiResponseType<Board[]>> {
    return this.boardsService.getAllBoards(
      parseInt(page),
      parseInt(limit),
      search,
      visibility,
      status,
      currentUser,
    );
  }

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public boards (No authentication required)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'project' })
  async getPublicBoards(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ): Promise<ApiResponseType<Board[]>> {
    return this.boardsService.getPublicBoards(
      parseInt(page),
      parseInt(limit),
      search,
    );
  }

  @Get(':id')
  @Roles('super_admin', 'admin', 'user')
  @ApiOperation({ summary: 'Get board by ID' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  async getBoardById(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<Board>> {
    return this.boardsService.getBoardById(id, currentUser);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update board by ID (Admin/Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  async updateBoard(
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<Board>> {
    console.log('🎯 UPDATE BOARD CONTROLLER REACHED');
    return this.boardsService.updateBoard(id, updateBoardDto, currentUser);
  }

  @Delete(':id')
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete board by ID (Admin/Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  async deleteBoard(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<void>> {
    return this.boardsService.deleteBoard(id, currentUser);
  }

  @Patch(':id/toggle-status')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Toggle board status (Admin/Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Board ID' })
  async toggleBoardStatus(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ApiResponseType<Board>> {
    return this.boardsService.toggleBoardStatus(id, currentUser);
  }
}
