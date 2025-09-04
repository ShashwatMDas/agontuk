import { User } from "@shared/schema";

interface LoginResponse {
  user: Pick<User, 'id' | 'email' | 'role'>;
}

class AuthService {
  private currentUser: Pick<User, 'id' | 'email' | 'role'> | null = null;

  getCurrentUser() {
    return this.currentUser;
  }

  async login(email: string, password: string): Promise<Pick<User, 'id' | 'email' | 'role'>> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data: LoginResponse = await response.json();
    this.currentUser = data.user;
    
    // Store in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    
    return data.user;
  }

  async register(email: string, password: string, role: string = 'customer'): Promise<Pick<User, 'id' | 'email' | 'role'>> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, role })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data: LoginResponse = await response.json();
    this.currentUser = data.user;
    
    // Store in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    
    return data.user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  // Check if user is already logged in from localStorage
  checkAuthState(): Pick<User, 'id' | 'email' | 'role'> | null {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
    return null;
  }
}

export const authService = new AuthService();
