import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Tag, ArrowLeft, User, Gavel, TrendingUp, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

// Mock data - in production this would come from a database
const auctionItems = [
  {
    id: "1",
    title: "Vintage Rolex Watch",
    description: "Classic timepiece in excellent condition with original box and papers. This stunning vintage Rolex represents the pinnacle of Swiss watchmaking craftsmanship. Features include a self-winding movement, scratch-resistant sapphire crystal, and water resistance up to 100 meters.",
    category: "jewelry",
    startingPrice: "$5,000",
    currentBid: "$6,500",
    endDate: "2025-12-15",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    seller: "LuxuryCollector",
    bidCount: 12,
    condition: "Excellent",
    location: "New York, USA",
  },
  {
    id: "2",
    title: "2020 Tesla Model 3",
    description: "Low mileage electric vehicle with autopilot features. This well-maintained Tesla Model 3 comes with premium interior, enhanced autopilot, full self-driving capability, and only 15,000 miles on the odometer. Clean title, no accidents.",
    category: "cars",
    startingPrice: "$35,000",
    currentBid: "$38,000",
    endDate: "2025-12-20",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
    seller: "AutoDealer",
    bidCount: 8,
    condition: "Like New",
    location: "Los Angeles, USA",
  },
  {
    id: "3",
    title: "iPhone 15 Pro Max",
    description: "Brand new, sealed in box with 1TB storage. This is the ultimate iPhone experience with titanium design, A17 Pro chip, Action button, and the most powerful iPhone camera system ever. Includes all original accessories and warranty.",
    category: "phones",
    startingPrice: "$1,200",
    currentBid: "$1,350",
    endDate: "2025-12-10",
    image: "https://images.unsplash.com/photo-1592286927505-2c7c9a5c2a74?w=800",
    seller: "TechTrader",
    bidCount: 24,
    condition: "New",
    location: "San Francisco, USA",
  },
];

const AuctionProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState("");

  const product = auctionItems.find((item) => item.id === id);

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

  const currentBidNumber = parseFloat(product.currentBid.replace(/[$,]/g, ""));
  const minimumBid = currentBidNumber + 100;

  const handlePlaceBid = () => {
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

    toast({
      title: "Bid Placed Successfully!",
      description: `Your bid of $${bidValue.toLocaleString()} has been placed.`,
    });
    setBidAmount("");
  };

  const timeLeft = () => {
    const end = new Date(product.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

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
              <div className="aspect-square overflow-hidden rounded-xl border border-border">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-3 capitalize">
                  {product.category}
                </Badge>
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
                      <p className="text-3xl font-bold text-accent">{product.currentBid}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Starting Price</p>
                      <p className="text-lg font-semibold">{product.startingPrice}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-accent" />
                      <span>{product.bidCount} bids</span>
                    </div>
                    <div className="flex items-center gap-2 text-destructive">
                      <Clock className="h-4 w-4" />
                      <span>{timeLeft()} left</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
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
                      <Button onClick={handlePlaceBid} className="bg-gradient-accent px-8">
                        Place Bid
                      </Button>
                    </div>
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
                      <p className="font-medium">{product.seller}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Condition</p>
                      <p className="font-medium">{product.condition}</p>
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
                      <p className="font-medium">{product.location}</p>
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
