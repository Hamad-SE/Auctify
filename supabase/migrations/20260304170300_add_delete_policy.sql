-- Add delete policy for auctions
create policy "Users can delete their own auctions"
  on public.auctions for delete
  to authenticated
  using (auth.uid() = seller_id);
