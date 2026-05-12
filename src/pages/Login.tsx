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

const Login = () => {
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
    return () => {};
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    if (!email.toLowerCase().endsWith("@gmail.com")) {
      toast({ title: "Invalid Email", description: "Only @gmail.com email addresses are allowed.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!", description: "You've been signed in." });

      const { data: methods } = await supabase
        .from("user_payment_methods")
        .select("id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .limit(1);

      navigate(!methods || methods.length === 0 ? "/payment-methods" : "/");
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

          <div>
            <blockquote className="font-display text-3xl text-white leading-snug mb-6">
              "The thrill of winning an auction is unlike anything else."
            </blockquote>
            <p className="text-white/50 text-sm">Bid on exceptional items from verified sellers worldwide.</p>
          </div>

          <p className="text-white/30 text-xs">© {new Date().getFullYear()} Auctify</p>
        </div>

        {/* Right — form */}
        <div className="flex-1 flex items-center justify-center px-6 py-16 bg-background">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="font-display text-3xl text-foreground mb-1">Welcome back</h1>
              <p className="text-muted-foreground text-sm">Sign in to your Auctify account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground mb-1.5 block">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-11 ${email && !email.toLowerCase().endsWith("@gmail.com") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  required
                />
                {email && !email.toLowerCase().endsWith("@gmail.com") && (
                  <p className="text-red-500 text-xs mt-1">Email must end with @gmail.com</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-center mt-6 text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-accent font-medium hover:underline">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
