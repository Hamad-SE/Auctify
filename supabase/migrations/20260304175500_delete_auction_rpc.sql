-- Create an RPC to safely bypass strict RLS while enforcing ownership
create or replace function public.delete_auction(p_auction_id uuid)
returns void
language plpgsql
security definer -- Elevates privileges
as $$
declare
  v_auction record;
begin
  -- Check if user is authenticated
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Lock the auction row inside a transaction to prevent race conditions
  select * into v_auction
  from public.auctions
  where id = p_auction_id
  for update;

  if not found then
    raise exception 'Auction not found';
  end if;

  -- Validate the current user is actually the seller
  if v_auction.seller_id != auth.uid() then
    raise exception 'Unauthorized to delete this auction';
  end if;

  -- Bids, watchlists, etc. will rely on ON DELETE CASCADE implicitly
  delete from public.auctions
  where id = p_auction_id;

end;
$$;
