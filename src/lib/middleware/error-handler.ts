import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthError } from '@supabase/supabase-js';
import { MoniteApiError } from '@/lib/monite/types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation Error',
        details: error.errors 
      },
      { status: 400 }
    );
  }

  if (error instanceof AuthError) {
    return NextResponse.json(
      { 
        error: 'Authentication Error',
        message: error.message 
      },
      { status: 401 }
    );
  }

  if (error instanceof Error && 'code' in error && 'status' in error) {
    const moniteError = error as MoniteApiError;
    return NextResponse.json(
      {
        error: moniteError.code,
        message: moniteError.message,
        details: moniteError.details
      },
      { status: moniteError.status || 500 }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.code || 'UnknownError',
        message: error.message
      },
      { status: error.status }
    );
  }

  console.error('Unhandled error:', error);
  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
} 