import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Gavel } from "lucide-react";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate("/");
    });

    return () => {};
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account created!", description: "Let's set up your payment method." });
      navigate("/payment-methods");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex">
        {/* Left — brand panel */}
        <div className="hidden lg:flex lg:w-5/12 bg-primary flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-accent" />
            <span className="font-display text-xl text-white tracking-tight" style={{ letterSpacing: "-0.02em" }}>
              Auctify
            </span>
          </div>

          <div className="space-y-6">
            <h2 className="font-display text-3xl text-white leading-snug">
              Join thousands of buyers and sellers.
            </h2>
            <ul className="space-y-3">
              {[
                "List your items in under 2 minutes",
                "Bid on exclusive items worldwide",
                "Secure payments, guaranteed",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-white/65 text-sm">
                  <span className="mt-0.5 h-4 w-4 rounded-full bg-accent/20 text-accent flex items-center justify-center text-[10px] flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-white/30 text-xs">© {new Date().getFullYear()} Auctify</p>
        </div>

        {/* Right — form */}
        <div className="flex-1 flex items-center justify-center px-6 py-16 bg-background">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="font-display text-3xl text-foreground mb-1">Create your account</h1>
              <p className="text-muted-foreground text-sm">Free to join — start bidding in minutes</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-foreground mb-1.5 block">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground mb-1.5 block">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-foreground mb-1.5 block">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary text-white hover:bg-primary/90 font-semibold rounded-md"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-center mt-6 text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-accent font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Signup;
