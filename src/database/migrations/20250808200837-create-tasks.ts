'use strict';

import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('tasks', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          'todo',
          'in_progress',
          'in_review',
          'done',
          'cancelled',
        ),
        allowNull: false,
        defaultValue: 'todo',
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium',
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      estimatedHours: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      actualHours: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      boardId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'boards',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      assignedUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdById: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      parentTaskId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'tasks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await queryInterface.addIndex('tasks', ['boardId']);
    await queryInterface.addIndex('tasks', ['assignedUserId']);
    await queryInterface.addIndex('tasks', ['createdById']);
    await queryInterface.addIndex('tasks', ['status']);
    await queryInterface.addIndex('tasks', ['priority']);
    await queryInterface.addIndex('tasks', ['dueDate']);
    await queryInterface.addIndex('tasks', ['parentTaskId']);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('tasks');
  },
};
