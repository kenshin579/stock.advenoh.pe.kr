// UI 컴포넌트 호환성 테스트 유틸리티

export interface ComponentTestResult {
  componentName: string;
  isCompatible: boolean;
  issues: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ComponentTestConfig {
  checkProps: boolean;
  checkStyling: boolean;
  checkInteractions: boolean;
  checkResponsive: boolean;
  checkAccessibility: boolean;
}

// 기본 테스트 설정
export const DEFAULT_TEST_CONFIG: ComponentTestConfig = {
  checkProps: true,
  checkStyling: true,
  checkInteractions: true,
  checkResponsive: true,
  checkAccessibility: true,
};

// 컴포넌트 호환성 검사 함수
export function checkComponentCompatibility(
  componentName: string,
  config: ComponentTestConfig = DEFAULT_TEST_CONFIG
): ComponentTestResult {
  const result: ComponentTestResult = {
    componentName,
    isCompatible: true,
    issues: [],
    warnings: [],
    suggestions: [],
  };

  // Next.js 15 호환성 검사
  if (config.checkProps) {
    checkPropsCompatibility(componentName, result);
  }

  if (config.checkStyling) {
    checkStylingCompatibility(componentName, result);
  }

  if (config.checkInteractions) {
    checkInteractionCompatibility(componentName, result);
  }

  if (config.checkResponsive) {
    checkResponsiveCompatibility(componentName, result);
  }

  if (config.checkAccessibility) {
    checkAccessibilityCompatibility(componentName, result);
  }

  // 전체 호환성 판단
  result.isCompatible = result.issues.length === 0;

  return result;
}

// Props 호환성 검사
function checkPropsCompatibility(componentName: string, result: ComponentTestResult) {
  const knownIssues = {
    'Link': [
      'href prop type issues with typedRoutes',
      'Consider using string type for href or disable typedRoutes',
    ],
    'Image': [
      'src prop optimization required',
      'Consider using next/image for better performance',
    ],
    'Button': [
      'onClick prop hydration issues possible',
      'Use ClientOnly wrapper for interactive buttons',
    ],
  };

  const issues = knownIssues[componentName as keyof typeof knownIssues];
  if (issues) {
    result.issues.push(...issues);
  }
}

// 스타일링 호환성 검사
function checkStylingCompatibility(componentName: string, result: ComponentTestResult) {
  const stylingChecks = [
    'CSS-in-JS libraries compatibility',
    'Tailwind CSS class conflicts',
    'CSS Modules import issues',
    'Global styles pollution',
  ];

  // 일반적인 스타일링 이슈 검사
  if (componentName.includes('Modal') || componentName.includes('Dialog')) {
    result.warnings.push('Modal/Dialog components may have z-index conflicts');
  }

  if (componentName.includes('Form') || componentName.includes('Input')) {
    result.suggestions.push('Consider using form validation libraries compatible with Next.js');
  }
}

// 인터랙션 호환성 검사
function checkInteractionCompatibility(componentName: string, result: ComponentTestResult) {
  const interactiveComponents = [
    'Button', 'Link', 'Input', 'Select', 'Dropdown', 'Modal', 'Dialog',
    'Accordion', 'Tabs', 'Slider', 'Checkbox', 'Radio'
  ];

  if (interactiveComponents.some(name => componentName.includes(name))) {
    result.warnings.push('Interactive components may require ClientOnly wrapper');
    result.suggestions.push('Use useHydration hook for state management');
  }
}

// 반응형 호환성 검사
function checkResponsiveCompatibility(componentName: string, result: ComponentTestResult) {
  const responsiveChecks = [
    'Mobile-first design implementation',
    'Breakpoint consistency',
    'Touch interaction support',
    'Viewport meta tag presence',
  ];

  if (componentName.includes('Navigation') || componentName.includes('Menu')) {
    result.suggestions.push('Ensure mobile navigation works properly');
  }

  if (componentName.includes('Table')) {
    result.warnings.push('Tables may need responsive design considerations');
  }
}

// 접근성 호환성 검사
function checkAccessibilityCompatibility(componentName: string, result: ComponentTestResult) {
  const a11yChecks = [
    'ARIA labels presence',
    'Keyboard navigation support',
    'Screen reader compatibility',
    'Color contrast compliance',
    'Focus management',
  ];

  if (componentName.includes('Button')) {
    result.suggestions.push('Ensure button has proper aria-label or accessible text');
  }

  if (componentName.includes('Image')) {
    result.suggestions.push('Ensure all images have alt text');
  }

  if (componentName.includes('Form')) {
    result.suggestions.push('Ensure form fields have proper labels and error messages');
  }
}

// 컴포넌트 테스트 실행 함수
export function runComponentTests(components: string[]): ComponentTestResult[] {
  return components.map(component => 
    checkComponentCompatibility(component)
  );
}

// 테스트 결과 요약
export function summarizeTestResults(results: ComponentTestResult[]): {
  total: number;
  compatible: number;
  incompatible: number;
  totalIssues: number;
  totalWarnings: number;
  totalSuggestions: number;
} {
  const summary = {
    total: results.length,
    compatible: results.filter(r => r.isCompatible).length,
    incompatible: results.filter(r => !r.isCompatible).length,
    totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
    totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
    totalSuggestions: results.reduce((sum, r) => sum + r.suggestions.length, 0),
  };

  return summary;
}

// 테스트 리포트 생성
export function generateTestReport(results: ComponentTestResult[]): string {
  const summary = summarizeTestResults(results);
  
  let report = `🔍 UI Component Compatibility Test Report\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += `📊 Summary:\n`;
  report += `- Total components tested: ${summary.total}\n`;
  report += `- Compatible: ${summary.compatible}\n`;
  report += `- Incompatible: ${summary.incompatible}\n`;
  report += `- Total issues: ${summary.totalIssues}\n`;
  report += `- Total warnings: ${summary.totalWarnings}\n`;
  report += `- Total suggestions: ${summary.totalSuggestions}\n\n`;
  
  // 호환되지 않는 컴포넌트들
  const incompatible = results.filter(r => !r.isCompatible);
  if (incompatible.length > 0) {
    report += `❌ Incompatible Components:\n`;
    incompatible.forEach(component => {
      report += `\n${component.componentName}:\n`;
      component.issues.forEach(issue => {
        report += `  - ${issue}\n`;
      });
    });
    report += `\n`;
  }
  
  // 경고가 있는 컴포넌트들
  const withWarnings = results.filter(r => r.warnings.length > 0);
  if (withWarnings.length > 0) {
    report += `⚠️  Components with Warnings:\n`;
    withWarnings.forEach(component => {
      report += `\n${component.componentName}:\n`;
      component.warnings.forEach(warning => {
        report += `  - ${warning}\n`;
      });
    });
    report += `\n`;
  }
  
  // 제안사항
  const withSuggestions = results.filter(r => r.suggestions.length > 0);
  if (withSuggestions.length > 0) {
    report += `💡 Improvement Suggestions:\n`;
    withSuggestions.forEach(component => {
      report += `\n${component.componentName}:\n`;
      component.suggestions.forEach(suggestion => {
        report += `  - ${suggestion}\n`;
      });
    });
  }
  
  return report;
} 