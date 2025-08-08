import { RoleType, Permission } from '../common/enums';

export const ROLE_PERMISSIONS = new Map<RoleType, Permission[]>([
  // GUEST: Can only view public boards (no task details)
  [
    RoleType.GUEST,
    [
      Permission.VIEW_PUBLIC_BOARDS,
      Permission.READ_BOARD, // Only public boards, no task details
    ],
  ],

  // USER: Can view and update only their assigned tasks
  [
    RoleType.USER,
    [
      // User profile
      Permission.READ_USER, // Own profile
      Permission.UPDATE_USER, // Own profile only

      // Board access
      Permission.VIEW_PUBLIC_BOARDS,
      Permission.VIEW_PRIVATE_BOARDS, // If assigned to tasks
      Permission.READ_BOARD,

      // Task management (assigned tasks only)
      Permission.VIEW_ASSIGNED_TASKS,
      Permission.READ_TASK,
      Permission.UPDATE_TASK, // Only assigned tasks
      Permission.UPDATE_TASK_STATUS,

      // Comments
      Permission.CREATE_COMMENT,
      Permission.READ_COMMENT,
      Permission.UPDATE_COMMENT, // Own comments only

      // Attachments
      Permission.UPLOAD_ATTACHMENT,
      Permission.VIEW_ATTACHMENT,
      Permission.DELETE_ATTACHMENT, // Own attachments only

      // Notifications
      Permission.READ_NOTIFICATION,
      Permission.MANAGE_NOTIFICATION_SETTINGS,
    ],
  ],

  // ADMIN: Can create/edit/delete users, boards, and tasks
  [
    RoleType.ADMIN,
    [
      // User management
      Permission.CREATE_USER,
      Permission.READ_USER,
      Permission.UPDATE_USER,
      Permission.DELETE_USER,
      Permission.MANAGE_USER_ROLES,

      // Organization management
      Permission.READ_ORGANIZATION,
      Permission.UPDATE_ORGANIZATION,
      Permission.MANAGE_ORGANIZATION_SETTINGS,

      // Board management
      Permission.CREATE_BOARD,
      Permission.READ_BOARD,
      Permission.UPDATE_BOARD,
      Permission.DELETE_BOARD,
      Permission.MANAGE_BOARD_VISIBILITY,
      Permission.VIEW_PUBLIC_BOARDS,
      Permission.VIEW_PRIVATE_BOARDS,

      // Task management
      Permission.CREATE_TASK,
      Permission.READ_TASK,
      Permission.UPDATE_TASK,
      Permission.DELETE_TASK,
      Permission.ASSIGN_TASK,
      Permission.UNASSIGN_TASK,
      Permission.UPDATE_TASK_STATUS,
      Permission.VIEW_ALL_TASKS,
      Permission.VIEW_ASSIGNED_TASKS,

      // Comments management
      Permission.CREATE_COMMENT,
      Permission.READ_COMMENT,
      Permission.UPDATE_COMMENT,
      Permission.DELETE_COMMENT,

      // Attachments
      Permission.UPLOAD_ATTACHMENT,
      Permission.VIEW_ATTACHMENT,
      Permission.DELETE_ATTACHMENT,

      // Notifications
      Permission.CREATE_NOTIFICATION,
      Permission.READ_NOTIFICATION,
      Permission.MANAGE_NOTIFICATION_SETTINGS,

      // Reporting & Audit
      Permission.VIEW_REPORTS,
      Permission.READ_AUDIT_LOGS,
      Permission.EXPORT_DATA,

      // System management within organization
      Permission.MANAGE_SYSTEM_USERS,
    ],
  ],

  // SUPER_ADMIN: Full system access
  [RoleType.SUPER_ADMIN, Object.values(Permission)],
]);
