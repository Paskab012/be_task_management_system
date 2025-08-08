'use strict';

import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('super_admin', 'admin', 'user', 'guest'),
        allowNull: false,
        defaultValue: 'user',
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      jobTitle: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      department: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailVerificationExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      organizationId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'organizations',
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
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['organizationId']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['isActive']);
    await queryInterface.addIndex('users', ['emailVerificationToken']);
    await queryInterface.addIndex('users', ['resetPasswordToken']);
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('users');
  },
};
