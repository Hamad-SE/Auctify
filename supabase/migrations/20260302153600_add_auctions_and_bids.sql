-- Create auctions table
create table public.auctions (
  id uuid not null default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  category text not null,
  starting_price numeric not null,
  current_price numeric not null,
  end_date timestamp with time zone not null,
  image_url text not null,
  condition text,
  location text,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  bid_count integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Create bids table
create table public.bids (
  id uuid not null default gen_random_uuid() primary key,
  auction_id uuid not null references public.auctions(id) on delete cascade,
  bidder_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric not null,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.auctions enable row level security;
alter table public.bids enable row level security;

-- Auctions Policies
create policy "Auctions are viewable by everyone"
  on public.auctions for select
  using (true);

create policy "Authenticated users can insert auctions"
  on public.auctions for insert
  to authenticated
  with check (auth.uid() = seller_id);

create policy "Users can update their own auctions"
  on public.auctions for update
  to authenticated
  using (auth.uid() = seller_id);

-- Bids Policies
create policy "Bids are viewable by everyone"
  on public.bids for select
  using (true);

create policy "Authenticated users can place bids"
  on public.bids for insert
  to authenticated
  with check (auth.uid() = bidder_id);

-- Create a secure function to place a bid
create or replace function public.place_bid(p_auction_id uuid, p_amount numeric)
returns void
language plpgsql
security definer
as $$
declare
  v_auction record;
begin
  -- Check if user is authenticated
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Lock the auction row for update to prevent concurrent race conditions
  select * into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction not found';
  end if;

  -- Verify auction hasn't ended
  if v_auction.end_date < now() then
    raise exception 'Auction has ended';
  end if;

  -- Verify bid amount is strictly greater than current price
  -- The UI enforces $+100 minimum, but at DB level we just enforce strictly greater for safety
  if p_amount <= v_auction.current_price then
    raise exception 'Bid amount must be greater than current price';
  end if;

  -- Insert the bid
  insert into public.bids (auction_id, bidder_id, amount)
  values (p_auction_id, auth.uid(), p_amount);

  -- Update the auction
  update public.auctions
  set 
    current_price = p_amount,
    bid_count = bid_count + 1,
    updated_at = now()
  where id = p_auction_id;

end;
$$;

-- Enable real-time for auctions and bids
alter publication supabase_realtime add table public.auctions;
alter publication supabase_realtime add table public.bids;
