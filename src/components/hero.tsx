'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Hero() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const searchUrl = `/?search=${encodeURIComponent(searchTerm.trim())}`;
      window.location.href = searchUrl;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="relative gradient-bg py-20 overflow-hidden">
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          투자 인사이트 블로그
        </h1>
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          국내외 주식, ETF, 채권, 펀드에 대한 전문적인 분석과 투자 인사이트를 제공합니다.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-2xl mx-auto">
          <div className="relative w-full sm:flex-1">
            <Input
              type="text"
              placeholder="관심 종목이나 키워드를 검색해보세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-5 py-3 pr-12 text-base border-0 rounded-lg bg-white/95 backdrop-blur-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 text-base shadow-lg rounded-lg font-medium transition-all duration-200"
          >
            검색하기
          </Button>
        </div>
      </div>
    </section>
  );
}
