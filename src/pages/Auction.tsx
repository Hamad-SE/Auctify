import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Clock, Tag, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const auctionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  category: z.string().min(1, "Please select a category"),
  startingPrice: z.string().min(1, "Starting price is required"),
  endDate: z.string().min(1, "End date is required"),
});

type AuctionItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  startingPrice: string;
  currentBid: string;
  endDate: string;
  image: string;
};

const Auction = () => {
  const navigate = useNavigate();
  const [listedItems, setListedItems] = useState<AuctionItem[]>([
    {
      id: "1",
      title: "Vintage Rolex Watch",
      description: "Classic timepiece in excellent condition with original box and papers.",
      category: "jewelry",
      startingPrice: "$5,000",
      currentBid: "$6,500",
      endDate: "2025-12-15",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    },
    {
      id: "2",
      title: "2020 Tesla Model 3",
      description: "Low mileage electric vehicle with autopilot features.",
      category: "cars",
      startingPrice: "$35,000",
      currentBid: "$38,000",
      endDate: "2025-12-20",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
    },
    {
      id: "3",
      title: "iPhone 15 Pro Max",
      description: "Brand new, sealed in box with 1TB storage.",
      category: "phones",
      startingPrice: "$1,200",
      currentBid: "$1,350",
      endDate: "2025-12-10",
      image: "https://images.unsplash.com/photo-1592286927505-2c7c9a5c2a74?w=400",
    },
  ]);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof auctionSchema>>({
    resolver: zodResolver(auctionSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      startingPrice: "",
      endDate: "",
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: z.infer<typeof auctionSchema>) => {
    setIsUploading(true);
    let imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";

    try {
      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('auction-images')
          .upload(fileName, selectedImage);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('auction-images')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      const newItem: AuctionItem = {
        id: Date.now().toString(),
        title: values.title,
        description: values.description,
        category: values.category,
        startingPrice: `$${values.startingPrice}`,
        currentBid: `$${values.startingPrice}`,
        endDate: values.endDate,
        image: imageUrl,
      };

      setListedItems([newItem, ...listedItems]);
      form.reset();
      removeImage();
      toast({
        title: "Success!",
        description: "Your item has been listed for auction.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const categories = [
    { value: "jewelry", label: "Jewelry" },
    { value: "cars", label: "Cars" },
    { value: "phones", label: "Phones" },
    { value: "electronics", label: "Electronics" },
    { value: "fashion", label: "Fashion" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* List New Item Section */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 text-primary">List Your Item</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Start selling your items to thousands of buyers. Create your auction listing in minutes.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto shadow-elegant">
              <CardHeader>
                <CardTitle>Create Auction Listing</CardTitle>
                <CardDescription>Fill in the details to list your item for auction</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Vintage Rolex Watch" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your item in detail..."
                              className="min-h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="startingPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Starting Price ($)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="1000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Auction End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <FormLabel>Product Image</FormLabel>
                      <div className="border-2 border-dashed border-border rounded-lg p-4">
                        {imagePreview ? (
                          <div className="relative">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={removeImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="flex flex-col items-center justify-center h-32 cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload image</p>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-accent" disabled={isUploading}>
                      {isUploading ? "Uploading..." : "List Item for Auction"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </section>

          {/* Listed Items Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 text-primary">Active Auctions</h2>
              <p className="text-muted-foreground">Browse all items currently up for auction</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listedItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="overflow-hidden hover:shadow-hover transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate(`/auction/${item.id}`)}
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-accent" />
                      <span className="text-muted-foreground capitalize">{item.category}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Bid</p>
                        <p className="text-xl font-bold text-accent">{item.currentBid}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Starting</p>
                        <p className="text-sm font-medium">{item.startingPrice}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Ends: {new Date(item.endDate).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-gradient-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/auction/${item.id}`);
                      }}
                    >
                      View & Bid
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auction;
