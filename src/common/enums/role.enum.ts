//Each role has specific permissions for different operations

export enum RoleType {
  // Super administrator with full system access
  SUPER_ADMIN = 'super_admin',

  // Organization administrator - can manage entire organization
  ADMIN = 'admin',

  // Regular user - can view and update assigned tasks
  USER = 'user',

  // Guest user - can only view public boards (no task details)
  GUEST = 'guest',
}
