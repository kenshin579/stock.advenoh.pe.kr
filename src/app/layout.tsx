import { Inter, Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'
import ClientOnly from '@/components/ClientOnly'
import React from 'react'

// 폰트 최적화 설정
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
  preload: true,
})

// 메타데이터 설정 (metadata 객체 대신 직접 정의)
const siteMetadata = {
  title: '투자 인사이트 - 주식, ETF, 채권, 펀드 전문 블로그',
  description: '투자에 대한 깊이 있는 인사이트와 실전 경험을 공유하는 전문 금융 블로그입니다.',
  keywords: ['투자', '주식', 'ETF', '채권', '펀드', '금융', '재테크'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: process.env.SITE_URL || 'https://stock.advenoh.pe.kr',
    siteName: '투자 인사이트',
  },
  robots: {
    index: true,
    follow: true,
  }
}

// 메타데이터를 순회하면서 메타 태그를 생성하는 함수
function generateMetaTags(metadata: typeof siteMetadata): React.ReactElement[] {
  const metaTags: React.ReactElement[] = []
  
  // title 처리
  metaTags.push(<title key="title">{metadata.title}</title>)
  
  // description 처리
  metaTags.push(<meta key="description" name="description" content={metadata.description} />)
  
  // keywords 처리
  metaTags.push(<meta key="keywords" name="keywords" content={metadata.keywords.join(', ')} />)
  
  // robots 처리
  const robotsContent = []
  if (metadata.robots.index) robotsContent.push('index')
  if (metadata.robots.follow) robotsContent.push('follow')
  if (robotsContent.length > 0) {
    metaTags.push(<meta key="robots" name="robots" content={robotsContent.join(', ')} />)
  }
  
  // Open Graph 처리
  const og = metadata.openGraph
  metaTags.push(<meta key="og:title" property="og:title" content={og.siteName} />)
  metaTags.push(<meta key="og:description" property="og:description" content={metadata.description} />)
  metaTags.push(<meta key="og:site_name" property="og:site_name" content={og.siteName} />)
  metaTags.push(<meta key="og:locale" property="og:locale" content={og.locale} />)
  metaTags.push(<meta key="og:type" property="og:type" content={og.type} />)
  metaTags.push(<meta key="og:url" property="og:url" content={og.url} />)
  
  // Twitter Card 처리
  metaTags.push(<meta key="twitter:title" name="twitter:title" content={metadata.title} />)
  metaTags.push(<meta key="twitter:description" name="twitter:description" content={metadata.description} />)
  metaTags.push(<meta key="twitter:card" name="twitter:card" content="summary" />)
  
  return metaTags
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${inter.variable} ${notoSansKR.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="naver-site-verification" content="1e8908d89d0bff3a013d83b763543f37049a907f" />
        <meta name="msvalidate.01" content="6B5D48FAB4AC7D1E78A51352B904624B" />
        <link rel="icon" href="/favicon.ico" />
        {generateMetaTags(siteMetadata)}
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-9LNH27K1YS"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-9LNH27K1YS');
            `
          }}
        />
        
        {/* Google AdSense */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8868959494983515"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} ${notoSansKR.className} font-sans antialiased`}>
        <ThemeProvider>
          <ClientOnly>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ClientOnly>
        </ThemeProvider>
      </body>
    </html>
  )
}
