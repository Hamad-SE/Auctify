import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Gem, Car, Smartphone, Laptop, Watch, Home as HomeIcon, ArrowRight, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Home = () => {
  const categories = [
    { name: "Jewelry", icon: Gem },
    { name: "Cars", icon: Car },
    { name: "Phones", icon: Smartphone },
    { name: "Electronics", icon: Laptop },
    { name: "Watches", icon: Watch },
    { name: "Real Estate", icon: HomeIcon },
  ];

  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: featuredAuctions = [], isLoading } = useQuery({
    queryKey: ["featured-auctions", searchQuery, categoryFilter, sortBy],
    queryFn: async () => {
      let query = supabase.from("auctions").select("*");

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "ending_soon") {
        query = query.order("end_date", { ascending: true });
      } else if (sortBy === "price_asc") {
        query = query.order("current_price", { ascending: true });
      } else if (sortBy === "price_desc") {
        query = query.order("current_price", { ascending: false });
      }

      query = query.limit(8);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────── */}
        <section style={{ position: 'relative', minHeight: '580px', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)' }}>

          {/* Decorative glow orbs */}
          <div style={{ position: 'absolute', top: '-80px', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-100px', left: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Subtle grid pattern */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

          <div className="relative container mx-auto px-4 animate-fade-in" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '9999px', background: 'rgba(37,99,235,0.3)', border: '1px solid rgba(99,102,241,0.4)', fontSize: '11px', fontFamily: 'Inter, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#93c5fd' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                Live Auctions — Bid in Real Time
              </span>
            </div>

            <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(2.6rem, 6vw, 4rem)', fontWeight: 800, color: '#ffffff', marginBottom: '20px', maxWidth: '700px', lineHeight: 1.08, letterSpacing: '-0.04em' }}>
              The smarter way to{' '}
              <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                buy &amp; sell
              </span>
              {' '}anything.
            </h1>

            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: 'rgba(255,255,255,0.65)', marginBottom: '36px', maxWidth: '500px', lineHeight: 1.7 }}>
              Browse live auctions on cars, jewelry, electronics &amp; more — from verified sellers worldwide.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '52px' }}>
              <Link to="/auction" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '14px', color: '#ffffff', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', padding: '13px 28px', borderRadius: '8px', textDecoration: 'none', letterSpacing: '-0.01em', boxShadow: '0 4px 20px rgba(37,99,235,0.5)', transition: 'opacity 0.15s, transform 0.15s' }}>
                Browse Auctions
              </Link>
              <Link to="/create-auction" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', color: '#ffffff', background: 'rgba(255,255,255,0.1)', padding: '13px 28px', borderRadius: '8px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', transition: 'background 0.2s' }}>
                Start Selling
              </Link>
            </div>

            {/* Stats row */}

          </div>
        </section>

        {/* ── Categories ───────────────────────── */}
        <section style={{ padding: '18px 0', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
          <div className="container mx-auto px-4">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => { setCategoryFilter(category.name.toLowerCase()); navigate(`/auction?category=${category.name.toLowerCase()}`); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 16px', borderRadius: '9999px', border: '1px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#475569', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#f8fafc'; }}
                >
                  <category.icon style={{ width: '14px', height: '14px' }} />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Auctions ────────────────── */}
        <section style={{ padding: '64px 0', background: '#f8fafc' }}>
          <div className="container mx-auto px-4">
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: '4px' }}>
                  Featured Auctions
                </h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#94a3b8' }}>
                  Hot items — updated in real time
                </p>
              </div>
              <Link to="/auction" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: '#2563eb', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>
                View all <ArrowRight style={{ width: '14px', height: '14px' }} />
              </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Input
                type="search"
                placeholder="Search items..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1"
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]" style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', fontFamily: 'Inter, sans-serif' }}>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }}>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name.toLowerCase()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]" style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', fontFamily: 'Inter, sans-serif' }}>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }}>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="ending_soon">Ending Soonest</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auction cards */}
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '64px 0' }}>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'hsl(0 0% 45%)', fontSize: '14px' }}>Loading auctions...</p>
              </div>
            ) : featuredAuctions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 0', borderRadius: '12px', background: 'hsl(0 0% 10%)', border: '1px solid hsl(0 0% 18%)' }}>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'hsl(0 0% 45%)' }}>No items match your search criteria.</p>
              </div>

            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {featuredAuctions.map((auction, index) => (
                  <div
                    key={auction.id}
                    className="card-shine animate-fade-in"
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', animationDelay: `${index * 0.07}s`, transition: 'all 0.22s ease' }}
                    onClick={() => navigate(`/auction/${auction.id}`)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb40'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,99,235,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <div style={{ height: '190px', overflow: 'hidden', background: '#ffffff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f1f5f9' }}>
                      {auction.image_url ? (
                        <img src={auction.image_url} alt={auction.title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px', transition: 'transform 0.4s ease' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)' }} />
                      )}
                      <span style={{ position: 'absolute', top: '10px', left: '10px', padding: '3px 10px', borderRadius: '9999px', fontSize: '10px', fontWeight: 600, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#ffffff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                        {auction.category}
                      </span>
                    </div>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.02em' }}>
                          {auction.title}
                        </h3>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#94a3b8', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {auction.description}
                        </p>
                      </div>
                      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: '9px', fontFamily: 'Inter, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '3px' }}>Current Bid</p>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', fontWeight: 800, color: '#2563eb', letterSpacing: '-0.03em' }}>
                            ${auction.current_price?.toLocaleString() || "0"}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '9px', fontFamily: 'Inter, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '3px' }}>Ends</p>
                          <p style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#64748b' }}>
                            {new Date(auction.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <button
                        style={{ marginTop: '12px', width: '100%', padding: '10px', fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#ffffff', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', border: 'none', borderRadius: '8px', cursor: 'pointer', letterSpacing: '-0.01em', transition: 'all 0.15s ease' }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/auction/${auction.id}`); }}
                      >
                        Place Bid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────── */}
        <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #1e3a8a, #312e81)', borderTop: '1px solid #e2e8f0' }}>
          <div className="container mx-auto px-4">
            <div style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#93c5fd', marginBottom: '14px' }}>Get Started Today</p>
              <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.04em', marginBottom: '14px' }}>
                Ready to start bidding?
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.62)', marginBottom: '32px', lineHeight: 1.65 }}>
                Join thousands of buyers and sellers on Auctify. Free to join, easy to use.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                <Link to="/signup" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '14px', color: '#1e3a8a', background: '#ffffff', padding: '13px 28px', borderRadius: '8px', textDecoration: 'none', letterSpacing: '-0.01em', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', transition: 'opacity 0.15s, transform 0.15s' }}>
                  Create Free Account
                </Link>
                <Link to="/auction" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px', color: '#ffffff', background: 'rgba(255,255,255,0.12)', padding: '13px 28px', borderRadius: '8px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', transition: 'all 0.2s' }}>
                  Browse First
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
