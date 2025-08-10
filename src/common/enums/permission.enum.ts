export enum Permission {
  // User Management Permissions
  CREATE_USER = 'create:user',
  READ_USER = 'read:user',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',
  MANAGE_USER_ROLES = 'manage:user_roles',

  // Organization Management Permissions
  CREATE_ORGANIZATION = 'create:organization',
  READ_ORGANIZATION = 'read:organization',
  UPDATE_ORGANIZATION = 'update:organization',
  DELETE_ORGANIZATION = 'delete:organization',
  MANAGE_ORGANIZATION_SETTINGS = 'manage:organization_settings',

  // Board Management Permissions
  CREATE_BOARD = 'create:board',
  READ_BOARD = 'read:board',
  UPDATE_BOARD = 'update:board',
  DELETE_BOARD = 'delete:board',
  MANAGE_BOARD_VISIBILITY = 'manage:board_visibility',
  VIEW_PUBLIC_BOARDS = 'view:public_boards',
  VIEW_PRIVATE_BOARDS = 'view:private_boards',

  // Task Management Permissions
  CREATE_TASK = 'create:task',
  READ_TASK = 'read:task',
  UPDATE_TASK = 'update:task',
  DELETE_TASK = 'delete:task',
  ASSIGN_TASK = 'assign:task',
  UNASSIGN_TASK = 'unassign:task',
  UPDATE_TASK_STATUS = 'update:task_status',
  VIEW_ALL_TASKS = 'view:all_tasks',
  VIEW_ASSIGNED_TASKS = 'view:assigned_tasks',

  // Task Comments Permissions
  CREATE_COMMENT = 'create:comment',
  READ_COMMENT = 'read:comment',
  UPDATE_COMMENT = 'update:comment',
  DELETE_COMMENT = 'delete:comment',

  // File Attachment Permissions
  UPLOAD_ATTACHMENT = 'upload:attachment',
  VIEW_ATTACHMENT = 'view:attachment',
  DELETE_ATTACHMENT = 'delete:attachment',

  // Notification Permissions
  CREATE_NOTIFICATION = 'create:notification',
  READ_NOTIFICATION = 'read:notification',
  MANAGE_NOTIFICATION_SETTINGS = 'manage:notification_settings',

  // Audit & Reporting Permissions
  READ_AUDIT_LOGS = 'read:audit_logs',
  VIEW_REPORTS = 'view:reports',
  EXPORT_DATA = 'export:data',

  // System Administration Permissions
  MANAGE_SYSTEM_SETTINGS = 'manage:system_settings',
  MANAGE_SYSTEM_USERS = 'manage:system_users',
  VIEW_SYSTEM_STATS = 'view:system_stats',
}
