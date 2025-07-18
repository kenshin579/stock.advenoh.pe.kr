import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, ChartLine, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";
import { SearchBar } from "@/components/search-bar";
import { useQuery } from "@tanstack/react-query";

interface Category {
  category: string;
  count: number;
}

export function Header() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch categories from API
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
  });

  // Category labels mapping
  const categoryLabels: { [key: string]: string } = {
    etf: "ETF",
    ETF: "ETF",
    stock: "주식",
    weekly: "주간분석",
    etc: "기타"
  };

  // Generate navigation items dynamically
  const navItems = [
    { href: "/", label: "전체" },
    ...(categories?.map(({ category }) => ({
      href: `/?category=${category}`,
      label: categoryLabels[category] || category
    })) || [])
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <ChartLine className="text-primary text-2xl" />
            <span className="text-xl font-bold text-primary">투자 인사이트</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors ${
                  location === item.href ? "text-primary" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Search & Dark Mode Toggle */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden sm:block">
              <SearchBar />
            </div>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="relative w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <span className="sr-only">다크 모드 토글</span>
              <div className="relative w-5 h-5 overflow-hidden flex items-center justify-center">
                <Sun
                  className={`absolute w-5 h-5 text-yellow-500 transition-all duration-300 transform ${
                    theme === "dark" 
                      ? "translate-y-8 rotate-90 opacity-0" 
                      : "translate-y-0 rotate-0 opacity-100"
                  }`}
                />
                <Moon
                  className={`absolute w-5 h-5 text-blue-600 transition-all duration-300 transform ${
                    theme === "dark" 
                      ? "translate-y-0 rotate-0 opacity-100" 
                      : "-translate-y-8 -rotate-90 opacity-0"
                  }`}
                />
              </div>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-3 py-2 sm:hidden">
                <SearchBar />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
