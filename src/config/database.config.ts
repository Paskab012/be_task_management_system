import { registerAs } from '@nestjs/config';
import { SequelizeModuleOptions } from '@nestjs/sequelize';

export default registerAs('database', (): SequelizeModuleOptions => {
  const useSSL = process.env.DATABASE_SSL === 'true';

  return {
    dialect: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '68199919',
    database: process.env.DATABASE_NAME || 'task_management_development',
    autoLoadModels: true,
    synchronize: false,
    logging: process.env.ENABLE_ORM_LOGS === 'true' ? console.log : false,
    ssl: useSSL,
    dialectOptions: useSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '+00:00',
    define: {
      timestamps: true,
      underscored: false,
      paranoid: true,
      freezeTableName: true,
    },
  };
});
