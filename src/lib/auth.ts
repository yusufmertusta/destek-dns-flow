// Mock authentication system
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  subscriptionLevel: 'basic' | 'pro' | 'enterprise';
  twoFactorEnabled: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Mock users for demo (defined here to avoid circular import)
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@destek.dev',
    role: 'admin',
    subscriptionLevel: 'enterprise',
    twoFactorEnabled: true
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    subscriptionLevel: 'pro',
    twoFactorEnabled: true
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@company.com',
    role: 'user',
    subscriptionLevel: 'basic',
    twoFactorEnabled: false
  }
];

class AuthService {
  private static instance: AuthService;
  private user: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<{ success: boolean; requiresTwoFactor?: boolean; user?: User }> {
    // Mock login logic
    const user = mockUsers.find(u => u.email === email);
    
    if (!user || password !== 'password123') {
      return { success: false };
    }

    if (user.twoFactorEnabled) {
      // Store pending user for 2FA verification
      sessionStorage.setItem('pendingUser', JSON.stringify(user));
      return { success: true, requiresTwoFactor: true };
    }

    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
    return { success: true, user };
  }

  async verifyTwoFactor(code: string): Promise<{ success: boolean; user?: User }> {
    const pendingUserStr = sessionStorage.getItem('pendingUser');
    if (!pendingUserStr) {
      return { success: false };
    }

    // Mock 2FA verification (accept any 6-digit code)
    if (code.length === 6 && /^\d+$/.test(code)) {
      const user = JSON.parse(pendingUserStr);
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.removeItem('pendingUser');
      return { success: true, user };
    }

    return { success: false };
  }

  logout(): void {
    this.user = null;
    localStorage.removeItem('user');
    sessionStorage.removeItem('pendingUser');
  }

  getCurrentUser(): User | null {
    if (this.user) return this.user;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
      return this.user;
    }
    
    return null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = AuthService.getInstance();