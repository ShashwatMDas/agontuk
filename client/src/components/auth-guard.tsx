import { ReactNode, useEffect, useState } from "react";
import { authService } from "@/lib/auth";
import { User } from "@shared/schema";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const [user, setUser] = useState<Pick<User, 'id' | 'email' | 'role'> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.checkAuthState();
    setUser(currentUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || <div>Access denied</div>;
  }

  if (requiredRole && user.role !== requiredRole) {
    return fallback || <div>Insufficient permissions</div>;
  }

  return <>{children}</>;
}

export function useCurrentUser() {
  const [user, setUser] = useState<Pick<User, 'id' | 'email' | 'role'> | null>(
    authService.getCurrentUser()
  );

  useEffect(() => {
    const checkUser = () => {
      setUser(authService.getCurrentUser());
    };
    
    // Check periodically in case of logout
    const interval = setInterval(checkUser, 1000);
    return () => clearInterval(interval);
  }, []);

  return user;
}
