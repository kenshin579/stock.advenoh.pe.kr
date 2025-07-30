// 콘텐츠 관리 시스템 유틸리티

import { buildOptimizer } from './build-optimization';
import { validateAllData, BLOG_POST_SCHEMA } from './data-validation';

export interface ContentUpdateEvent {
  type: 'post_created' | 'post_updated' | 'post_deleted' | 'category_updated';
  slug?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ContentWorkflowConfig {
  autoRebuild: boolean;
  validateContent: boolean;
  backupBeforeUpdate: boolean;
  notifyOnChanges: boolean;
  maxBackupCount: number;
}

// 기본 설정
export const DEFAULT_WORKFLOW_CONFIG: ContentWorkflowConfig = {
  autoRebuild: true,
  validateContent: true,
  backupBeforeUpdate: true,
  notifyOnChanges: true,
  maxBackupCount: 10,
};

// 콘텐츠 관리 클래스
export class ContentManager {
  private config: ContentWorkflowConfig;
  private updateHistory: ContentUpdateEvent[] = [];
  private rebuildQueue: string[] = [];

  constructor(config: ContentWorkflowConfig = DEFAULT_WORKFLOW_CONFIG) {
    this.config = config;
  }

  // 새 블로그 포스트 생성
  async createBlogPost(postData: any): Promise<{ success: boolean; slug?: string; errors?: string[] }> {
    try {
      console.log('📝 Creating new blog post...');

      // 콘텐츠 검증
      if (this.config.validateContent) {
        const validationResult = validateAllData([postData], [postData], BLOG_POST_SCHEMA);
        if (!validationResult.isValid) {
          return {
            success: false,
            errors: validationResult.errors,
          };
        }
      }

      // 백업 생성
      if (this.config.backupBeforeUpdate) {
        await this.createBackup('pre_create_backup');
      }

      // 포스트 생성 로직 (실제 구현에서는 파일 시스템에 저장)
      const slug = postData.slug || this.generateSlug(postData.title);
      
      // 이벤트 기록
      this.recordUpdateEvent({
        type: 'post_created',
        slug,
        timestamp: new Date().toISOString(),
        metadata: { title: postData.title },
      });

      // 자동 재빌드
      if (this.config.autoRebuild) {
        await this.triggerRebuild();
      }

      // 알림
      if (this.config.notifyOnChanges) {
        await this.notifyContentChange('post_created', slug);
      }

      console.log(`✅ Blog post created: ${slug}`);
      return { success: true, slug };

    } catch (error) {
      console.error('❌ Error creating blog post:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // 블로그 포스트 업데이트
  async updateBlogPost(slug: string, updateData: any): Promise<{ success: boolean; errors?: string[] }> {
    try {
      console.log(`📝 Updating blog post: ${slug}`);

      // 콘텐츠 검증
      if (this.config.validateContent) {
        const validationResult = validateAllData([updateData], [updateData], BLOG_POST_SCHEMA);
        if (!validationResult.isValid) {
          return {
            success: false,
            errors: validationResult.errors,
          };
        }
      }

      // 백업 생성
      if (this.config.backupBeforeUpdate) {
        await this.createBackup(`pre_update_backup_${slug}`);
      }

      // 포스트 업데이트 로직 (실제 구현에서는 파일 시스템 업데이트)
      
      // 이벤트 기록
      this.recordUpdateEvent({
        type: 'post_updated',
        slug,
        timestamp: new Date().toISOString(),
        metadata: { title: updateData.title },
      });

      // 자동 재빌드
      if (this.config.autoRebuild) {
        await this.triggerRebuild();
      }

      // 알림
      if (this.config.notifyOnChanges) {
        await this.notifyContentChange('post_updated', slug);
      }

      console.log(`✅ Blog post updated: ${slug}`);
      return { success: true };

    } catch (error) {
      console.error(`❌ Error updating blog post ${slug}:`, error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // 블로그 포스트 삭제
  async deleteBlogPost(slug: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      console.log(`🗑️ Deleting blog post: ${slug}`);

      // 백업 생성
      if (this.config.backupBeforeUpdate) {
        await this.createBackup(`pre_delete_backup_${slug}`);
      }

      // 포스트 삭제 로직 (실제 구현에서는 파일 시스템에서 삭제)
      
      // 이벤트 기록
      this.recordUpdateEvent({
        type: 'post_deleted',
        slug,
        timestamp: new Date().toISOString(),
      });

      // 자동 재빌드
      if (this.config.autoRebuild) {
        await this.triggerRebuild();
      }

      // 알림
      if (this.config.notifyOnChanges) {
        await this.notifyContentChange('post_deleted', slug);
      }

      console.log(`✅ Blog post deleted: ${slug}`);
      return { success: true };

    } catch (error) {
      console.error(`❌ Error deleting blog post ${slug}:`, error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // 카테고리 업데이트
  async updateCategory(categoryData: any): Promise<{ success: boolean; errors?: string[] }> {
    try {
      console.log('📝 Updating category...');

      // 백업 생성
      if (this.config.backupBeforeUpdate) {
        await this.createBackup('pre_category_update_backup');
      }

      // 카테고리 업데이트 로직
      
      // 이벤트 기록
      this.recordUpdateEvent({
        type: 'category_updated',
        timestamp: new Date().toISOString(),
        metadata: { name: categoryData.name },
      });

      // 자동 재빌드
      if (this.config.autoRebuild) {
        await this.triggerRebuild();
      }

      // 알림
      if (this.config.notifyOnChanges) {
        await this.notifyContentChange('category_updated');
      }

      console.log('✅ Category updated');
      return { success: true };

    } catch (error) {
      console.error('❌ Error updating category:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // 자동 재빌드 트리거
  async triggerRebuild(): Promise<void> {
    try {
      console.log('🔄 Triggering automatic rebuild...');
      
      // 재빌드 큐에 추가
      this.rebuildQueue.push(new Date().toISOString());
      
      // 중복 재빌드 방지 (5분 내 중복 요청 무시)
      if (this.rebuildQueue.length > 1) {
        const lastRebuild = new Date(this.rebuildQueue[this.rebuildQueue.length - 2]);
        const now = new Date();
        if (now.getTime() - lastRebuild.getTime() < 5 * 60 * 1000) {
          console.log('⏭️ Skipping rebuild (too recent)');
          return;
        }
      }

      // 빌드 최적화 실행
      await buildOptimizer.generateIncrementalData();
      
      console.log('✅ Automatic rebuild completed');

    } catch (error) {
      console.error('❌ Error during automatic rebuild:', error);
    }
  }

  // 백업 생성
  private async createBackup(backupName: string): Promise<void> {
    try {
      console.log(`💾 Creating backup: ${backupName}`);
      
      // 백업 로직 (실제 구현에서는 파일 시스템 백업)
      const backupData = {
        name: backupName,
        timestamp: new Date().toISOString(),
        content: 'backup_data_here', // 실제로는 현재 콘텐츠 상태
      };

      // 백업 개수 제한
      await this.cleanupOldBackups();
      
      console.log(`✅ Backup created: ${backupName}`);

    } catch (error) {
      console.error(`❌ Error creating backup ${backupName}:`, error);
    }
  }

  // 오래된 백업 정리
  private async cleanupOldBackups(): Promise<void> {
    try {
      // 백업 정리 로직 (실제 구현에서는 파일 시스템 정리)
      console.log('🧹 Cleaning up old backups...');
      
      // 최대 백업 개수 제한
      // 실제 구현에서는 백업 파일들을 확인하고 오래된 것들을 삭제
      
      console.log('✅ Old backups cleaned up');

    } catch (error) {
      console.error('❌ Error cleaning up old backups:', error);
    }
  }

  // 업데이트 이벤트 기록
  private recordUpdateEvent(event: ContentUpdateEvent): void {
    this.updateHistory.push(event);
    
    // 이벤트 히스토리 크기 제한
    if (this.updateHistory.length > 100) {
      this.updateHistory = this.updateHistory.slice(-50);
    }
  }

  // 콘텐츠 변경 알림
  private async notifyContentChange(type: string, slug?: string): Promise<void> {
    try {
      console.log(`📢 Notifying content change: ${type}${slug ? ` - ${slug}` : ''}`);
      
      // 알림 로직 (실제 구현에서는 이메일, 슬랙 등)
      const notification = {
        type,
        slug,
        timestamp: new Date().toISOString(),
        message: `Content ${type}${slug ? ` for ${slug}` : ''}`,
      };

      // 실제 알림 전송 로직
      console.log('📧 Notification sent:', notification);

    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  }

  // 슬러그 생성
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // 업데이트 히스토리 조회
  getUpdateHistory(): ContentUpdateEvent[] {
    return [...this.updateHistory];
  }

  // 재빌드 큐 상태 조회
  getRebuildQueueStatus(): { queueLength: number; lastRebuild?: string } {
    return {
      queueLength: this.rebuildQueue.length,
      lastRebuild: this.rebuildQueue[this.rebuildQueue.length - 1],
    };
  }

  // 콘텐츠 통계
  async getContentStats(): Promise<{
    totalPosts: number;
    totalCategories: number;
    lastUpdate: string;
    updateCount: number;
  }> {
    try {
      // 실제 구현에서는 데이터베이스나 파일 시스템에서 통계 조회
      const stats = {
        totalPosts: 0, // 실제 구현에서 계산
        totalCategories: 0, // 실제 구현에서 계산
        lastUpdate: this.updateHistory[this.updateHistory.length - 1]?.timestamp || 'Never',
        updateCount: this.updateHistory.length,
      };

      return stats;

    } catch (error) {
      console.error('❌ Error getting content stats:', error);
      throw error;
    }
  }
}

// 전역 콘텐츠 관리자 인스턴스
export const contentManager = new ContentManager();

// 콘텐츠 관리 헬퍼 함수들
export async function createNewPost(postData: any) {
  return contentManager.createBlogPost(postData);
}

export async function updateExistingPost(slug: string, updateData: any) {
  return contentManager.updateBlogPost(slug, updateData);
}

export async function deleteExistingPost(slug: string) {
  return contentManager.deleteBlogPost(slug);
}

export async function updateCategory(categoryData: any) {
  return contentManager.updateCategory(categoryData);
}

export async function getContentStatistics() {
  return contentManager.getContentStats();
} 