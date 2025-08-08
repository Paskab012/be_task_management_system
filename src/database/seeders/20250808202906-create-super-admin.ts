/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { QueryInterface } from 'sequelize';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_FIRST_NAME,
  ADMIN_LAST_NAME,
  SALT_ROUNDS,
} = process.env;

export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    const adminEmail = ADMIN_EMAIL || 'superadmin@taskmanagement.com';
    const adminPassword = ADMIN_PASSWORD || 'SuperAdmin@123';
    const saltRounds = Number(SALT_ROUNDS) || 12;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const superAdminId: string = uuidv4();
      await queryInterface.bulkInsert('users', [
        {
          id: superAdminId,
          firstName: ADMIN_FIRST_NAME || 'Super',
          lastName: ADMIN_LAST_NAME || 'Admin',
          email: adminEmail,
          password: await bcrypt.hash(`${ADMIN_PASSWORD}`, saltRounds),
          role: 'super_admin',
          phone: '+250788000000',
          jobTitle: 'System Administrator',
          department: 'IT',
          isEmailVerified: true,
          isActive: true,
          organizationId: null,
          lastLoginAt: null,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          resetPasswordToken: null,
          resetPasswordExpires: null,
          avatar: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ]);

      console.log('✅ Super Admin created successfully!');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('🔐 Role: super_admin');
      console.log('🆔 ID:', superAdminId);
    } catch (error) {
      console.error('❌ Error creating Super Admin:', error);
      throw error;
    }
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    const adminEmail = ADMIN_EMAIL || 'superadmin@taskmanagement.com';

    try {
      await queryInterface.bulkDelete('users', {
        email: adminEmail,
        role: 'super_admin',
      });

      console.log('🗑️  Super Admin deleted successfully!');
    } catch (error) {
      console.error('❌ Error deleting Super Admin:', error);
      throw error;
    }
  },
};
