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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
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

const CreateAuction = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
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

    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/login");
                return null;
            }
            return user;
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
                setNewImages(prev => [...prev, ...validFiles]);
                const newPreviews = validFiles.map(file => URL.createObjectURL(file));
                setNewImagePreviews(prev => [...prev, ...newPreviews]);
            }
        }
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onSubmit = async (values: z.infer<typeof auctionSchema>) => {
        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to create an auction.",
                variant: "destructive",
            });
            navigate("/login");
            return;
        }

        setIsUploading(true);

        let finalImageUrls: string[] = [];

        try {
            // Upload new images
            if (newImages.length > 0) {
                for (const image of newImages) {
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

                    finalImageUrls.push(urlData.publicUrl);
                }
            }

            const primaryImageUrl = finalImageUrls.length > 0 ? finalImageUrls[0] : "";

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
                    start_date: startDateIso,
                    end_date: endDateIso,
                    image_url: primaryImageUrl,
                    image_urls: finalImageUrls,
                    seller_id: user.id,
                });

            if (insertError) throw insertError;

            queryClient.invalidateQueries({ queryKey: ["auctions"] });
            queryClient.invalidateQueries({ queryKey: ["my-listings", user.id] });

            toast({
                title: "Success!",
                description: "Your item has been listed successfully.",
            });

            navigate("/dashboard");
        } catch (error: any) {
            console.error("Creation error:", error);
            toast({
                title: "Error",
                description: error?.message || "Failed to create item. Please try again.",
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
        { value: "real estate", label: "Real Estate" },
        { value: "watches", label: "Watches" },
        { value: "other", label: "Other" },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4 text-primary">List an Item</h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Fill out the details below to start selling your item.
                        </p>
                    </div>

                    <Card className="max-w-2xl mx-auto shadow-elegant">
                        <CardHeader>
                            <CardTitle>Create Auction</CardTitle>
                            <CardDescription>Enter the details for your new auction listing</CardDescription>
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
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                                        <FormLabel>Product Images</FormLabel>
                                        <div className="border-2 border-dashed border-border rounded-lg p-4">
                                            {newImagePreviews.length > 0 && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                                    {newImagePreviews.map((preview, index) => (
                                                        <div key={`new-${index}`} className="relative group">
                                                            <img
                                                                src={preview}
                                                                alt={`New ${index + 1}`}
                                                                className="w-full h-32 object-cover rounded-lg"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => removeNewImage(index)}
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
                                                <p className="text-sm text-muted-foreground">Click to add images</p>
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

                                    <div className="flex gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => navigate("/dashboard")}
                                            disabled={isUploading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="w-full bg-gradient-accent" disabled={isUploading}>
                                            {isUploading ? "Creating..." : "Create Auction"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CreateAuction;
