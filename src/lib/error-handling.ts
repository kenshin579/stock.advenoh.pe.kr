import { NextResponse } from 'next/server';

// 에러 타입 정의
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

// 에러 코드 상수
export const ERROR_CODES = {
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

// 에러 메시지 매핑
export const ERROR_MESSAGES = {
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: '서버 내부 오류가 발생했습니다.',
  [ERROR_CODES.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ERROR_CODES.BAD_REQUEST]: '잘못된 요청입니다.',
  [ERROR_CODES.UNAUTHORIZED]: '인증이 필요합니다.',
  [ERROR_CODES.FORBIDDEN]: '접근 권한이 없습니다.',
  [ERROR_CODES.VALIDATION_ERROR]: '입력 데이터가 유효하지 않습니다.',
  [ERROR_CODES.DATABASE_ERROR]: '데이터베이스 오류가 발생했습니다.',
  [ERROR_CODES.NETWORK_ERROR]: '네트워크 오류가 발생했습니다.',
} as const;

// 에러 생성 함수
export function createApiError(
  code: keyof typeof ERROR_CODES,
  message?: string,
  details?: any,
  status?: number
): ApiError {
  const defaultStatus = {
    [ERROR_CODES.INTERNAL_SERVER_ERROR]: 500,
    [ERROR_CODES.NOT_FOUND]: 404,
    [ERROR_CODES.BAD_REQUEST]: 400,
    [ERROR_CODES.UNAUTHORIZED]: 401,
    [ERROR_CODES.FORBIDDEN]: 403,
    [ERROR_CODES.VALIDATION_ERROR]: 422,
    [ERROR_CODES.DATABASE_ERROR]: 500,
    [ERROR_CODES.NETWORK_ERROR]: 503,
  };

  return {
    message: message || ERROR_MESSAGES[code],
    code: ERROR_CODES[code],
    status: status || defaultStatus[code],
    details,
  };
}

// 에러 응답 생성 함수
export function createErrorResponse(error: ApiError): NextResponse {
  return NextResponse.json(
    {
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString(),
    },
    { status: error.status }
  );
}

// 에러 핸들링 래퍼 함수
export async function handleApiError<T>(
  operation: () => Promise<T>,
  fallbackMessage?: string
): Promise<NextResponse> {
  try {
    const result = await operation();
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    
    // 에러 타입에 따른 처리
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('404')) {
        const apiError = createApiError(ERROR_CODES.NOT_FOUND, error.message);
        return createErrorResponse(apiError);
      }
      
      if (error.message.includes('validation') || error.message.includes('invalid')) {
        const apiError = createApiError(ERROR_CODES.VALIDATION_ERROR, error.message);
        return createErrorResponse(apiError);
      }
      
      if (error.message.includes('database') || error.message.includes('db')) {
        const apiError = createApiError(ERROR_CODES.DATABASE_ERROR, error.message);
        return createErrorResponse(apiError);
      }
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        const apiError = createApiError(ERROR_CODES.NETWORK_ERROR, error.message);
        return createErrorResponse(apiError);
      }
    }
    
    // 기본 내부 서버 오류
    const apiError = createApiError(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      fallbackMessage || '서버 오류가 발생했습니다.'
    );
    return createErrorResponse(apiError);
  }
}

// 성능 측정과 함께 에러 핸들링
export async function handleApiErrorWithPerformance<T>(
  operation: () => Promise<T>,
  operationName: string,
  fallbackMessage?: string
): Promise<NextResponse> {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    // 성능 로깅
    console.log(`API ${operationName} completed in ${duration.toFixed(2)}ms`);
    
    // 느린 API 호출 경고
    if (duration > 1000) {
      console.warn(`Slow API call detected: ${operationName} took ${duration.toFixed(2)}ms`);
    }
    
    return NextResponse.json(result);
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`API ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
    
    return handleApiError(() => Promise.reject(error), fallbackMessage);
  }
} 