-- Create user_payment_methods table to store verified card info
CREATE TABLE public.user_payment_methods (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    card_last4 text NOT NULL,
    card_brand text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own payment methods" ON public.user_payment_methods
FOR ALL USING (auth.uid() = user_id);

-- Expose to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_payment_methods;
