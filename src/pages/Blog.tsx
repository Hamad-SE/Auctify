import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock } from "lucide-react";
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

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPostType[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setBlogPosts(data);
      }
    };

    fetchPosts();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Save to database
    const { error: dbError } = await supabase
      .from("newsletter_subscribers")
      .insert([{ email }]);

    if (dbError) {
      if (dbError.code === "23505") {
        toast({
          title: "Already subscribed",
          description: "You're already subscribed to our newsletter!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to subscribe. Please try again.",
          variant: "destructive",
        });
      }
      setLoading(false);
      return;
    }

    // Send welcome email
    const { error: emailError } = await supabase.functions.invoke("send-newsletter-email", {
      body: { email },
    });

    if (emailError) {
      console.error("Email error:", emailError);
    }

    toast({
      title: "Success!",
      description: "You've been subscribed to our newsletter. Check your email!",
    });

    setEmail("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 bg-gradient-primary text-white">
          <div className="container mx-auto px-4 text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Auctify Blog</h1>
            <p className="text-xl max-w-3xl mx-auto text-white/90">
              Tips, guides, and insights for auction success
            </p>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <Link 
                  to={`/blog/${post.slug}`}
                  key={post.id}
                >
                  <Card 
                    className="group cursor-pointer hover:shadow-hover transition-all duration-300 overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 group-hover:scale-105 transition-transform duration-300" />
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-xl text-foreground group-hover:text-accent transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(post.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.read_time}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Stay Updated</h2>
              <p className="text-lg text-muted-foreground">
                Subscribe to our newsletter for the latest auction tips, trends, and exclusive deals.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="px-6"
                >
                  {loading ? "Subscribing..." : "Subscribe"}
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

export default Blog;
