import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

// User profile interface matching our database schema
export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  role: 'admin' | 'user';
  subscription_level: 'basic' | 'pro' | 'enterprise';
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService {
  private static instance: AuthService;
  private user: SupabaseUser | null = null;
  private profile: UserProfile | null = null;
  private session: Session | null = null;
  private listeners: ((authState: AuthState) => void)[] = [];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        this.session = session;
        this.user = session?.user ?? null;
        
        if (session?.user) {
          // Use setTimeout to defer the async operation
          setTimeout(() => {
            this.loadUserProfile(session.user!.id);
          }, 0);
        } else {
          this.profile = null;
          this.notifyListeners();
        }
      }
    );

    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      this.session = session;
      this.user = session.user;
      await this.loadUserProfile(session.user.id);
    }
    
    this.notifyListeners();
  }

  private async loadUserProfile(userId: string): Promise<void> {
    try {
      console.log('Loading profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading user profile:', error);
        this.profile = null;
      } else {
        console.log('Profile loaded:', data);
        this.profile = data;
      }
      
      this.notifyListeners();
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.profile = null;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    const authState: AuthState = {
      user: this.user,
      profile: this.profile,
      session: this.session,
      isAuthenticated: !!this.user,
      isLoading: false
    };
    
    this.listeners.forEach(listener => listener(authState));
  }

  onAuthStateChange(callback: (authState: AuthState) => void) {
    this.listeners.push(callback);
    
    // Call immediately with current state
    const authState: AuthState = {
      user: this.user,
      profile: this.profile,
      session: this.session,
      isAuthenticated: !!this.user,
      isLoading: false
    };
    callback(authState);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async signIn(email: string, password: string): Promise<{ 
    success: boolean; 
    requiresTwoFactor?: boolean; 
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if user has 2FA enabled
      if (data.user) {
        await this.loadUserProfile(data.user.id);
        
        if (this.profile?.two_factor_enabled) {
          // User has 2FA enabled, require verification
          return { success: true, requiresTwoFactor: true };
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async signUp(email: string, password: string, metadata?: { name?: string; role?: string }): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async verifyTwoFactor(code: string): Promise<{ success: boolean; error?: string }> {
    // Mock 2FA verification for now
    // In a real implementation, you'd verify the TOTP code against the user's secret
    if (code.length === 6 && /^\d+$/.test(code)) {
      return { success: true };
    }
    return { success: false, error: 'Invalid verification code' };
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  getCurrentUser(): SupabaseUser | null {
    return this.user;
  }

  getCurrentProfile(): UserProfile | null {
    return this.profile;
  }

  getSession(): Session | null {
    return this.session;
  }

  isAuthenticated(): boolean {
    return !!this.user;
  }

  isAdmin(): boolean {
    return this.profile?.role === 'admin';
  }

  // Backwards compatibility methods
  async login(email: string, password: string): Promise<{ 
    success: boolean; 
    requiresTwoFactor?: boolean; 
    user?: UserProfile;
  }> {
    const result = await this.signIn(email, password);
    return {
      success: result.success,
      requiresTwoFactor: result.requiresTwoFactor,
      user: this.profile || undefined
    };
  }

  async logout(): Promise<void> {
    await this.signOut();
  }
}

// Backwards compatibility exports
export type User = UserProfile;

export const authService = AuthService.getInstance();