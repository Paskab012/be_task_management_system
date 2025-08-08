export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ASSIGN = 'assign',
  UNASSIGN = 'unassign',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  SHARE = 'share',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
}

//Entity types for audit logging

export enum AuditEntity {
  USER = 'user',
  ORGANIZATION = 'organization',
  BOARD = 'board',
  TASK = 'task',
  COMMENT = 'comment',
  ATTACHMENT = 'attachment',
  NOTIFICATION = 'notification',
  AUTH = 'auth',
  SYSTEM = 'system',
}
