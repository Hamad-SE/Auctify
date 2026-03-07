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
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Gem, Car, Smartphone, Laptop, Watch, Home as HomeIcon, ArrowRight, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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

      // Limit to 8 instead of 4 so search is more effective
      query = query.limit(8);

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

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
              Auctify
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
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Featured Auctions
              </h2>
              <p className="text-muted-foreground text-lg">
                Hot items ending soon - don't miss out!
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="Search hot items by title or description..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name.toLowerCase()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="ending_soon">Ending Soonest</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-10 w-full">
                <p className="text-muted-foreground animate-pulse">Loading featured auctions...</p>
              </div>
            ) : featuredAuctions.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 rounded-lg">
                <p className="text-lg text-muted-foreground mb-4">No featured items match your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredAuctions.map((auction, index) => (
                  <Card
                    key={auction.id}
                    className="group cursor-pointer hover:shadow-hover transition-all duration-300 overflow-hidden animate-fade-in flex flex-col"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => navigate(`/auction/${auction.id}`)}
                  >
                    <div className="h-48 overflow-hidden relative">
                      {auction.image_url ? (
                        <img
                          src={auction.image_url}
                          alt={auction.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 group-hover:scale-105 transition-transform duration-300" />
                      )}
                    </div>
                    <CardContent className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="h-4 w-4 text-accent" />
                          <span className="text-sm text-muted-foreground capitalize">
                            {auction.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-accent transition-colors line-clamp-1 mb-2">
                          {auction.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {auction.description}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-muted-foreground">Current Bid</p>
                            <p className="font-bold text-xl text-accent">${auction.current_price?.toLocaleString() || "0"}</p>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                            <span className="text-xs font-medium text-muted-foreground">
                              {new Date(auction.end_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-gradient-accent"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/auction/${auction.id}`);
                          }}
                        >
                          View & Bid
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

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
