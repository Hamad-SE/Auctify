import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, ShieldCheck, Loader2 } from "lucide-react";

const Payment = () => {
    const { auctionId } = useParams<{ auctionId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isProcessing, setIsProcessing] = useState(false);

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
            if (!auctionId) return null;
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

    const { data: winnerId, isLoading: isLoadingWinner } = useQuery({
        queryKey: ["winning-bid", auctionId],
        queryFn: async () => {
            if (!auctionId) return null;
            const { data, error } = await supabase
                .from("bids")
                .select("bidder_id")
                .eq("auction_id", auctionId)
                .order("amount", { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data?.bidder_id || null;
        },
        enabled: !!auctionId
    });

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !auction || !auctionId) return;

        setIsProcessing(true);

        try {
            // Simulate payment processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const { error: paymentError } = await supabase
                .from("payments")
                .insert({
                    auction_id: auctionId,
                    buyer_id: user.id,
                    seller_id: auction.seller_id,
                    amount: auction.current_price,
                    status: 'escrow'
                });

            if (paymentError) throw paymentError;

            toast({
                title: "Payment Successful",
                description: "Your funds are securely held in escrow until you receive the product.",
            });

            // Invalidate chats and payments to re-fetch status on the Chat page
            queryClient.invalidateQueries({ queryKey: ["payments", auctionId] });

            navigate(`/chat/${auctionId}`);
        } catch (error: any) {
            console.error("Payment error:", error);
            toast({
                title: "Payment Failed",
                description: "There was an error processing your payment.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoadingUser || isLoadingAuction || isLoadingWinner) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <main className="flex-1 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </main>
            </div>
        );
    }

    if (!auction || user?.id !== winnerId) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <main className="flex-1 flex flex-col justify-center items-center text-center p-4">
                    <h2 className="text-2xl font-bold mb-2">Unauthorized</h2>
                    <p className="text-muted-foreground mb-4">You are not authorized to make a payment for this auction.</p>
                    <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 py-12 container mx-auto px-4 max-w-3xl">
                <Button variant="ghost" className="mb-6" onClick={() => navigate(`/chat/${auctionId}`)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Chat
                </Button>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">Secure Checkout</h1>
                    <p className="text-muted-foreground">Your funds will be held securely in escrow until you verify receipt.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <Card className="md:col-span-1 shadow-elegant h-fit">
                        <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                            <CardTitle className="text-lg">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="aspect-square rounded-md overflow-hidden bg-muted mb-4 border border-border">
                                <img src={auction.image_url} alt={auction.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-semibold line-clamp-1">{auction.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1">Sold by {auction.profiles?.full_name}</p>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center font-medium">
                                <span>Winning Bid</span>
                                <span>${auction.current_price?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <span>Platform Fee</span>
                                <span>$0.00</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>Total</span>
                                <span className="text-accent">${(auction.current_price || 0).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Form */}
                    <Card className="md:col-span-2 shadow-elegant">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-accent" />
                                Payment Details
                            </CardTitle>
                            <CardDescription>
                                This is a simulated checkout. Do not enter real credit card information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name on Card</Label>
                                    <Input id="name" placeholder="John Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="card">Card Number</Label>
                                    <Input id="card" placeholder="0000 0000 0000 0000" maxLength={19} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry">Expiry Date</Label>
                                        <Input id="expiry" placeholder="MM/YY" maxLength={5} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvv">CVV</Label>
                                        <Input id="cvv" placeholder="123" maxLength={4} required type="password" />
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900 flex items-start gap-3">
                                    <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5" />
                                    <div className="text-sm text-blue-800 dark:text-blue-300">
                                        <p className="font-semibold mb-1">Escrow Protection Active</p>
                                        <p>Your payment is held by Auctify. The seller will not receive these funds until you mark the item as received.</p>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-accent text-lg h-12"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Pay $${(auction.current_price || 0).toLocaleString()}`
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Payment;
