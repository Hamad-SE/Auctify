import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, TrendingUp, Award } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "Your security is our priority. All transactions are protected with industry-standard encryption.",
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Join thousands of verified buyers and sellers in our growing auction community.",
    },
    {
      icon: TrendingUp,
      title: "Fair Pricing",
      description: "Set your own prices and let the market decide. No hidden fees or surprises.",
    },
    {
      icon: Award,
      title: "Quality Items",
      description: "Browse curated collections of authentic, high-quality items across all categories.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 bg-gradient-primary text-white">
          <div className="container mx-auto px-4 text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Auctify</h1>
            <p className="text-xl max-w-3xl mx-auto text-white/90">
              Connecting buyers and sellers through transparent, exciting auctions
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Auctify was founded with a simple mission: to create a transparent, user-friendly platform 
                where anyone can buy and sell unique items at fair market prices. We believe in empowering 
                individuals to set their own prices and let the community determine true value.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're looking to find that perfect vintage watch, sell your collection of jewelry, 
                or discover hidden treasures, Auctify provides the tools and community to make it happen.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Auctify</h2>
              <p className="text-lg text-muted-foreground">What makes us different</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={feature.title} 
                  className="text-center hover:shadow-hover transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10">
                      <feature.icon className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="font-bold text-xl text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              <div className="flex flex-col md:flex-row gap-6 items-start animate-slide-in">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground mb-2">Create an Account</h3>
                  <p className="text-muted-foreground">
                    Sign up for free and join our community of buyers and sellers.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start animate-slide-in" style={{ animationDelay: "0.1s" }}>
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground mb-2">List Your Items</h3>
                  <p className="text-muted-foreground">
                    Upload photos, set your starting price, and choose your auction duration.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start animate-slide-in" style={{ animationDelay: "0.2s" }}>
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground mb-2">Start Bidding</h3>
                  <p className="text-muted-foreground">
                    Browse items, place bids, and watch auctions in real-time.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-start animate-slide-in" style={{ animationDelay: "0.3s" }}>
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-xl">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-xl text-foreground mb-2">Win & Complete</h3>
                  <p className="text-muted-foreground">
                    Win your bid, complete secure payment, and receive your item.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
