import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Gem, Car, Smartphone, Laptop, Watch, Home as HomeIcon, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-auction.jpg";

const Home = () => {
  const categories = [
    { name: "Jewelry", icon: Gem, color: "text-amber-500" },
    { name: "Cars", icon: Car, color: "text-blue-500" },
    { name: "Phones", icon: Smartphone, color: "text-green-500" },
    { name: "Electronics", icon: Laptop, color: "text-purple-500" },
    { name: "Watches", icon: Watch, color: "text-red-500" },
    { name: "Real Estate", icon: HomeIcon, color: "text-indigo-500" },
  ];

  const navigate = useNavigate();

  const featuredAuctions = [
    { id: "1", title: "Vintage Rolex Watch", currentBid: "$5,200", timeLeft: "2h 15m", category: "Watches" },
    { id: "2", title: "Diamond Necklace", currentBid: "$8,500", timeLeft: "5h 30m", category: "Jewelry" },
    { id: "3", title: "iPhone 15 Pro Max", currentBid: "$1,100", timeLeft: "1h 45m", category: "Phones" },
    { id: "4", title: "Tesla Model 3", currentBid: "$35,000", timeLeft: "12h 20m", category: "Cars" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Auction hero background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-hero" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 text-center text-white animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Discover Unique Treasures
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Bid on exceptional items from sellers worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-semibold" asChild>
                <Link to="/auction">Start Bidding</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <Link to="/auction">Sell Your Items</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Browse Categories
              </h2>
              <p className="text-muted-foreground text-lg">
                Explore our diverse range of auction categories
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <Card 
                  key={category.name} 
                  className="group cursor-pointer hover:shadow-hover transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate("/auction")}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                    <category.icon className={`h-12 w-12 ${category.color} group-hover:scale-110 transition-transform`} />
                    <span className="font-semibold text-foreground">{category.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Auctions */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Featured Auctions
              </h2>
              <p className="text-muted-foreground text-lg">
                Hot items ending soon - don't miss out!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredAuctions.map((auction, index) => (
                <Card 
                  key={auction.title} 
                  className="group cursor-pointer hover:shadow-hover transition-all duration-300 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/auction/${auction.id}`)}
                >
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 group-hover:scale-105 transition-transform duration-300" />
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="px-2 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                        {auction.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                      {auction.title}
                    </h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Bid</p>
                        <p className="font-bold text-xl text-accent">{auction.currentBid}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-destructive">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">{auction.timeLeft}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-gradient-primary hover:opacity-90" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/auction/${auction.id}`);
                      }}
                    >
                      Place Bid
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" size="lg" asChild>
                <Link to="/auction">
                  View All Auctions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-primary">
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Bidding?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of satisfied buyers and sellers on Auctify
            </p>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-semibold" asChild>
              <Link to="/signup">Create Free Account</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
