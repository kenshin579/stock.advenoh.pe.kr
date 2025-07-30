import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다',
  description: '요청하신 페이지를 찾을 수 없습니다.',
}

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>또는 다음 링크들을 이용해보세요:</p>
            <div className="mt-2 space-x-4">
              <Link href="/series" className="text-primary hover:underline">
                시리즈
              </Link>
              <Link href="/?category=Stock" className="text-primary hover:underline">
                주식
              </Link>
              <Link href="/?category=ETF" className="text-primary hover:underline">
                ETF
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}