import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CreditCard, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

const PaymentMethods = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isProcessing, setIsProcessing] = useState(false);

    // Form state
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [cardName, setCardName] = useState("");

    const { data: user, isLoading: isLoadingUser } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) navigate("/login");
            return user;
        },
    });

    const { data: paymentMethods = [], isLoading: isLoadingMethods } = useQuery({
        queryKey: ["payment-methods", user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from("user_payment_methods")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });

    const determineCardBrand = (number: string) => {
        if (number.startsWith("4")) return "Visa";
        if (number.startsWith("5")) return "Mastercard";
        if (number.startsWith("3")) return "Amex";
        return "Card";
    };

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const cleanNumber = cardNumber.replace(/\s/g, '');
        if (cleanNumber.length < 15) {
            toast({
                title: "Invalid Card",
                description: "Please enter a valid card number.",
                variant: "destructive"
            });
            return;
        }

        setIsProcessing(true);

        try {
            // Simulating API verification delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const last4 = cleanNumber.slice(-4);
            const brand = determineCardBrand(cleanNumber);

            const { error } = await supabase
                .from("user_payment_methods")
                .insert({
                    user_id: user.id,
                    card_last4: last4,
                    card_brand: brand
                });

            if (error) throw error;

            toast({
                title: "Payment Method Added",
                description: "Your account is now verified and secure.",
            });

            // Reset form and refetch
            setCardNumber("");
            setCardExpiry("");
            setCardCvv("");
            setCardName("");
            queryClient.invalidateQueries({ queryKey: ["payment-methods", user.id] });

        } catch (error: any) {
            console.error("Failed to add card:", error);
            toast({
                title: "Error",
                description: "Failed to verify payment method. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        // Add spaces every 4 digits
        const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        setCardExpiry(value);
    };

    if (isLoadingUser || isLoadingMethods) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <main className="flex-1 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </main>
            </div>
        );
    }

    const isVerified = paymentMethods.length > 0;

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 py-12 container mx-auto px-4 max-w-4xl">

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-primary mb-3">Identity & Payment Verification</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        To maintain a safe community and prevent fraud, we require users to add a payment method before bidding or listing items.
                        No charges are made during verification.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Setup Form */}
                    <Card className="shadow-elegant border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-accent" />
                                Add Payment Method
                            </CardTitle>
                            <CardDescription>
                                Securely link a credit or debit card. (Simulated)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddCard} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name on Card</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="card">Card Number</Label>
                                    <Input
                                        id="card"
                                        placeholder="0000 0000 0000 0000"
                                        value={cardNumber}
                                        onChange={handleCardNumberChange}
                                        maxLength={19}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry">Expiry Date</Label>
                                        <Input
                                            id="expiry"
                                            placeholder="MM/YY"
                                            value={cardExpiry}
                                            onChange={handleExpiryChange}
                                            maxLength={5}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvv">CVV</Label>
                                        <Input
                                            id="cvv"
                                            placeholder="123"
                                            value={cardCvv}
                                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                            maxLength={4}
                                            required
                                            type="password"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        "Verify Identity"
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Verified Status */}
                    <div className="space-y-6">
                        <Card className={`border-2 ${isVerified ? 'border-green-500/50 bg-green-50/10' : 'border-yellow-500/50 bg-yellow-50/10'} shadow-sm`}>
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    {isVerified ? (
                                        <ShieldCheck className="h-6 w-6 text-green-500" />
                                    ) : (
                                        <ShieldCheck className="h-6 w-6 text-yellow-500" />
                                    )}
                                    Account Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isVerified ? (
                                    <div className="text-green-700 dark:text-green-400">
                                        <p className="font-semibold text-lg flex items-center gap-2 mb-2">
                                            <CheckCircle2 className="h-5 w-5" />
                                            Verified Account
                                        </p>
                                        <p className="text-sm">You have successfully linked a payment method and are cleared to bid on and list items.</p>
                                    </div>
                                ) : (
                                    <div className="text-yellow-700 dark:text-yellow-400">
                                        <p className="font-semibold text-lg mb-2">Verification Required</p>
                                        <p className="text-sm">Please add a payment method to verify your identity. Unverified accounts have restricted access.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {isVerified && (
                            <div>
                                <h3 className="font-medium text-lg mb-4 pl-1">Saved Methods</h3>
                                <div className="space-y-3">
                                    {paymentMethods.map((method) => (
                                        <Card key={method.id} className="bg-card shadow-sm border-border">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-muted p-2 rounded-md">
                                                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm capitalize">{method.card_brand} ending in {method.card_last4}</p>
                                                        <p className="text-xs text-muted-foreground">Added on {new Date(method.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                                                    Verified
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PaymentMethods;
