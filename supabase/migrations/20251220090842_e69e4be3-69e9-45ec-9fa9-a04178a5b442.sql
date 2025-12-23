-- Create storage bucket for auction images
INSERT INTO storage.buckets (id, name, public)
VALUES ('auction-images', 'auction-images', true);

-- Allow anyone to view auction images
CREATE POLICY "Anyone can view auction images"
ON storage.objects FOR SELECT
USING (bucket_id = 'auction-images');

-- Allow authenticated users to upload auction images
CREATE POLICY "Authenticated users can upload auction images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'auction-images' AND auth.role() = 'authenticated');

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update their own auction images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'auction-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own auction images"
ON storage.objects FOR DELETE
USING (bucket_id = 'auction-images' AND auth.uid()::text = (storage.foldername(name))[1]);