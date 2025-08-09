/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Board } from '@/database/models';
import { CreateBoardDto, UpdateBoardDto } from './dtos';
import { ResponseHelper } from '@/common/helpers/response.helper';
import { ApiResponse } from '@/common/helpers/response.helper';
import { v4 as uuidv4 } from 'uuid';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { BoardVisibility, BoardStatus, RoleType } from '@/common/enums';
import { AuthenticatedUser } from '@/modules/auth/interfaces';

@Injectable()
export class BoardsService {
  constructor(private readonly responseHelper: ResponseHelper) {}

  async createBoard(
    createBoardDto: CreateBoardDto,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<Board>> {
    console.log('🚀 CREATE BOARD SERVICE REACHED');
    console.log('📝 DTO received:', createBoardDto);
    console.log('👤 Current user:', currentUser.email);

    try {
      const whereCondition: WhereOptions<Board> = {
        name: createBoardDto.name,
        createdById: currentUser.id,
      };

      if (createBoardDto.organizationId) {
        whereCondition.organizationId = createBoardDto.organizationId;
      }

      const existingBoard = await Board.findOne({
        where: whereCondition,
      });

      if (existingBoard) {
        throw new ConflictException('Board with this name already exists');
      }

      const board = await Board.create({
        id: uuidv4(),
        name: createBoardDto.name,
        description: createBoardDto.description,
        visibility: createBoardDto.visibility ?? BoardVisibility.PRIVATE,
        status: createBoardDto.status ?? BoardStatus.ACTIVE,
        color: createBoardDto.color || undefined,
        icon: createBoardDto.icon ?? undefined,
        settings: createBoardDto.settings ?? {},
        position: createBoardDto.position ?? undefined,
        organizationId: createBoardDto.organizationId ?? undefined,
        createdById: currentUser.id,
      });

      console.log('✅ Board created successfully:', board.id);

      return this.responseHelper.success<Board>({
        message: 'Board created successfully',
        response: board,
      });
    } catch (error) {
      console.log('💥 CREATE BOARD ERROR:', error);

      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create board');
    }
  }

  async getAllBoards(
    page: number = 1,
    limit: number = 10,
    search?: string,
    visibility?: BoardVisibility,
    status?: BoardStatus,
    currentUser?: AuthenticatedUser,
  ): Promise<ApiResponse<Board[]>> {
    try {
      const offset = (page - 1) * limit;

      const queryOptions: FindAndCountOptions<Board> = {
        include: [
          {
            association: 'createdBy',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            association: 'organization',
            attributes: ['id', 'name'],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      };

      // Build where conditions
      const whereConditions: WhereOptions<Board> = {};

      // Search functionality
      if (search) {
        whereConditions[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      // Filter by visibility
      if (visibility) {
        whereConditions.visibility = visibility;
      }

      // Filter by status
      if (status) {
        whereConditions.status = status;
      } else {
        // By default, exclude deleted boards
        whereConditions.status = { [Op.ne]: BoardStatus.DELETED };
      }

      // Apply RBAC: Users can only see public boards and their own boards
      if (currentUser && currentUser.role === RoleType.USER) {
        const accessConditions: WhereOptions<Board>[] = [
          { visibility: BoardVisibility.PUBLIC },
          { createdById: currentUser.id },
        ];

        if (currentUser.organizationId) {
          accessConditions.push({
            visibility: BoardVisibility.ORGANIZATION,
            organizationId: currentUser.organizationId,
          });
        }

        whereConditions[Op.or] = accessConditions;
      }

      queryOptions.where = whereConditions;

      const { count, rows: boards } = await Board.findAndCountAll(queryOptions);
      const totalPages = Math.ceil(count / limit);

      return this.responseHelper.success<Board[]>({
        message: 'Boards retrieved successfully',
        response: boards,
        pagination: {
          pages: totalPages,
          page,
          count,
          perPage: limit,
        },
      });
    } catch (error) {
      console.log('error :>> ', error);
      throw new BadRequestException('Failed to retrieve boards');
    }
  }

  async getBoardById(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<Board>> {
    try {
      const board = await Board.findOne({
        where: { id },
        include: [
          {
            association: 'createdBy',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            association: 'organization',
            attributes: ['id', 'name'],
            required: false,
          },
          {
            association: 'tasks',
            attributes: ['id', 'title', 'status'],
            required: false,
          },
        ],
      });

      if (!board) {
        throw new NotFoundException('Board not found');
      }

      // Apply RBAC: Check if user can access this board
      if (currentUser.role === RoleType.USER) {
        const canAccess =
          board.visibility === BoardVisibility.PUBLIC ||
          board.createdById === currentUser.id ||
          (board.visibility === BoardVisibility.ORGANIZATION &&
            board.organizationId === currentUser.organizationId);

        if (!canAccess) {
          throw new ForbiddenException('Access denied to this board');
        }
      }

      return this.responseHelper.success<Board>({
        message: 'Board retrieved successfully',
        response: board,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve board');
    }
  }

  async updateBoard(
    id: string,
    updateBoardDto: UpdateBoardDto,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<Board>> {
    console.log('🔄 UPDATE BOARD SERVICE REACHED');
    console.log('📝 Board ID:', id);
    console.log('📝 Update DTO received:', updateBoardDto);

    try {
      const board = await Board.findOne({ where: { id } });

      if (!board) {
        throw new NotFoundException('Board not found');
      }

      // Check if user can update this board (only creator or admin/super_admin)
      if (
        currentUser.role === RoleType.USER &&
        board.createdById !== currentUser.id
      ) {
        throw new ForbiddenException('You can only update your own boards');
      }

      // Check if name is being updated and already exists
      if (updateBoardDto.name && updateBoardDto.name !== board.name) {
        const whereCondition: WhereOptions<Board> = {
          name: updateBoardDto.name,
          createdById: board.createdById,
          id: { [Op.ne]: id },
        };

        if (board.organizationId) {
          whereCondition.organizationId = board.organizationId;
        }

        const existingBoard = await Board.findOne({
          where: whereCondition,
        });

        if (existingBoard) {
          throw new ConflictException('Board with this name already exists');
        }
      }

      const updateData: Partial<Board> = {
        ...updateBoardDto,
        description:
          updateBoardDto.description !== undefined
            ? updateBoardDto.description
            : undefined,
        color:
          updateBoardDto.color !== undefined ? updateBoardDto.color : undefined,
        icon:
          updateBoardDto.icon !== undefined ? updateBoardDto.icon : undefined,
        organizationId:
          updateBoardDto.organizationId !== undefined
            ? updateBoardDto.organizationId
            : undefined,
        updatedAt: new Date(),
      };

      await board.update(updateData);

      const updatedBoard = await Board.findOne({
        where: { id },
        include: [
          {
            association: 'createdBy',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            association: 'organization',
            attributes: ['id', 'name'],
            required: false,
          },
        ],
      });

      if (!updatedBoard) {
        throw new BadRequestException('Failed to retrieve updated board');
      }

      return this.responseHelper.success<Board>({
        message: 'Board updated successfully',
        response: updatedBoard,
      });
    } catch (error) {
      console.log('💥 UPDATE BOARD ERROR:', error);

      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update board');
    }
  }

  async deleteBoard(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<void>> {
    try {
      const board = await Board.findOne({ where: { id } });

      if (!board) {
        throw new NotFoundException('Board not found');
      }

      if (
        currentUser.role === RoleType.USER &&
        board.createdById !== currentUser.id
      ) {
        throw new ForbiddenException('You can only delete your own boards');
      }

      await board.update({
        status: BoardStatus.DELETED,
        deletedAt: new Date(),
      });

      return this.responseHelper.success<void>({
        message: 'Board deleted successfully',
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete board');
    }
  }

  async toggleBoardStatus(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<ApiResponse<Board>> {
    try {
      const board = await Board.findOne({ where: { id } });

      if (!board) {
        throw new NotFoundException('Board not found');
      }

      if (
        currentUser.role === RoleType.USER &&
        board.createdById !== currentUser.id
      ) {
        throw new ForbiddenException(
          'You can only toggle status of your own boards',
        );
      }

      const newStatus =
        board.status === BoardStatus.ACTIVE
          ? BoardStatus.ARCHIVED
          : BoardStatus.ACTIVE;

      await board.update({
        status: newStatus,
        updatedAt: new Date(),
      });

      const updatedBoard = await Board.findOne({
        where: { id },
        include: [
          {
            association: 'createdBy',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });

      if (!updatedBoard) {
        throw new BadRequestException('Failed to retrieve updated board');
      }

      return this.responseHelper.success<Board>({
        message: `Board ${newStatus === BoardStatus.ACTIVE ? 'activated' : 'archived'} successfully`,
        response: updatedBoard,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to toggle board status');
    }
  }

  async getPublicBoards(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<ApiResponse<Board[]>> {
    try {
      const offset = (page - 1) * limit;

      const whereConditions: WhereOptions<Board> = {
        visibility: BoardVisibility.PUBLIC,
        status: BoardStatus.ACTIVE,
      };

      if (search) {
        whereConditions[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const queryOptions: FindAndCountOptions<Board> = {
        where: whereConditions,
        include: [
          {
            association: 'createdBy',
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      };

      const { count, rows: boards } = await Board.findAndCountAll(queryOptions);
      const totalPages = Math.ceil(count / limit);

      return this.responseHelper.success<Board[]>({
        message: 'Public boards retrieved successfully',
        response: boards,
        pagination: {
          pages: totalPages,
          page,
          count,
          perPage: limit,
        },
      });
    } catch (error) {
      console.log('error :>> ', error);
      throw new BadRequestException('Failed to retrieve public boards');
    }
  }
}
