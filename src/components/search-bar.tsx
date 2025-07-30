'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({ className = "", placeholder = "검색..." }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const searchUrl = `/?search=${encodeURIComponent(searchTerm.trim())}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(searchUrl as any);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        className="search-input w-64 pr-10"
      />
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
        onClick={handleSearch}
      >
        <Search className="h-4 w-4 text-gray-400" />
      </Button>
    </div>
  );
}
