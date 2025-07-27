// 접근성 개선 유틸리티
export interface AccessibilityCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  score: number; // 0-100
}

export interface ARIAElement {
  tag: string;
  attributes: Record<string, string>;
  hasLabel: boolean;
  hasAlt?: boolean;
  isInteractive: boolean;
}

export interface ColorContrastResult {
  ratio: number;
  passes: boolean;
  level: 'AA' | 'AAA' | 'fail';
}

class AccessibilityChecker {
  private static instance: AccessibilityChecker;

  private constructor() {}

  static getInstance(): AccessibilityChecker {
    if (!AccessibilityChecker.instance) {
      AccessibilityChecker.instance = new AccessibilityChecker();
    }
    return AccessibilityChecker.instance;
  }

  // ARIA 라벨 검증
  validateARIALabels(elements: ARIAElement[]): AccessibilityCheckResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    elements.forEach((element, index) => {
      // 인터랙티브 요소는 반드시 라벨이 있어야 함
      if (element.isInteractive && !element.hasLabel) {
        errors.push(`Interactive element ${index + 1} (${element.tag}) missing label`);
      }

      // 이미지 요소는 alt 속성이 있어야 함
      if (element.tag === 'img' && !element.hasAlt) {
        errors.push(`Image element ${index + 1} missing alt attribute`);
      }

      // 버튼 요소 검증
      if (element.tag === 'button') {
        if (!element.hasLabel && !element.attributes['aria-label'] && !element.attributes['aria-labelledby']) {
          errors.push(`Button element ${index + 1} missing accessible label`);
        }
      }

      // 링크 요소 검증
      if (element.tag === 'a') {
        if (!element.hasLabel && !element.attributes['aria-label'] && !element.attributes['aria-labelledby']) {
          errors.push(`Link element ${index + 1} missing accessible label`);
        }
      }

      // 입력 요소 검증
      if (['input', 'textarea', 'select'].includes(element.tag)) {
        if (!element.hasLabel && !element.attributes['aria-label'] && !element.attributes['aria-labelledby']) {
          errors.push(`Form element ${index + 1} (${element.tag}) missing accessible label`);
        }
      }

      // ARIA 속성 검증
      if (element.attributes['aria-label'] && element.attributes['aria-label'].trim() === '') {
        errors.push(`Element ${index + 1} has empty aria-label`);
      }

      if (element.attributes['aria-labelledby'] && !element.attributes['aria-labelledby'].includes(' ')) {
        warnings.push(`Element ${index + 1} aria-labelledby may reference non-existent element`);
      }
    });

    // 점수 계산 (100점 만점)
    const totalElements = elements.length;
    const errorCount = errors.length;
    const warningCount = warnings.length;
    
