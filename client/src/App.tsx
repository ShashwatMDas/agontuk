import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoginForm } from "@/components/login-form";
import { AuthGuard } from "@/components/auth-guard";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginForm} />
      
      <Route path="/">
        <AuthGuard 
          requiredRole="customer" 
          fallback={<LoginForm />}
        >
          <Home />
        </AuthGuard>
      </Route>
      
      <Route path="/admin">
        <AuthGuard 
          requiredRole="admin" 
          fallback={<LoginForm />}
        >
          <AdminDashboard />
        </AuthGuard>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
