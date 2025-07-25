import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Server, 
  Globe, 
  User, 
  HelpCircle, 
  LogOut, 
  Menu,
  Settings,
  Shield,
  BarChart3,
  Users
} from "lucide-react";
import { UserProfile, authService, AuthState } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface DashboardLayoutProps {
  isAdmin?: boolean;
}

export function DashboardLayout({ isAdmin = false }: DashboardLayoutProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isAuthenticated: false,
    isLoading: true
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((state) => {
      setAuthState(state);
      
      if (!state.isAuthenticated && !state.isLoading) {
        navigate('/login');
        return;
      }
      
      if (isAdmin && state.profile?.role !== 'admin') {
        navigate('/dashboard');
        return;
      }
    });

    return unsubscribe;
  }, [navigate, isAdmin]);

  const handleLogout = async () => {
    await authService.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const userNavItems = [
    { 
      icon: <Globe className="h-4 w-4" />, 
      label: "Domains", 
      href: "/dashboard",
      active: location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard/domain")
    },
    { 
      icon: <User className="h-4 w-4" />, 
      label: "Profile", 
      href: "/dashboard/profile",
      active: location.pathname === "/dashboard/profile"
    },
    { 
      icon: <HelpCircle className="h-4 w-4" />, 
      label: "Support", 
      href: "/dashboard/support",
      active: location.pathname === "/dashboard/support"
    },
  ];

  const adminNavItems = [
    { 
      icon: <BarChart3 className="h-4 w-4" />, 
      label: "Overview", 
      href: "/admin",
      active: location.pathname === "/admin"
    },
    { 
      icon: <Users className="h-4 w-4" />, 
      label: "Users", 
      href: "/admin/users",
      active: location.pathname === "/admin/users"
    },
    { 
      icon: <Globe className="h-4 w-4" />, 
      label: "All Domains", 
      href: "/admin/domains",
      active: location.pathname === "/admin/domains" || location.pathname.startsWith("/admin/domain")
    },
    { 
      icon: <Settings className="h-4 w-4" />, 
      label: "Settings", 
      href: "/admin/settings",
      active: location.pathname === "/admin/settings"
    },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const SidebarContent = () => (
    <div className="flex h-full w-64 flex-col bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Server className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              DESTEK
            </span>
            {isAdmin && (
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary font-medium">Admin</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  item.active 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" 
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  if (!authState.isAuthenticated || !authState.profile) {
    return null; // Loading state or redirect handled in useEffect
  }

  const user = authState.profile;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
          </Sheet>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                       <p className="text-xs leading-none text-muted-foreground">
                         {authState.user?.email}
                       </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                          user.role === 'admin' 
                            ? "bg-primary/10 text-primary" 
                            : "bg-secondary text-secondary-foreground"
                        )}>
                          {user.role === 'admin' ? 'Administrator' : 'User'}
                        </span>
                         <span className="inline-flex items-center rounded-full bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                           {user.subscription_level}
                         </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}