//Notification types for different system events
export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_UPDATED = 'task_updated',
  TASK_COMPLETED = 'task_completed',
  TASK_OVERDUE = 'task_overdue',
  TASK_DUE_SOON = 'task_due_soon',
  COMMENT_ADDED = 'comment_added',
  BOARD_SHARED = 'board_shared',
  USER_MENTIONED = 'user_mentioned',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  WELCOME = 'welcome',
}

//Notification priority levels
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}
