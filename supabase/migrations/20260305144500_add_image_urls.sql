-- Add image_urls array column to auctions table to support multiple images
ALTER TABLE public.auctions ADD COLUMN image_urls text[] DEFAULT '{}';
