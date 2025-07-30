import { BlogPost } from '@/lib/blog';

// 데이터 검증 스키마
export interface ValidationSchema {
  required?: string[];
  types?: Record<string, string>;
  patterns?: Record<string, RegExp>;
  custom?: Record<string, (value: any) => boolean>;
}

// 검증 결과
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 블로그 포스트 검증 스키마
export const BLOG_POST_SCHEMA: ValidationSchema = {
  required: ['title', 'slug', 'date', 'excerpt', 'content', 'categories'],
  types: {
    title: 'string',
    slug: 'string',
    date: 'string',
    excerpt: 'string',
    content: 'string',
    categories: 'array',
    tags: 'array',
    author: 'string',
    featuredImage: 'string',
  },
  patterns: {
    slug: /^[a-z0-9-]+$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
  },
  custom: {
    title: (value: string) => value.length > 0 && value.length <= 200,
    excerpt: (value: string) => value.length > 0 && value.length <= 500,
    content: (value: string) => value.length > 0,
    categories: (value: string[]) => value.length > 0 && value.every(cat => typeof cat === 'string'),
    tags: (value: string[]) => value.every(tag => typeof tag === 'string'),
  },
};

// 카테고리 검증 스키마
export const CATEGORY_SCHEMA: ValidationSchema = {
  required: ['name', 'slug', 'count'],
  types: {
    name: 'string',
    slug: 'string',
    count: 'number',
  },
  patterns: {
    slug: /^[a-z0-9-]+$/,
  },
  custom: {
    name: (value: string) => value.length > 0 && value.length <= 50,
    count: (value: number) => value >= 0,
  },
};

// 데이터 검증 함수
export function validateData(data: any, schema: ValidationSchema): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 필수 필드 검증
  if (schema.required) {
    for (const field of schema.required) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        errors.push(`필수 필드가 누락되었습니다: ${field}`);
      }
    }
  }

  // 타입 검증
  if (schema.types) {
    for (const [field, expectedType] of Object.entries(schema.types)) {
      if (data[field] !== undefined && data[field] !== null) {
        const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
        if (actualType !== expectedType) {
          errors.push(`필드 ${field}의 타입이 일치하지 않습니다. 예상: ${expectedType}, 실제: ${actualType}`);
        }
      }
    }
  }

  // 패턴 검증
  if (schema.patterns) {
    for (const [field, pattern] of Object.entries(schema.patterns)) {
      if (data[field] && typeof data[field] === 'string') {
        if (!pattern.test(data[field])) {
          errors.push(`필드 ${field}의 형식이 올바르지 않습니다: ${data[field]}`);
        }
      }
    }
  }

  // 커스텀 검증
  if (schema.custom) {
    for (const [field, validator] of Object.entries(schema.custom)) {
      if (data[field] !== undefined && data[field] !== null) {
        try {
          if (!validator(data[field])) {
            errors.push(`필드 ${field}의 값이 유효하지 않습니다: ${data[field]}`);
          }
        } catch (error) {
          errors.push(`필드 ${field} 검증 중 오류가 발생했습니다: ${error}`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// 블로그 포스트 데이터 검증
export function validateBlogPost(post: any): ValidationResult {
  return validateData(post, BLOG_POST_SCHEMA);
}

// 카테고리 데이터 검증
export function validateCategory(category: any): ValidationResult {
  return validateData(category, CATEGORY_SCHEMA);
}

// 데이터 일관성 검증
export function validateDataConsistency(
  staticData: any[],
  apiData: any[],
  keyField: string = 'slug'
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 정적 데이터와 API 데이터의 개수 비교
  if (staticData.length !== apiData.length) {
    warnings.push(`데이터 개수가 일치하지 않습니다. 정적: ${staticData.length}, API: ${apiData.length}`);
  }

  // 정적 데이터 키 추출
  const staticKeys = new Set(staticData.map(item => item[keyField]));
  const apiKeys = new Set(apiData.map(item => item[keyField]));

  // 누락된 데이터 확인
  const missingInApi = Array.from(staticKeys).filter(key => !apiKeys.has(key));
  const missingInStatic = Array.from(apiKeys).filter(key => !staticKeys.has(key));

  if (missingInApi.length > 0) {
    errors.push(`API에서 누락된 데이터: ${missingInApi.join(', ')}`);
  }

  if (missingInStatic.length > 0) {
    warnings.push(`정적 데이터에서 누락된 데이터: ${missingInStatic.join(', ')}`);
  }

  // 공통 키에 대한 데이터 일치성 검증
  const commonKeys = Array.from(staticKeys).filter(key => apiKeys.has(key));
  
  for (const key of commonKeys) {
    const staticItem = staticData.find(item => item[keyField] === key);
    const apiItem = apiData.find(item => item[keyField] === key);

    if (staticItem && apiItem) {
      // 중요 필드 비교
      const importantFields = ['title', 'date', 'categories'];
      for (const field of importantFields) {
        if (staticItem[field] !== apiItem[field]) {
          errors.push(`데이터 불일치 (${key}.${field}): 정적="${staticItem[field]}", API="${apiItem[field]}"`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// 데이터 무결성 검증
export function validateDataIntegrity(data: any[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 중복 키 확인
  const keys = data.map(item => item.slug || item.id);
  const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
  
  if (duplicates.length > 0) {
    errors.push(`중복된 키가 발견되었습니다: ${[...new Set(duplicates)].join(', ')}`);
  }

  // 날짜 형식 검증
  const invalidDates = data.filter(item => {
    if (item.date) {
      const date = new Date(item.date);
      return isNaN(date.getTime());
    }
    return false;
  });

  if (invalidDates.length > 0) {
    errors.push(`잘못된 날짜 형식이 발견되었습니다: ${invalidDates.map(item => item.slug).join(', ')}`);
  }

  // 빈 콘텐츠 확인
  const emptyContent = data.filter(item => !item.content || item.content.trim().length === 0);
  
  if (emptyContent.length > 0) {
    warnings.push(`빈 콘텐츠가 발견되었습니다: ${emptyContent.map(item => item.slug).join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// 종합 데이터 검증
export function validateAllData(
  staticData: any[],
  apiData: any[],
  schema: ValidationSchema
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 개별 데이터 검증
  for (const item of staticData) {
    const result = validateData(item, schema);
    errors.push(...result.errors.map(err => `정적 데이터 - ${item.slug || item.id}: ${err}`));
    warnings.push(...result.warnings.map(warn => `정적 데이터 - ${item.slug || item.id}: ${warn}`));
  }

  for (const item of apiData) {
    const result = validateData(item, schema);
    errors.push(...result.errors.map(err => `API 데이터 - ${item.slug || item.id}: ${err}`));
    warnings.push(...result.warnings.map(warn => `API 데이터 - ${item.slug || item.id}: ${warn}`));
  }

  // 데이터 일관성 검증
  const consistencyResult = validateDataConsistency(staticData, apiData);
  errors.push(...consistencyResult.errors);
  warnings.push(...consistencyResult.warnings);

  // 데이터 무결성 검증
  const integrityResult = validateDataIntegrity(staticData);
  errors.push(...integrityResult.errors);
  warnings.push(...integrityResult.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
} 