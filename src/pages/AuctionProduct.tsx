import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Tag, ArrowLeft, User, Gavel, TrendingUp, Shield, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AuctionProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [bidAmount, setBidAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: isWatchlisted, refetch: refetchWatchlist } = useQuery({
    queryKey: ["watchlist", id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("watchlists")
        .select("*")
        .eq("auction_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!id,
  });

  const [isTogglingWatchlist, setIsTogglingWatchlist] = useState(false);

  const toggleWatchlist = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your watchlist.",
        variant: "destructive",
      });
      return;
    }

    setIsTogglingWatchlist(true);
    try {
      if (isWatchlisted) {
        const { error } = await supabase
          .from("watchlists")
          .delete()
          .eq("auction_id", id)
          .eq("user_id", user.id);
        if (error) throw error;
        toast({ title: "Removed from Watchlist" });
      } else {
        const { error } = await supabase
          .from("watchlists")
          .insert({ auction_id: id, user_id: user.id });
        if (error) throw error;
        toast({ title: "Added to Watchlist" });
      }
      refetchWatchlist();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTogglingWatchlist(false);
    }
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ["auction", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auctions")
        .select("*, profiles:seller_id (full_name)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`auction-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "auctions",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          queryClient.setQueryData(["auction", id], (oldData: Record<string, unknown> | undefined) => ({
            ...oldData,
            ...payload.new,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The auction item you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/auction")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Auctions
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentBidNumber = Number(product.current_price || 0);
  const minimumBid = currentBidNumber + 100;

  const handlePlaceBid = async () => {
    const bidValue = parseFloat(bidAmount);
    if (!bidAmount || isNaN(bidValue)) {
      toast({
        title: "Invalid Bid",
        description: "Please enter a valid bid amount.",
        variant: "destructive",
      });
      return;
    }

    if (bidValue < minimumBid) {
      toast({
        title: "Bid Too Low",
        description: `Minimum bid is $${minimumBid.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    setIsBidding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to place a bid.",
          variant: "destructive",
        });
        setIsBidding(false);
        return;
      }

      if (user.id === product.seller_id) {
        toast({
          title: "Invalid Bid",
          description: "You cannot bid on your own auction.",
          variant: "destructive",
        });
        setIsBidding(false);
        return;
      }

      const { error } = await supabase.rpc('place_bid', {
        p_auction_id: id,
        p_amount: bidValue,
      });

      if (error) throw error;

      toast({
        title: "Bid Placed Successfully!",
        description: `Your bid of $${bidValue.toLocaleString()} has been placed.`,
      });
      setBidAmount("");
    } catch (error: Error | unknown) {
      toast({
        title: "Bid Failed",
        description: error instanceof Error ? error.message : "Could not place bid. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsBidding(false);
    }
  };

  const timeLeft = () => {
    const end = new Date(product.end_date);
    const start = new Date(product.start_date);
    const now = new Date();

    if (now < start) {
      const diff = start.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (days > 0) return `Starts in ${days}d ${hours}h`;
      return `Starts in ${hours}h ${minutes}m`;
    } else if (now > end) {
      return "Ended";
    }

    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h ${minutes}m left`;
  };

  const isUpcoming = new Date() < new Date(product?.start_date);
  const isEnded = new Date() > new Date(product?.end_date);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/auction" className="hover:text-primary transition-colors">Auctions</Link>
            <span>/</span>
            <span className="text-foreground">{product.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted flex items-center justify-center">
                <img
                  src={
                    product.image_urls && product.image_urls.length > 0
                      ? product.image_urls[selectedImageIndex]
                      : product.image_url
                  }
                  alt={product.title}
                  className="w-full h-full object-cover sm:object-contain"
                />
              </div>

              {product.image_urls && product.image_urls.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {product.image_urls.map((url: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${selectedImageIndex === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-primary/50 opacity-70 hover:opacity-100"
                        }`}
                    >
                      <img
                        src={url}
                        alt={`${product.title} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="capitalize">
                    {product.category}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleWatchlist}
                    disabled={isTogglingWatchlist}
                    className={`rounded-full transition-colors ${isWatchlisted ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-muted-foreground"
                      }`}
                    title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                  >
                    <Heart className={`h-6 w-6 ${isWatchlisted ? "fill-current" : ""}`} />
                  </Button>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.title}</h1>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              <Separator />

              {/* Bidding Section */}
              <Card className="shadow-elegant border-accent/20">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Bid</p>
                      <p className="text-3xl font-bold text-accent">${product.current_price?.toLocaleString() || "0"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Starting Price</p>
                      <p className="text-lg font-semibold">${product.starting_price?.toLocaleString() || "0"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-accent" />
                      <span>{product.bid_count || 0} bids</span>
                    </div>
                    <div className="flex items-center gap-2 text-destructive">
                      <Clock className="h-4 w-4" />
                      <span>{timeLeft()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {isUpcoming ? (
                      <div className="p-4 bg-muted/50 rounded-lg text-center border border-border">
                        <p className="font-medium text-foreground">Auction hasn't started yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Check back when the countdown ends to place your bid.</p>
                      </div>
                    ) : isEnded ? (
                      <div className="p-4 bg-muted/50 rounded-lg text-center border border-border">
                        <p className="font-medium text-foreground">Auction has ended</p>
                        <p className="text-sm text-muted-foreground mt-1">This item is no longer available for bidding.</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Enter ${minimumBid.toLocaleString()} or more
                        </p>
                        <div className="flex gap-3">
                          <Input
                            type="number"
                            placeholder={`$${minimumBid.toLocaleString()}`}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="flex-1"
                          />
                          <Button onClick={handlePlaceBid} className="bg-gradient-accent px-8" disabled={isBidding}>
                            {isBidding ? "Placing..." : "Place Bid"}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <User className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Seller</p>
                      <p className="font-medium">{product.profiles?.full_name || "Anonymous User"}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Condition</p>
                      <p className="font-medium">{product.condition || "Not specified"}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Tag className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="font-medium capitalize">{product.category}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Shield className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{product.location || "Not specified"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Back Button */}
              <Button variant="outline" onClick={() => navigate("/auction")} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Auctions
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuctionProduct;
