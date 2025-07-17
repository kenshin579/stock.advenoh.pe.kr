import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const subscribeToNewsletter = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/newsletter/subscribe", { email });
    },
    onSuccess: () => {
      toast({
        title: "구독 완료",
        description: "뉴스레터 구독이 완료되었습니다.",
      });
      setEmail("");
    },
    onError: (error: Error) => {
      toast({
        title: "구독 실패",
        description: error.message || "뉴스레터 구독에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      subscribeToNewsletter.mutate(email);
    }
  };

  return (
    <section className="bg-primary py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">투자 인사이트 뉴스레터</h2>
        <p className="text-xl text-blue-100 mb-8">
          주간 시장 분석과 투자 아이디어를 이메일로 받아보세요
        </p>
        <form 
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row justify-center items-center max-w-md mx-auto space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <Input
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-6 py-3 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto"
            required
          />
          <Button
            type="submit"
            disabled={subscribeToNewsletter.isPending}
            className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors w-full sm:w-auto"
          >
            {subscribeToNewsletter.isPending ? "구독 중..." : "구독하기"}
          </Button>
        </form>
      </div>
    </section>
  );
}
