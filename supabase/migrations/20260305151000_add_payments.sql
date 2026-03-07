-- Create payments table for escrow functionality
CREATE TABLE public.payments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    auction_id uuid NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    buyer_id uuid NOT NULL REFERENCES public.profiles(id),
    seller_id uuid NOT NULL REFERENCES public.profiles(id),
    amount numeric NOT NULL,
    status text NOT NULL DEFAULT 'escrow' CHECK (status IN ('escrow', 'released')),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(auction_id)
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payment Policies
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can insert payments"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update payments to release funds"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id);

-- Enable realtime for payments
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
