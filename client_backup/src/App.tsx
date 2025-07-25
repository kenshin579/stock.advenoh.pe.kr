import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import BlogPost from "@/pages/blog-post";
import SeriesPage from "@/pages/series";
import SeriesDetailPage from "@/pages/series-detail";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/series" component={SeriesPage} />
      <Route path="/series/:seriesName" component={SeriesDetailPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
