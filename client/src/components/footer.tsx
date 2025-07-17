import { Link } from "wouter";
import { ChartLine, Twitter, Linkedin, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <ChartLine className="text-primary text-2xl" />
              <span className="text-xl font-bold">투자 인사이트</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              국내외 주식, ETF, 채권, 펀드에 대한 전문적인 분석과 투자 인사이트를 제공하는 개인 블로그입니다.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">카테고리</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/?category=stocks" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  주식
                </Link>
              </li>
              <li>
                <Link 
                  href="/?category=etf" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ETF
                </Link>
              </li>
              <li>
                <Link 
                  href="/?category=bonds" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  채권
                </Link>
              </li>
              <li>
                <Link 
                  href="/?category=funds" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  펀드
                </Link>
              </li>
              <li>
                <Link 
                  href="/?category=analysis" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  시장분석
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">정보</h3>
            <ul className="space-y-2">

              <li>
                <a href="/api/rss" className="text-gray-400 hover:text-white transition-colors">
                  RSS
                </a>
              </li>
              <li>
                <a href="/robots.txt" className="text-gray-400 hover:text-white transition-colors">
                  Robots.txt
                </a>
              </li>
              <li>
                <a href="/api/sitemap.xml" className="text-gray-400 hover:text-white transition-colors">
                  사이트맵
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 투자 인사이트 블로그. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
