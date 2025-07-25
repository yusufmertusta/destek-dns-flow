import { useState, useEffect } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Server, 
  Globe, 
  User, 
  HelpCircle, 
  LogOut,
  Settings,
  Shield,
  BarChart3,
  Users,
  Menu
} from "lucide-react";
import { authService, AuthState } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  isAdmin?: boolean;
}

function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const userNavItems = [
    { 
      icon: Globe, 
      label: "Domains", 
      href: "/dashboard",
      active: currentPath === "/dashboard" || currentPath.startsWith("/dashboard/domain")
    },
    { 
      icon: User, 
      label: "Profile", 
      href: "/dashboard/profile",
      active: currentPath === "/dashboard/profile"
    },
    { 
      icon: HelpCircle, 
      label: "Support", 
      href: "/dashboard/support",
      active: currentPath === "/dashboard/support"
    },
  ];

  const adminNavItems = [
    { 
      icon: BarChart3, 
      label: "Overview", 
      href: "/admin",
      active: currentPath === "/admin"
    },
    { 
      icon: Users, 
      label: "Users", 
      href: "/admin/users",
      active: currentPath === "/admin/users"
    },
    { 
      icon: Globe, 
      label: "All Domains", 
      href: "/admin/domains",
      active: currentPath === "/admin/domains" || currentPath.startsWith("/admin/domain")
    },
    { 
      icon: Settings, 
      label: "Settings", 
      href: "/admin/settings",
      active: currentPath === "/admin/settings"
    },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex h-16 items-center border-b px-4">
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

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={item.active}>
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function DashboardLayout({ isAdmin = false }: DashboardLayoutProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isAuthenticated: false,
    isLoading: true
  });
  const navigate = useNavigate();
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

  if (!authState.isAuthenticated || !authState.profile) {
    return null;
  }

  const user = authState.profile;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar isAdmin={isAdmin} />
        
        <div className="flex-1">
          {/* Top Navigation */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <SidebarTrigger />

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
          </header>

          {/* Page Content */}
          <main className="flex-1">
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}