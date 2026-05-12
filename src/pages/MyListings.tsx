import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Tag, Heart, Gavel, MessageSquare, Edit, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useToast } from "@/hooks/use-toast";

const MyListings = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

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

    const { data: myMessages = [], isLoading: isLoadingMessages } = useQuery({
        queryKey: ["my-messages", user?.id],
        queryFn: async () => {
            if (!user) return [];

            // Fetch messages where user is either sender or receiver
            const { data, error } = await supabase
                .from("messages")
                .select(`
                    id, auction_id, sender_id, receiver_id, content, created_at,
                    auctions!inner (id, title, image_url, end_date),
                    sender:profiles!sender_id (full_name),
                    receiver:profiles!receiver_id (full_name)
                `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Group by auction_id to thread them, keeping only the latest message for each
            const threads = new Map();
            data.forEach((msg: any) => {
                if (!threads.has(msg.auction_id)) {
                    threads.set(msg.auction_id, msg);
                }
            });

            return Array.from(threads.values());
        },
        enabled: !!user,
    });

    const { data: myListings = [], isLoading: isLoadingListings } = useQuery({
        queryKey: ["my-listings", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("auctions")
                .select("*")
                .eq("seller_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });

    const { data: myWatchlist = [], isLoading: isLoadingWatchlist } = useQuery({
        queryKey: ["my-watchlist", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("watchlists")
                .select("auction_id, auctions(*)")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data.map(item => item.auctions);
        },
        enabled: !!user,
    });

    const { data: myBids = [], isLoading: isLoadingBids } = useQuery({
        queryKey: ["my-bids", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("bids")
                .select(`
                    auction_id, 
                    amount, 
                    created_at, 
                    auctions (
                        *,
                        payments (status)
                    )
                `)
                .eq("bidder_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Group by auction to show unique items bid on
            const uniqueAuctions = new Map();
            data.forEach(bid => {
                if (!uniqueAuctions.has(bid.auction_id)) {
                    uniqueAuctions.set(bid.auction_id, bid);
                } else {
                    if (new Date(bid.created_at) > new Date(uniqueAuctions.get(bid.auction_id).created_at)) {
                        uniqueAuctions.set(bid.auction_id, bid);
                    }
                }
            });
            return Array.from(uniqueAuctions.values());
        },
        enabled: !!user,
    });

    if (!user && !isLoadingListings) return null; // Will redirect

    const handleDeleteAuction = async (auctionId: string) => {
        if (!confirm("Are you sure you want to delete this auction? This action cannot be undone.")) {
            return;
        }

        try {
            const { error } = await supabase.rpc('delete_auction', {
                p_auction_id: auctionId
            });

            if (error) {
                console.error("RPC Error Details:", error);
                throw new Error("Could not delete auction. You may not be the owner, or the database function is missing.");
            }

            queryClient.invalidateQueries({ queryKey: ["my-listings", user?.id] });
            toast({
                title: "Auction deleted",
                description: "Your auction has been successfully deleted.",
            });
        } catch (error: any) {
            console.error("Delete error:", error);
            toast({
                title: "Delete failed",
                description: error.message || "Could not delete auction.",
                variant: "destructive",
            });
        }
    };

    const renderAuctionCards = (items: any[], emptyMessage: string, isLoading: boolean, isMyListingsTab: boolean = false) => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-20">
                    <p className="text-muted-foreground animate-pulse">Loading...</p>
                </div>
            );
        }

        if (items.length === 0) {
            return (
                <div className="text-center py-20 bg-muted/30 rounded-lg">
                    <p className="text-lg text-muted-foreground mb-4">{emptyMessage}</p>
                    <Button onClick={() => navigate("/auction")} className="bg-gradient-accent">
                        Browse Auctions
                    </Button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => {
                    const auction = item.auctions || item; // Handle direct auction vs nested bid/watchlist
                    if (!auction) return null;

                    return (
                        <Card
                            key={auction.id + (item.amount ? item.amount : '')}
                            className="overflow-hidden hover:shadow-hover transition-shadow duration-300 cursor-pointer"
                            onClick={() => navigate(`/auction/${auction.id}`)}
                        >
                            <div className="aspect-video overflow-hidden relative">
                                <img
                                    src={auction.image_url}
                                    alt={auction.title}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                />
                                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">
                                    {auction.bid_count || 0} Bids
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{auction.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{auction.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Tag className="h-4 w-4 text-accent" />
                                    <span className="text-muted-foreground capitalize">{auction.category}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Current Price</p>
                                        <p className="text-xl font-bold text-accent">${auction.current_price?.toLocaleString() || "0"}</p>
                                    </div>
                                    {item.amount && (
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-primary">Your Last Bid</p>
                                            <p className="text-sm font-medium">${item.amount?.toLocaleString() || "0"}</p>
                                        </div>
                                    )}
                                    {!item.amount && (
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Starting</p>
                                            <p className="text-sm font-medium">${auction.starting_price?.toLocaleString() || "0"}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Ends: {new Date(auction.end_date).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                {isMyListingsTab ? (
                                    <div className="flex w-full gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/edit-auction/${auction.id}`);
                                            }}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="flex-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteAuction(auction.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/auction/${auction.id}`);
                                        }}
                                    >
                                        View Details
                                    </Button>
                                )}

                                {new Date() > new Date(auction.end_date) && !isMyListingsTab && (
                                    <div className="w-full flex flex-col gap-2">
                                        <Button
                                            variant="default"
                                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/chat/${auction.id}`);
                                            }}
                                        >
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            {auction.seller_id === user?.id ? "Chat with Winner" : "Chat with Seller"}
                                        </Button>

                                        {/* Status Badge for Winners */}
                                        {auction.payments?.[0] && (
                                            <div className={`text-xs text-center p-2 rounded-md ${auction.payments[0].status === 'escrow'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                }`}>
                                                {auction.payments[0].status === 'escrow' ? 'Payment in Escrow' : 'Payment Completed'}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {new Date() > new Date(auction.end_date) && isMyListingsTab && (
                                    <Button
                                        variant="default"
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/chat/${auction.id}`);
                                        }}
                                    >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Chat with Winner
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        );
    };

    const renderMessageCards = (items: any[], emptyMessage: string, isLoading: boolean) => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-20">
                    <p className="text-muted-foreground animate-pulse">Loading messages...</p>
                </div>
            );
        }

        if (items.length === 0) {
            return (
                <div className="text-center py-20 bg-muted/30 rounded-lg">
                    <p className="text-lg text-muted-foreground mb-4">{emptyMessage}</p>
                    <Button onClick={() => navigate("/auction")} className="bg-gradient-accent">
                        Browse Auctions
                    </Button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((thread) => {
                    const auction = thread.auctions;
                    if (!auction) return null;

                    const isSenderMe = thread.sender_id === user?.id;
                    const otherPartyName = isSenderMe
                        ? thread.receiver?.full_name || "User"
                        : thread.sender?.full_name || "User";

                    return (
                        <Card
                            key={thread.id}
                            className="overflow-hidden hover:shadow-hover transition-shadow duration-300 cursor-pointer flex flex-col"
                            onClick={() => navigate(`/chat/${auction.id}`)}
                        >
                            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-4">
                                <img
                                    src={auction.image_url}
                                    alt={auction.title}
                                    className="w-12 h-12 rounded object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm line-clamp-1">{auction.title}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                        Chat with {otherPartyName}
                                    </p>
                                </div>
                            </div>
                            <CardContent className="flex-1 p-4 flex flex-col justify-center">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {isSenderMe ? "You" : otherPartyName}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {new Date(thread.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm line-clamp-2 italic text-foreground/80">
                                        "{thread.content}"
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Button
                                    variant="default"
                                    className="w-full bg-gradient-accent text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/chat/${auction.id}`);
                                    }}
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Open Chat
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8 relative">
                        <h1 className="text-4xl font-bold mb-4 text-primary">User Dashboard</h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Manage your listings, track your bids, and view your watchlisted items all in one place.
                        </p>
                        <div className="mt-4 flex justify-center">
                            <Button className="bg-gradient-accent" onClick={() => navigate("/create-auction")}>
                                List an Item
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue="listings" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-8">
                            <TabsTrigger value="listings">My Listings</TabsTrigger>
                            <TabsTrigger value="bids">Active Bids</TabsTrigger>
                            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
                            <TabsTrigger value="messages">Messages</TabsTrigger>
                        </TabsList>

                        <TabsContent value="listings">
                            {renderAuctionCards(myListings, "You haven't listed any items yet.", isLoadingListings, true)}
                        </TabsContent>

                        <TabsContent value="bids">
                            {renderAuctionCards(myBids, "You haven't placed any bids yet.", isLoadingBids)}
                        </TabsContent>

                        <TabsContent value="watchlist">
                            {renderAuctionCards(myWatchlist, "Your watchlist is empty.", isLoadingWatchlist)}
                        </TabsContent>

                        <TabsContent value="messages">
                            {renderMessageCards(myMessages, "You have no active chats.", isLoadingMessages)}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MyListings;
