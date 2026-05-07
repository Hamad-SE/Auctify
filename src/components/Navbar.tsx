import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Gavel, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => setUser(session?.user ?? null)
    );
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "You have been logged out successfully." });
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Auction", path: "/auction" },
    { name: "About", path: "/about" },
    { name: "Payments", path: "/payment-methods" },
    { name: "Contact", path: "/contact" },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  const navStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    width: '100%',
    background: '#ffffff',
    borderBottom: '1px solid hsl(214 32% 91%)',
    boxShadow: scrolled ? '0 2px 16px -4px rgba(0,0,0,0.1)' : 'none',
    transition: 'box-shadow 0.3s ease',
  };

  const logoText: React.CSSProperties = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '20px',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.04em',
    lineHeight: 1,
  };

  const navLinkBase: React.CSSProperties = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'color 0.15s ease',
    letterSpacing: '-0.01em',
  };

  return (
    <nav style={navStyle}>
      <div className="container mx-auto px-4">
        <div style={{ display: 'flex', height: '64px', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Gavel style={{ width: '15px', height: '15px', color: '#fff' }} />
            </div>
            <span style={logoText}>Auctify</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '32px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  ...navLinkBase,
                  color: isActivePath(link.path) ? '#2563eb' : '#64748b',
                  fontWeight: isActivePath(link.path) ? 600 : 500,
                }}
                onMouseEnter={e => { if (!isActivePath(link.path)) e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={e => { if (!isActivePath(link.path)) e.currentTarget.style.color = '#64748b'; }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '10px' }}>
            {user ? (
              <>
                <span style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" asChild style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#475569' }}>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout} style={{ fontFamily: 'Inter, sans-serif', color: '#94a3b8' }}>
                  <LogOut style={{ width: '14px', height: '14px', marginRight: '6px' }} />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#475569', fontSize: '14px' }}>
                  <Link to="/login">Log in</Link>
                </Button>
                <Link
                  to="/signup"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '14px', fontWeight: 600,
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                    padding: '8px 18px', borderRadius: '8px',
                    textDecoration: 'none', letterSpacing: '-0.01em',
                    boxShadow: '0 1px 6px rgba(37,99,235,0.3)',
                    transition: 'opacity 0.15s, transform 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden"
            style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X style={{ width: '20px', height: '20px' }} /> : <Menu style={{ width: '20px', height: '20px' }} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden animate-fade-in" style={{ borderTop: '1px solid hsl(214 32% 91%)', padding: '12px 0 16px', background: '#fff' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    padding: '10px 12px', fontSize: '14px', fontWeight: 500,
                    borderRadius: '6px', textDecoration: 'none',
                    color: isActivePath(link.path) ? '#2563eb' : '#475569',
                    background: isActivePath(link.path) ? '#eff6ff' : 'transparent',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {link.name}
                </Link>
              ))}
              <div style={{ paddingTop: '10px', marginTop: '4px', borderTop: '1px solid hsl(214 32% 91%)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {user ? (
                  <>
                    <span style={{ padding: '0 12px', fontSize: '12px', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>{user.email}</span>
                    <Button variant="ghost" size="sm" asChild style={{ justifyContent: 'flex-start' }}><Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link></Button>
                    <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setIsMenuOpen(false); }} style={{ justifyContent: 'flex-start', color: '#94a3b8' }}>
                      <LogOut style={{ width: '14px', height: '14px', marginRight: '8px' }} />Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" asChild style={{ justifyContent: 'flex-start', color: '#475569' }}><Link to="/login" onClick={() => setIsMenuOpen(false)}>Log in</Link></Button>
                    <Button size="sm" asChild style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff', fontWeight: 600 }}>
                      <Link to="/signup" onClick={() => setIsMenuOpen(false)}>Sign up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
