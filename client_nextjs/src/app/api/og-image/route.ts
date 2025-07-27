import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const title = searchParams.get('title') || '투자 인사이트';
    const description = searchParams.get('description') || '주식 투자 정보와 ETF 분석';
    const category = searchParams.get('category') || 'Investment';
    const author = searchParams.get('author') || 'Frank Oh';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const width = parseInt(searchParams.get('width') || '1200');
    const height = parseInt(searchParams.get('height') || '630');
    const preview = searchParams.get('preview') === 'true';

    // 이미지 생성 요청인 경우
    if (request.headers.get('accept')?.includes('image/') || preview) {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              padding: '40px',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {/* 배경 그라데이션 */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                opacity: 0.1,
              }}
            />
            
            {/* 로고 영역 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#3b82f6',
              }}
            >
              📈 투자 인사이트
            </div>

            {/* 제목 */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '20px',
                lineHeight: 1.2,
                maxWidth: '1000px',
              }}
            >
              {title}
            </div>

            {/* 설명 */}
            <div
              style={{
                fontSize: '24px',
                textAlign: 'center',
                marginBottom: '30px',
                opacity: 0.8,
                maxWidth: '900px',
                lineHeight: 1.4,
              }}
            >
              {description}
            </div>

            {/* 하단 정보 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                maxWidth: '1000px',
                fontSize: '18px',
                opacity: 0.7,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>📂 {category}</span>
                <span>👤 {author}</span>
              </div>
              <div>{date}</div>
            </div>
          </div>
        ),
        {
          width,
          height,
        }
      );
    }

    // JSON 응답 (API 호출용)
    const ogData = {
      title,
      description,
      category,
      author,
      date,
      imageUrl: `${request.nextUrl.origin}/api/og-image?${searchParams.toString()}`,
      width,
      height,
    };

    return NextResponse.json(ogData, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('OG Image API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate OG image data' },
      { status: 500 }
    );
  }
} 