'use strict';

import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      action: {
        type: DataTypes.ENUM(
          'create',
          'read',
          'update',
          'delete',
          'login',
          'logout',
          'assign',
          'unassign',
          'upload',
          'download',
          'share',
          'archive',
          'restore',
        ),
        allowNull: false,
      },
      entity: {
        type: DataTypes.ENUM(
          'user',
          'organization',
          'board',
          'task',
          'comment',
          'attachment',
          'notification',
          'auth',
          'system',
        ),
        allowNull: false,
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      oldValues: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      newValues: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // Add indexes
    await queryInterface.addIndex('audit_logs', ['userId']);
    await queryInterface.addIndex('audit_logs', ['entity']);
    await queryInterface.addIndex('audit_logs', ['action']);
    await queryInterface.addIndex('audit_logs', ['entityId']);
    await queryInterface.addIndex('audit_logs', ['createdAt']);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('audit_logs');
  },
};
