import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Home as HomeIcon,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  } catch {
    return false;
  }
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => getInitialTheme());
  const { user, isAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "theme" && (e.newValue === "dark" || e.newValue === "light")) {
        setIsDark(e.newValue === "dark");
      }
    };
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onMedia = (e) => {
      const saved = localStorage.getItem("theme");
      if (!saved) setIsDark(e.matches);
    };
    window.addEventListener("storage", onStorage);
    media?.addEventListener?.("change", onMedia);
    return () => {
      window.removeEventListener("storage", onStorage);
      media?.removeEventListener?.("change", onMedia);
    };
  }, []);

  const toggleTheme = () => setIsDark((v) => !v);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/hostels", label: "Hostels", icon: Building2 },
    { href: "/rooms", label: "Rooms", icon: BookOpen },
  ];

  const userLinks = isAuth
    ? [
        ...(user?.role === "admin"
          ? [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }]
          : []),
        { href: "/bookings", label: "My Bookings", icon: BookOpen },
        { href: "/profile", label: "Profile", icon: User },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-bg shadow-glow transition-transform group-hover:scale-110">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              HostelHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/50"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg p-2 hover:bg-accent/50 transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuth ? (
              <div className="flex items-center gap-2">
                {userLinks.map((link) => (
                  <Button key={link.href} variant="ghost" asChild>
                    <Link to={link.href} className="flex items-center gap-2">
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </Button>
                ))}
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-accent/50 transition-colors rounded-lg"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen((o) => !o)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {[...navLinks, ...userLinks].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/50 w-fit transition-colors"
                >
                  <link.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}

              {isAuth ? (
                <Button
                  variant="outline"
                  className="w-fit mt-4"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <div className="flex w-fit flex-col gap-2 pt-4">
                  <Button variant="outline" asChild>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
