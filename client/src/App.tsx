import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LofiPlayer from "@/components/LofiPlayer";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LofiPlayer />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
