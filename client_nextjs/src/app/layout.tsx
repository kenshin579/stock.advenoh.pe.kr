import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: '투자 인사이트 - 주식, ETF, 채권, 펀드 전문 블로그',
    template: '%s | 투자 인사이트'
  },
  description: '투자에 대한 깊이 있는 인사이트와 실전 경험을 공유하는 전문 금융 블로그입니다.',
  keywords: ['투자', '주식', 'ETF', '채권', '펀드', '금융', '재테크'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: process.env.SITE_URL,
    siteName: '투자 인사이트',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.SITE_URL || 'https://stock.advenoh.pe.kr')
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
