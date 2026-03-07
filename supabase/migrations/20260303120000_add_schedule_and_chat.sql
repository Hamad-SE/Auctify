-- Add start_date to auctions
ALTER TABLE public.auctions ADD COLUMN start_date timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now());

-- Update rpc function to include start_date logic
CREATE OR REPLACE FUNCTION place_bid(p_auction_id uuid, p_amount numeric)
RETURNS void AS $$
DECLARE
    v_auction public.auctions%ROWTYPE;
BEGIN
    SELECT * INTO v_auction FROM public.auctions WHERE id = p_auction_id;
    
    IF v_auction.id IS NULL THEN
        RAISE EXCEPTION 'Auction not found';
    END IF;

    IF v_auction.seller_id = auth.uid() THEN
        RAISE EXCEPTION 'Sellers cannot bid on their own auctions';
    END IF;

    IF now() < v_auction.start_date THEN
        RAISE EXCEPTION 'Auction has not started yet';
    END IF;

    IF now() > v_auction.end_date THEN
        RAISE EXCEPTION 'Auction has already ended';
    END IF;

    IF p_amount <= v_auction.current_price THEN
        RAISE EXCEPTION 'Bid amount must be greater than current price';
    END IF;

    -- Update auction current price
    UPDATE public.auctions 
    SET current_price = p_amount, bid_count = bid_count + 1
    WHERE id = p_auction_id;

    -- Insert bid
    INSERT INTO public.bids (auction_id, bidder_id, amount)
    VALUES (p_auction_id, auth.uid(), p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create messages table
CREATE TABLE public.messages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    auction_id uuid NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.messages ADD CONSTRAINT messages_pkey PRIMARY KEY (id);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert messages to their chats" ON public.messages
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can read their own chats" ON public.messages
    FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

