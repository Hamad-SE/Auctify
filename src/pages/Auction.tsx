import { useState, useRef, useEffect } from "react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";

const auctionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  category: z.string().min(1, "Please select a category"),
  startingPrice: z.string().min(1, "Starting price is required"),
  startDate: z.string().min(1, "Start date and time is required"),
  endDate: z.string().min(1, "End date and time is required"),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
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
  const queryClient = useQueryClient();

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

  const { data: listedItems = [], isLoading } = useQuery({
    queryKey: ["auctions", searchQuery, categoryFilter, sortBy],
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

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof auctionSchema>>({
    resolver: zodResolver(auctionSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      startingPrice: "",
      startDate: "",
      endDate: "",
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is over 5MB`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setSelectedImages(prev => [...prev, ...validFiles]);
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: z.infer<typeof auctionSchema>) => {
    setIsUploading(true);
    let imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400";

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to list an item.",
          variant: "destructive",
        });
        return;
      }

      let uploadedUrls: string[] = [];

      // Upload images if selected
      if (selectedImages.length > 0) {
        for (const image of selectedImages) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('auction-images')
            .upload(fileName, image);

          if (uploadError) {
            throw uploadError;
          }

          const { data: urlData } = supabase.storage
            .from('auction-images')
            .getPublicUrl(fileName);

          uploadedUrls.push(urlData.publicUrl);
        }
        imageUrl = uploadedUrls[0];
      }

      // Ensure dates are properly formatted as ISO timestamps
      const startDateIso = new Date(values.startDate).toISOString();
      const endDateIso = new Date(values.endDate).toISOString();

      const { error: insertError } = await supabase
        .from('auctions')
        .insert({
          title: values.title,
          description: values.description,
          category: values.category,
          starting_price: parseFloat(values.startingPrice),
          current_price: parseFloat(values.startingPrice),
          end_date: endDateIso,
          image_url: imageUrl,
          image_urls: uploadedUrls,
          seller_id: user.id
        });

      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      form.reset();
      setSelectedImages([]);
      setImagePreviews([]);
      toast({
        title: "Success!",
        description: "Your item has been listed for auction.",
      });
    } catch (error: any) {
      console.error("Listing error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to list item. Please try again.",
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
          {/* Listed Items Section (Moved to Top) */}
          <section className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 text-primary">Active Auctions</h2>
              <p className="text-muted-foreground">Browse all items currently up for auction</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="Search items by title or description..."
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
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
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
              <div className="flex justify-center items-center py-20">
                <p className="text-muted-foreground animate-pulse">Loading auctions...</p>
              </div>
            ) : listedItems.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 rounded-lg">
                <p className="text-lg text-muted-foreground mb-4">No items match your search criteria.</p>
                <Button onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setSortBy("newest");
                }} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listedItems.map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden hover:shadow-hover transition-shadow duration-300 cursor-pointer"
                    onClick={() => navigate(`/auction/${item.id}`)}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.image_url}
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
                          <p className="text-xl font-bold text-accent">${item.current_price?.toLocaleString() || "0"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Starting</p>
                          <p className="text-sm font-medium">${item.starting_price?.toLocaleString() || "0"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Ends: {new Date(item.end_date).toLocaleDateString()}</span>
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
            )}
          </section>

          {/* List New Item Section (Moved to Bottom) */}
          <section>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Auction Start Time</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
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
                            <FormLabel>Auction End Time</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <FormLabel>Product Image</FormLabel>
                      <div className="border-2 border-dashed border-border rounded-lg p-4">
                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div
                          className="flex flex-col items-center justify-center h-32 cursor-pointer border-2 border-transparent hover:border-muted rounded-lg transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload images</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB (Multiple allowed)</p>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          accept="image/*"
                          multiple
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auction;
