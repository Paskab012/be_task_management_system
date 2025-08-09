/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';

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

@Injectable()
export class ResponseHelper {
  success<T>(data: {
    message: string;
    response?: T;
    pagination?: {
      pages: number;
      page: number;
      count: number;
      perPage?: number;
    };
  }): ApiResponse<T> {
    const { message, response, pagination } = data;
    return {
      status: 'success',
      message,
      pagination: pagination
        ? {
            pages: pagination.pages,
            page: pagination.page,
            next:
              pagination.page < pagination.pages ? pagination.page + 1 : null,
            prev: pagination.page > 1 ? pagination.page - 1 : null,
            count: pagination.count,
          }
        : null,
      response: response || null,
      errors: null,
    };
  }

  error(data: { message: string; errors?: any }): ApiResponse {
    return {
      status: 'error',
      message: data.message,
      pagination: null,
      response: null,
      errors: data.errors || null,
    };
  }
}
