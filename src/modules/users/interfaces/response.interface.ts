export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  pagination?: {
    pages: number;
    page: number;
    next: number | null;
    prev: number | null;
    count: number;
  } | null;
  response?: T | null;
  errors?: any;
}
