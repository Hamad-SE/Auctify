import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Send, ArrowLeft, Loader2, ShieldCheck, CreditCard, CheckCircle2 } from "lucide-react";

type Message = {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    profiles: { full_name: string | null; email: string | null };
};

const Chat = () => {
    const { auctionId } = useParams<{ auctionId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isReleasing, setIsReleasing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: user, isLoading: isLoadingUser } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) navigate("/login");
            return user;
        },
    });

    const { data: auction, isLoading: isLoadingAuction } = useQuery({
        queryKey: ["auction", auctionId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("auctions")
                .select("*, profiles:seller_id (full_name)")
                .eq("id", auctionId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!auctionId
    });

    // Check if user is either seller or winner
    const { data: winnerId, isLoading: isLoadingWinner } = useQuery({
        queryKey: ["winning-bid", auctionId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("bids")
                .select("bidder_id")
                .eq("auction_id", auctionId)
                .order("amount", { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 0 rows returned
            return data?.bidder_id || null;
        },
        enabled: !!auctionId
    });

    const { data: payment, isLoading: isLoadingPayment } = useQuery({
        queryKey: ["payment", auctionId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("payments")
                .select("*")
                .eq("auction_id", auctionId)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!auctionId
    });

    const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
        queryKey: ["messages", auctionId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("messages")
                .select(`
                    id, sender_id, content, created_at,
                    profiles:sender_id (full_name, email)
                `)
                .eq("auction_id", auctionId)
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data as unknown as Message[];
        },
        enabled: !!auctionId
    });

    useEffect(() => {
        if (!auctionId) return;

        const channel = supabase
            .channel(`chat-${auctionId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `auction_id=eq.${auctionId}`,
                },
                (payload) => {
                    queryClient.invalidateQueries({ queryKey: ["messages", auctionId] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [auctionId, queryClient]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !auction) return;

        if (!winnerId) {
            toast({
                title: "Cannot send message",
                description: "There is no winning bidder for this auction yet.",
                variant: "destructive"
            });
            return;
        }

        const receiverId = user.id === auction.seller_id ? winnerId : auction.seller_id;

        setIsSending(true);
        try {
            const { error } = await supabase
                .from("messages")
                .insert({
                    auction_id: auctionId,
                    sender_id: user.id,
                    receiver_id: receiverId,
                    content: newMessage.trim(),
                });

            if (error) throw error;
            setNewMessage("");

            // Invalidate the query to fetch the newest messages instantly
            queryClient.invalidateQueries({ queryKey: ["messages", auctionId] });
        } catch (error: any) {
            console.error("Failed to send message:", error);
            toast({
                title: "Failed to send message",
                description: error.message || "An unknown error occurred.",
                variant: "destructive"
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleReleaseFunds = async () => {
        setIsReleasing(true);
        try {
            const { error } = await supabase
                .from("payments")
                .update({ status: 'released' })
                .eq("auction_id", auctionId)
                .eq("buyer_id", user?.id);

            if (error) throw error;

            toast({
                title: "Funds Released",
                description: "You have successfully confirmed receipt. The seller will now receive their payment.",
            });

            queryClient.invalidateQueries({ queryKey: ["payment", auctionId] });
        } catch (error: any) {
            console.error("Failed to release funds:", error);
            toast({
                title: "Error",
                description: "Failed to release funds. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsReleasing(false);
        }
    };

    if (isLoadingUser || isLoadingAuction || isLoadingWinner || isLoadingPayment) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <main className="flex-1 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </main>
            </div>
        );
    }

    if (!auction) {
        return <div className="text-center py-20">Auction Not Found</div>;
    }

    const isAuthorized = user && (user.id === auction.seller_id || user.id === winnerId);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <main className="flex-1 flex justify-center items-center">
                    <p className="text-xl">You are not authorized to view this chat. Only the seller and the winning bidder have access.</p>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 py-8 container mx-auto px-4 max-w-4xl">
                <Button variant="ghost" className="mb-4" onClick={() => navigate("/dashboard")}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </Button>

                <div className="bg-card border border-border rounded-xl shadow-elegant overflow-hidden flex flex-col h-[70vh]">
                    {/* Header */}
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-4">
                        <img src={auction.image_url} alt={auction.title} className="w-12 h-12 rounded object-cover" />
                        <div>
                            <h2 className="font-semibold text-lg line-clamp-1">{auction.title}</h2>
                            <p className="text-sm text-muted-foreground flex gap-2">
                                <span>Winner Chat</span>
                                <span>&bull;</span>
                                <span className="font-semibold text-accent">${auction.current_price?.toLocaleString()}</span>
                            </p>
                        </div>
                    </div>

                    {/* Payment Escrow Banner */}
                    <div className="border-b border-border p-0">
                        {!payment ? (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                                    <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                                    <span>Payment is pending. No funds have been secured yet.</span>
                                </div>
                                {user?.id === winnerId && (
                                    <Button size="sm" onClick={() => navigate(`/payment/${auctionId}`)} className="w-full sm:w-auto">
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Pay Now
                                    </Button>
                                )}
                            </div>
                        ) : payment.status === 'escrow' ? (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                    <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                                    <span>
                                        {user?.id === winnerId
                                            ? "Your payment is held in escrow. Mark as received once you get the item."
                                            : "Payment held in escrow. Ship the item so the buyer can release the funds."}
                                    </span>
                                </div>
                                {user?.id === winnerId && (
                                    <Button
                                        size="sm"
                                        onClick={handleReleaseFunds}
                                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                                        disabled={isReleasing}
                                    >
                                        {isReleasing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                        Mark Item Received
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:px-4 flex items-center justify-center gap-2 text-sm text-green-800 dark:text-green-300">
                                <CheckCircle2 className="h-5 w-5" />
                                <span>Payment completed. Funds have been released to the seller.</span>
                            </div>
                        )}
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
                        {isLoadingMessages ? (
                            <div className="flex-1 flex justify-center items-center">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex-1 flex justify-center items-center text-muted-foreground">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.sender_id === user.id;
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <span className="text-xs text-muted-foreground mb-1 px-1">
                                            {isMe ? 'You' : msg.profiles?.full_name || 'User'} - {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${isMe ? 'bg-accent text-accent-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-border bg-background">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Input
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={isSending || !newMessage.trim()} className="bg-gradient-accent">
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Chat;
