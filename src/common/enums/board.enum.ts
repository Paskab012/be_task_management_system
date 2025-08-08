//Board visibility
export enum BoardVisibility {
  PUBLIC = 'public', // Guests can view (but not task details)
  PRIVATE = 'private', // Only assigned users can view
  ORGANIZATION = 'organization', // All organization members can view
}

//Board status for management
export enum BoardStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}
