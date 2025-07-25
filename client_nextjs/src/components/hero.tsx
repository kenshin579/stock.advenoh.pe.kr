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
      router.push(searchUrl);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="gradient-bg py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          투자 인사이트 블로그
        </h1>
        <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto">
          국내외 주식, ETF, 채권, 펀드에 대한 전문적인 분석과 투자 인사이트를 제공합니다.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative w-full sm:w-96">
            <Input
              type="text"
              placeholder="관심 종목이나 키워드를 검색해보세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-6 py-4 pr-12 text-lg border-0 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-lg"
            />
            <Search className="absolute right-4 top-5 text-gray-400 text-lg" />
          </div>
          <Button
            onClick={handleSearch}
            className="btn-primary px-8 py-4 text-lg shadow-lg"
          >
            검색하기
          </Button>
        </div>
      </div>
    </section>
  );
}
