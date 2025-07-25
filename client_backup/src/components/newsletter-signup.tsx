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

  return null;
}