    let score = 100;
    score -= errorCount * 10; // 에러당 10점 감점
    score -= warningCount * 2; // 경고당 2점 감점
    score = Math.max(0, score);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      score,
    };
  }

  // 키보드 네비게이션 지원 검증
  validateKeyboardNavigation(elements: ARIAElement[]): AccessibilityCheckResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const interactiveElements = elements.filter(el => el.isInteractive);
    
    // 포커스 가능한 요소 확인
    interactiveElements.forEach((element, index) => {
      if (!element.attributes['tabindex'] && !['button', 'a', 'input', 'textarea', 'select'].includes(element.tag)) {
        warnings.push(`Interactive element ${index + 1} may not be keyboard accessible`);
      }

      if (element.attributes['tabindex'] === '-1') {
        suggestions.push(`Element ${index + 1} is removed from tab order - ensure it's intentional`);
      }
    });

    // 포커스 순서 검증
    const tabIndexElements = interactiveElements.filter(el => el.attributes['tabindex']);
    const tabIndexValues = tabIndexElements.map(el => parseInt(el.attributes['tabindex'] || '0'));
    
    if (tabIndexValues.some(val => val > 0)) {
      warnings.push('Positive tabindex values found - may create confusing tab order');
    }

    // 점수 계산
    let score = 100;
    score -= errors.length * 15;
    score -= warnings.length * 5;
    score = Math.max(0, score);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      score,
    };
  }

  // 색상 대비 검증
  validateColorContrast(foreground: string, background: string): ColorContrastResult {
    // 간단한 색상 대비 계산 (실제로는 더 정교한 알고리즘 필요)
    const fg = this.hexToRgb(foreground);
    const bg = this.hexToRgb(background);
    
    if (!fg || !bg) {
      return { ratio: 0, passes: false, level: 'fail' };
    }

    const ratio = this.calculateContrastRatio(fg, bg);
    
    return {
      ratio,
      passes: ratio >= 4.5,
      level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'fail',
    };
  }

  // WCAG 색상 대비 기준 검증
  validateWCAGContrast(elements: Array<{foreground: string, background: string, size: 'normal' | 'large'}>, level: 'AA' | 'AAA' = 'AA'): AccessibilityCheckResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const thresholds = {
      AA: { normal: 4.5, large: 3 },
      AAA: { normal: 7, large: 4.5 },
    };

    elements.forEach((element, index) => {
      const contrast = this.validateColorContrast(element.foreground, element.background);
      const threshold = thresholds[level][element.size];

      if (contrast.ratio < threshold) {
        errors.push(`Element ${index + 1} fails ${level} contrast requirement (${contrast.ratio.toFixed(2)}:1 < ${threshold}:1)`);
      } else if (contrast.ratio < threshold * 1.2) {
        warnings.push(`Element ${index + 1} has low contrast (${contrast.ratio.toFixed(2)}:1)`);
      }
    });

    // 점수 계산
    let score = 100;
    score -= errors.length * 20;
    score -= warnings.length * 5;
    score = Math.max(0, score);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      score,
    };
  }

  // 스크린 리더 호환성 검증
  validateScreenReaderCompatibility(elements: ARIAElement[]): AccessibilityCheckResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    elements.forEach((element, index) => {
      // 의미있는 텍스트 확인
      if (element.isInteractive && !element.hasLabel && !element.attributes['aria-label'] && !element.attributes['aria-labelledby']) {
        errors.push(`Element ${index + 1} not accessible to screen readers`);
      }

      // ARIA 역할 검증
      if (element.attributes['role'] && !this.isValidARIARole(element.attributes['role'])) {
        warnings.push(`Element ${index + 1} has invalid ARIA role: ${element.attributes['role']}`);
      }

      // ARIA 상태 검증
      if (element.attributes['aria-expanded'] && !['true', 'false'].includes(element.attributes['aria-expanded'])) {
        errors.push(`Element ${index + 1} has invalid aria-expanded value`);
      }

      if (element.attributes['aria-hidden'] && !['true', 'false'].includes(element.attributes['aria-hidden'])) {
        errors.push(`Element ${index + 1} has invalid aria-hidden value`);
      }
    });

    // 점수 계산
    let score = 100;
    score -= errors.length * 15;
    score -= warnings.length * 5;
    score = Math.max(0, score);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      score,
    };
  }

  // 전체 접근성 검증
  validateOverallAccessibility(elements: ARIAElement[], colorElements: Array<{foreground: string, background: string, size: 'normal' | 'large'}>): AccessibilityCheckResult {
    const ariaResult = this.validateARIALabels(elements);
    const keyboardResult = this.validateKeyboardNavigation(elements);
    const contrastResult = this.validateWCAGContrast(colorElements);
    const screenReaderResult = this.validateScreenReaderCompatibility(elements);

    const allErrors = [
      ...ariaResult.errors,
      ...keyboardResult.errors,
      ...contrastResult.errors,
      ...screenReaderResult.errors,
    ];

    const allWarnings = [
      ...ariaResult.warnings,
      ...keyboardResult.warnings,
      ...contrastResult.warnings,
      ...screenReaderResult.warnings,
    ];

    const allSuggestions = [
      ...ariaResult.suggestions,
      ...keyboardResult.suggestions,
      ...contrastResult.suggestions,
      ...screenReaderResult.suggestions,
    ];

    // 종합 점수 계산
    const scores = [ariaResult.score, keyboardResult.score, contrastResult.score, screenReaderResult.score];
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      suggestions: allSuggestions,
      score: Math.round(averageScore),
    };
  }

  // 유틸리티 함수들
  private hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private calculateContrastRatio(fg: {r: number, g: number, b: number}, bg: {r: number, g: number, b: number}): number {
    const fgLuminance = this.calculateLuminance(fg);
    const bgLuminance = this.calculateLuminance(bg);
    
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private calculateLuminance(color: {r: number, g: number, b: number}): number {
    const [r, g, b] = [color.r / 255, color.g / 255, color.b / 255].map(c => {
      if (c <= 0.03928) {
        return c / 12.92;
      }
      return Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private isValidARIARole(role: string): boolean {
    const validRoles = [
      'button', 'checkbox', 'dialog', 'gridcell', 'link', 'menuitem', 'menuitemcheckbox',
      'menuitemradio', 'option', 'progressbar', 'radio', 'scrollbar', 'searchbox',
      'slider', 'spinbutton', 'switch', 'tab', 'tabpanel', 'textbox', 'treeitem',
      'combobox', 'grid', 'listbox', 'menu', 'menubar', 'radiogroup', 'tablist',
      'tree', 'treegrid', 'application', 'article', 'banner', 'complementary',
      'contentinfo', 'form', 'main', 'navigation', 'region', 'search', 'section',
      'sectionhead', 'separator', 'toolbar', 'tooltip'
    ];
    
    return validRoles.includes(role);
  }

  // 접근성 개선 제안 생성
  generateAccessibilitySuggestions(result: AccessibilityCheckResult): string[] {
    const suggestions: string[] = [];

    if (result.score < 70) {
      suggestions.push('Consider conducting a comprehensive accessibility audit');
    }

    if (result.errors.some(error => error.includes('missing label'))) {
      suggestions.push('Add descriptive labels to all interactive elements');
    }

    if (result.errors.some(error => error.includes('contrast'))) {
      suggestions.push('Improve color contrast to meet WCAG guidelines');
    }

    if (result.warnings.some(warning => warning.includes('keyboard'))) {
      suggestions.push('Ensure all interactive elements are keyboard accessible');
    }

    return suggestions;
  }
}

// 편의 함수들
export const accessibilityChecker = AccessibilityChecker.getInstance();

export function validateARIALabels(elements: ARIAElement[]): AccessibilityCheckResult {
  return accessibilityChecker.validateARIALabels(elements);
}

export function validateKeyboardNavigation(elements: ARIAElement[]): AccessibilityCheckResult {
  return accessibilityChecker.validateKeyboardNavigation(elements);
}

export function validateColorContrast(foreground: string, background: string): ColorContrastResult {
  return accessibilityChecker.validateColorContrast(foreground, background);
}

export function validateWCAGContrast(elements: Array<{foreground: string, background: string, size: 'normal' | 'large'}>, level?: 'AA' | 'AAA'): AccessibilityCheckResult {
  return accessibilityChecker.validateWCAGContrast(elements, level);
}

export function validateScreenReaderCompatibility(elements: ARIAElement[]): AccessibilityCheckResult {
  return accessibilityChecker.validateScreenReaderCompatibility(elements);
}

export function validateOverallAccessibility(elements: ARIAElement[], colorElements: Array<{foreground: string, background: string, size: 'normal' | 'large'}>): AccessibilityCheckResult {
  return accessibilityChecker.validateOverallAccessibility(elements, colorElements);
}

export function generateAccessibilitySuggestions(result: AccessibilityCheckResult): string[] {
  return accessibilityChecker.generateAccessibilitySuggestions(result);
} 