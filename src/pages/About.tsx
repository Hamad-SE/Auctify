import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Users, TrendingUp, Award, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BlogPostType {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  read_time: string;
  created_at: string;
}

const About = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPostType[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const features = [
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "All transactions are protected with industry-standard encryption.",
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Thousands of verified buyers and sellers in our growing marketplace.",
    },
    {
      icon: TrendingUp,
      title: "Fair Pricing",
      description: "Set your own prices and let the market determine true value.",
    },
    {
      icon: Award,
      title: "Quality Items",
      description: "Curated, authentic, high-quality items across every category.",
    },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setBlogPosts(data);
    };
    fetchPosts();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error: dbError } = await supabase
      .from("newsletter_subscribers")
      .insert([{ email }]);

    if (dbError) {
      if (dbError.code === "23505") {
        toast({ title: "Already subscribed", description: "You're already subscribed!" });
      } else {
        toast({ title: "Error", description: "Failed to subscribe. Please try again.", variant: "destructive" });
      }
      setLoading(false);
      return;
    }

    const { error: emailError } = await supabase.functions.invoke("send-newsletter-email", {
      body: { email },
    });
    if (emailError) console.error("Email error:", emailError);

    toast({ title: "Subscribed!", description: "Check your inbox for a welcome email." });
    setEmail("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ── Page header ───────────────────────── */}
        <section className="py-14 bg-white border-b border-border">
          <div className="container mx-auto px-4">
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-3">About Us</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground max-w-xl">
              Built to make auctions accessible to everyone.
            </h1>
          </div>
        </section>

        {/* ── Mission ───────────────────────────── */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-5 animate-fade-in">
                <h2 className="font-display text-3xl text-foreground">Our mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Auctify was founded with a simple idea: create a transparent, user-friendly platform
                  where anyone can buy and sell unique items at fair market prices. We believe in empowering
                  individuals to set their own prices and let the community determine true value.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you're finding that perfect vintage watch, selling a jewelry collection,
                  or discovering hidden treasures — Auctify gives you the tools and community to make it happen.
                </p>
                <Button asChild className="bg-primary text-white hover:bg-primary/90 rounded-md mt-2">
                  <Link to="/auction">Explore Auctions</Link>
                </Button>
              </div>

              {/* Stats panel */}
              <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
                {[
                  { value: "10,000+", label: "Active Listings" },
                  { value: "5,000+", label: "Registered Users" },
                  { value: "98%", label: "Satisfaction Rate" },
                  { value: "24/7", label: "Support Available" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-muted/50 border border-border rounded-lg p-6"
                  >
                    <p className="font-display text-3xl text-accent">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────── */}
        <section className="py-16 bg-muted/40 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="mb-10">
              <h2 className="font-display text-3xl text-foreground">Why choose Auctify</h2>
              <p className="text-muted-foreground mt-1 text-sm">What sets us apart from the rest</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="bg-white border border-border rounded-lg p-6 animate-fade-in"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────── */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10">
              <h2 className="font-display text-3xl text-foreground">How it works</h2>
            </div>

            <div className="max-w-3xl">
              {[
                {
                  step: "01",
                  title: "Create an account",
                  desc: "Sign up for free and join our community of buyers and sellers.",
                },
                {
                  step: "02",
                  title: "List your items",
                  desc: "Upload photos, set your starting price, and choose your auction duration.",
                },
                {
                  step: "03",
                  title: "Start bidding",
                  desc: "Browse items, place bids, and watch auctions in real-time.",
                },
                {
                  step: "04",
                  title: "Win & complete",
                  desc: "Win your bid, complete secure payment, and receive your item.",
                },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className="flex gap-6 pb-8 animate-slide-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    {i < 3 && <div className="w-px flex-1 mt-2 bg-border" />}
                  </div>
                  <div className="pb-2">
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Blog / Insights ───────────────────── */}
        {blogPosts.length > 0 && (
          <section className="py-16 bg-muted/40 border-y border-border">
            <div className="container mx-auto px-4">
              <div className="mb-10">
                <h2 className="font-display text-3xl text-foreground">Latest insights</h2>
                <p className="text-sm text-muted-foreground mt-1">Tips, guides, and trends for auction success</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts.map((post, index) => (
                  <Link to={`/blog/${post.slug}`} key={post.id}>
                    <div
                      className="group bg-white border border-border rounded-lg overflow-hidden hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 0.08}s` }}
                    >
                      <div className="h-40 bg-gradient-to-br from-primary/8 to-accent/8" />
                      <div className="p-5">
                        <span className="badge-pill bg-accent/10 text-accent mb-3 inline-flex">
                          {post.category}
                        </span>
                        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(post.created_at).toLocaleDateString("en-US", {
                              year: "numeric", month: "short", day: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {post.read_time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Newsletter ────────────────────────── */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center">
              <h2 className="font-display text-3xl text-foreground mb-3">Stay in the loop</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Subscribe for auction tips, trending items, and exclusive deals.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-11"
                  required
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-white hover:bg-primary/90 h-11 px-6 rounded-md"
                >
                  {loading ? "..." : "Subscribe"}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
