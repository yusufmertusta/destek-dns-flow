import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Server, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { authService, AuthState } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export function LoginPage() {
  const [step, setStep] = useState<'login' | 'twoFactor'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isAuthenticated: false,
    isLoading: false
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((state) => {
      console.log('LoginPage - Auth state changed:', state);
      setAuthState(state);
      
      // Navigate when authenticated - try immediately, or with delay if profile not ready
      if (state.isAuthenticated && state.user) {
        if (state.profile) {
          // Profile loaded, navigate immediately
          const redirectPath = state.profile.role === 'admin' ? '/admin' : '/dashboard';
          console.log('Navigating to:', redirectPath);
          setTimeout(() => navigate(redirectPath), 100); // Small delay to ensure smooth navigation
        } else {
          // Profile not loaded yet, wait and then navigate with default
          console.log('Profile not loaded, waiting...');
          setTimeout(() => {
            const currentProfile = authService.getCurrentProfile();
            const redirectPath = currentProfile?.role === 'admin' ? '/admin' : '/dashboard';
            console.log('Delayed navigation to:', redirectPath, 'Profile:', currentProfile);
            navigate(redirectPath);
          }, 1500);
        }
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login...');
      const result = await authService.signIn(email, password);
      console.log('Login result:', result);
      
      if (result.success) {
        if (result.requiresTwoFactor) {
          setStep('twoFactor');
          toast({
            title: "2FA Required",
            description: "Please enter your two-factor authentication code.",
          });
          setIsLoading(false);
        } else {
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          // Reset loading state and let auth state listener handle navigation
          setIsLoading(false);
        }
      } else {
        setError(result.error || 'Invalid email or password');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
      setIsLoading(false);
    }
  };

  const handleTwoFactorVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.verifyTwoFactor(twoFactorCode);
      
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        // Navigation will be handled by auth state change listener
      } else {
        setError(result.error || 'Invalid authentication code');
      }
    } catch (error) {
      setError('An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToLogin = () => {
    setStep('login');
    setTwoFactorCode('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Server className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DESTEK
            </span>
          </Link>
          <p className="text-muted-foreground mt-2">DNS Management Platform</p>
        </div>

        <Card className="bg-gradient-card border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {step === 'login' ? 'Welcome Back' : 'Two-Factor Authentication'}
            </CardTitle>
            <CardDescription>
              {step === 'login' 
                ? 'Sign in to your DESTEK account' 
                : 'Enter the 6-digit code from your authenticator app'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@destek.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleTwoFactorVerification} className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                    <Shield className="h-8 w-8" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Please enter the 6-digit verification code from your authenticator app.
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={setTwoFactorCode}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary hover:opacity-90" 
                    disabled={isLoading || twoFactorCode.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={goBackToLogin}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </div>
              </form>
            )}

            {step === 'login' && (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Button variant="link" className="text-sm text-muted-foreground">
                    Forgot your password?
                  </Button>
                </div>

                  <div className="border-t pt-4">
                    <div className="text-sm text-muted-foreground text-center">
                      <p className="mb-2">Test the app with Supabase authentication:</p>
                      <p className="text-xs">Create an account or sign in with your credentials</p>
                      <p className="text-xs mt-2">2FA Code: Any 6 digits (e.g., 123456)</p>
                    </div>
                  </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}