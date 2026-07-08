import { Outlet, useNavigate, useLocation, Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  UserCircle,
  Search,
  Handshake,
  FileText,
  Bell,
  Trophy,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/discover", label: "Discover", icon: Search },
  { path: "/matches", label: "Matches", icon: Handshake },
  { path: "/contracts", label: "Contracts", icon: FileText },
  { path: "/profile", label: "Profile", icon: UserCircle },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Redirect to onboarding if not onboarded
  useEffect(() => {
    if (isAuthenticated && user && !user.isOnboarded && location.pathname !== "/onboarding") {
      navigate("/onboarding");
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  const { data: unreadCount } = trpc.notification.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: creditData } = trpc.credit.balance.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const currentPath = location.pathname;

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 px-4 py-5">
        <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-gradient leading-tight">SkillSwap</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sync</span>
        </div>
      </Link>

      {/* Credit Balance */}
      <div className="mx-3 mb-4 p-3 rounded-xl glass-dark">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <CreditCard className="w-3 h-3" />
          <span>Credit Balance</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gradient">{creditData?.balance ?? 0}</span>
          <span className="text-xs text-muted-foreground">credits</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "gradient-accent text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{item.label}</span>
              {item.path === "/notifications" && unreadCount && unreadCount.count > 0 ? (
                <Badge variant="destructive" className="ml-auto h-5 min-w-5 text-[10px]">
                  {unreadCount.count}
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback className="text-xs bg-primary/20">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name ?? "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-muted-foreground hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl fixed h-screen z-30">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-gradient">SkillSwap</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/notifications" className="relative p-2">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount && unreadCount.count > 0 && (
                <Badge variant="destructive" className="absolute top-0.5 right-0.5 h-4 min-w-4 text-[9px] p-0 flex items-center justify-center">
                  {unreadCount.count}
                </Badge>
              )}
            </Link>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 gradient-hero">
                <NavContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-16 lg:pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
