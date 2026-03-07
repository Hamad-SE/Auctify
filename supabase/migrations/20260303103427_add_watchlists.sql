-- Add watchlists table

CREATE TABLE public.watchlists (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    auction_id uuid NOT NULL REFERENCES public.auctions(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.watchlists ADD CONSTRAINT watchlists_pkey PRIMARY KEY (id);
ALTER TABLE public.watchlists ADD CONSTRAINT watchlists_user_auction_unique UNIQUE (user_id, auction_id);

-- Enable RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watchlists" ON public.watchlists
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watchlists" ON public.watchlists
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlists" ON public.watchlists
    FOR DELETE TO authenticated USING (auth.uid() = user_id);
