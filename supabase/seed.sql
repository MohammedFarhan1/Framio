-- ============================================================
-- FRAMIO — Seed Data (Sample Products)
-- Run AFTER schema.sql
-- ============================================================

INSERT INTO public.products
  (name, slug, description, base_price, category, subcategory, sizes, materials, layout_options,
   images, min_photos, max_photos, in_stock, featured, rating, review_count, occasion, tags)
VALUES

-- 1. Classic Single Photo Frame
(
  'Classic Single Photo Frame',
  'classic-single-photo-frame',
  'A timeless frame crafted with premium wood finish — perfect for your most cherished memory. Comes ready to hang or stand on a desk.',
  599.00, 'frames', 'single',
  '[{"value":"6x8","label":"6×8 inch","priceAdd":0},{"value":"8x10","label":"8×10 inch","priceAdd":200},{"value":"12x16","label":"12×16 inch","priceAdd":500}]',
  '[{"value":"wood-walnut","label":"Walnut Wood","priceAdd":0,"color":"#5C3D1E"},{"value":"wood-white","label":"White Wood","priceAdd":0,"color":"#F5F0EB"},{"value":"wood-oak","label":"Oak Wood","priceAdd":100,"color":"#C8A96E"},{"value":"metal-black","label":"Metal Black","priceAdd":150,"color":"#1C1C1E"},{"value":"metal-gold","label":"Metal Gold","priceAdd":200,"color":"#B8860B"}]',
  '[]',
  ARRAY['https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&q=80','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
  1, 1, true, true, 4.8, 124,
  ARRAY['birthday','anniversary','housewarming','gifting'],
  ARRAY['single','wood','classic','photo-frame']
),

-- 2. Romantic Couple Frame
(
  'Romantic Couple Name Frame',
  'romantic-couple-name-frame',
  'A heartfelt gift for couples — display your favourite photo with custom names and a special date. Beautiful wood frame with elegant typography.',
  799.00, 'frames', 'couple',
  '[{"value":"6x8","label":"6×8 inch","priceAdd":0},{"value":"8x10","label":"8×10 inch","priceAdd":200},{"value":"12x16","label":"12×16 inch","priceAdd":500}]',
  '[{"value":"wood-walnut","label":"Walnut Wood","priceAdd":0,"color":"#5C3D1E"},{"value":"wood-white","label":"White Wood","priceAdd":0,"color":"#F5F0EB"},{"value":"wood-oak","label":"Oak Wood","priceAdd":100,"color":"#C8A96E"},{"value":"metal-gold","label":"Metal Gold","priceAdd":200,"color":"#B8860B"}]',
  '[]',
  ARRAY['https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80','https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=600&q=80'],
  1, 1, true, true, 4.9, 89,
  ARRAY['anniversary','valentines','wedding','gifting'],
  ARRAY['couple','romantic','name-frame','custom-text']
),

-- 3. 3-Photo Collage Frame
(
  '3-Photo Collage Frame',
  'three-photo-collage-frame',
  'Tell a story across three photos. Perfect for capturing moments from a trip, a year in review, or a friendship that spans time.',
  899.00, 'frames', 'collage',
  '[{"value":"8x10","label":"8×10 inch","priceAdd":0},{"value":"12x16","label":"12×16 inch","priceAdd":300}]',
  '[{"value":"wood-walnut","label":"Walnut Wood","priceAdd":0,"color":"#5C3D1E"},{"value":"wood-white","label":"White Wood","priceAdd":0,"color":"#F5F0EB"},{"value":"metal-black","label":"Metal Black","priceAdd":150,"color":"#1C1C1E"}]',
  '[{"value":"horizontal","label":"3 Horizontal"},{"value":"vertical","label":"3 Vertical"},{"value":"mixed","label":"1 Large + 2 Small"}]',
  ARRAY['https://images.unsplash.com/photo-1476234251651-f353703a034d?w=600&q=80','https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80'],
  3, 3, true, true, 4.7, 56,
  ARRAY['birthday','friendship','housewarming','gifting'],
  ARRAY['collage','3-photo','multiple-photos']
),

-- 4. 5-Photo Collage Frame
(
  '5-Photo Collage Frame',
  'five-photo-collage-frame',
  'Five memories, one frame. A stunning display for family portraits, travel photos, or a year worth of laughter.',
  1099.00, 'frames', 'collage',
  '[{"value":"12x16","label":"12×16 inch","priceAdd":0}]',
  '[{"value":"wood-walnut","label":"Walnut Wood","priceAdd":0,"color":"#5C3D1E"},{"value":"wood-white","label":"White Wood","priceAdd":0,"color":"#F5F0EB"},{"value":"wood-oak","label":"Oak Wood","priceAdd":100,"color":"#C8A96E"}]',
  '[{"value":"grid","label":"5 Grid"},{"value":"mosaic","label":"Mosaic"}]',
  ARRAY['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80','https://images.unsplash.com/photo-1525498128493-380d1990a112?w=600&q=80'],
  5, 5, true, false, 4.6, 34,
  ARRAY['birthday','anniversary','family','gifting'],
  ARRAY['collage','5-photo','family']
),

-- 5. LED Glow Photo Frame
(
  'LED Glow Photo Frame',
  'led-glow-photo-frame',
  'Your photo glows! RGB LED backlit frame that creates a magical halo effect. Comes with USB power and multiple glow modes.',
  1299.00, 'frames', 'led',
  '[{"value":"6x8","label":"6×8 inch","priceAdd":0},{"value":"8x10","label":"8×10 inch","priceAdd":300}]',
  '[{"value":"acrylic","label":"Acrylic Premium","priceAdd":0,"color":"#E8F4F8"},{"value":"metal-black","label":"Metal Black","priceAdd":200,"color":"#1C1C1E"}]',
  '[]',
  ARRAY['https://images.unsplash.com/photo-1501127122-f385ca6ddd9d?w=600&q=80','https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80'],
  1, 1, true, true, 4.9, 211,
  ARRAY['birthday','anniversary','gifting'],
  ARRAY['led','glow','premium','unique']
),

-- 6. Family Name Frame (9-Photo)
(
  '9-Photo Family Collage Frame',
  'nine-photo-family-collage-frame',
  'A grand showcase for your family''s story — nine photos arranged beautifully in a premium frame. Perfect housewarming or anniversary gift.',
  1499.00, 'frames', 'collage',
  '[{"value":"12x16","label":"12×16 inch","priceAdd":0}]',
  '[{"value":"wood-walnut","label":"Walnut Wood","priceAdd":0,"color":"#5C3D1E"},{"value":"wood-oak","label":"Oak Wood","priceAdd":100,"color":"#C8A96E"},{"value":"metal-gold","label":"Metal Gold","priceAdd":300,"color":"#B8860B"}]',
  '[{"value":"3x3","label":"3×3 Grid"},{"value":"mixed-large","label":"1 Large + 8 Small"}]',
  ARRAY['https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80','https://images.unsplash.com/photo-1511895426328-dc8714191011?w=600&q=80'],
  9, 9, true, false, 4.7, 28,
  ARRAY['housewarming','anniversary','family'],
  ARRAY['collage','9-photo','family','large']
),

-- 7. Desk / Table Frame
(
  'Elegant Desk Photo Frame',
  'elegant-desk-photo-frame',
  'A sleek, minimalist frame designed to sit proudly on any desk or shelf. Lightweight, premium-feel, and utterly giftable.',
  449.00, 'frames', 'desk',
  '[{"value":"6x8","label":"6×8 inch","priceAdd":0},{"value":"8x10","label":"8×10 inch","priceAdd":150}]',
  '[{"value":"metal-silver","label":"Metal Silver","priceAdd":0,"color":"#C0C0C0"},{"value":"metal-gold","label":"Metal Gold","priceAdd":100,"color":"#B8860B"},{"value":"metal-black","label":"Metal Black","priceAdd":0,"color":"#1C1C1E"},{"value":"acrylic","label":"Acrylic Clear","priceAdd":50,"color":"#E8F4F8"}]',
  '[]',
  ARRAY['https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80'],
  1, 1, true, false, 4.5, 67,
  ARRAY['birthday','corporate','gifting'],
  ARRAY['desk','table','minimal','office']
),

-- 8. Wall Frame Set (Set of 3)
(
  'Wall Frame Set — Set of 3',
  'wall-frame-set-3',
  'Three frames, one story on your wall. Curated sizes that look stunning together. Hang as a trio and transform any blank wall.',
  1799.00, 'frames', 'wall-set',
  '[{"value":"set-s","label":"Small Set (4×6, 5×7, 6×8)","priceAdd":0},{"value":"set-l","label":"Large Set (6×8, 8×10, 12×16)","priceAdd":500}]',
  '[{"value":"wood-walnut","label":"Walnut Wood","priceAdd":0,"color":"#5C3D1E"},{"value":"wood-white","label":"White Wood","priceAdd":0,"color":"#F5F0EB"},{"value":"metal-black","label":"Metal Black","priceAdd":200,"color":"#1C1C1E"}]',
  '[]',
  ARRAY['https://images.unsplash.com/photo-1565791380713-1756b9a05343?w=600&q=80','https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80'],
  3, 3, true, true, 4.8, 45,
  ARRAY['housewarming','anniversary','wedding'],
  ARRAY['wall','set','multiple','home-decor']
);

-- ============================================================
-- SAMPLE REVIEWS (for initial social proof)
-- ============================================================
INSERT INTO public.reviews (product_id, user_name, rating, comment, verified_purchase, created_at)
SELECT
  p.id,
  r.user_name,
  r.rating,
  r.comment,
  true,
  NOW() - (RANDOM() * INTERVAL '60 days')
FROM public.products p
CROSS JOIN (VALUES
  ('Priya S.',      5, 'Absolutely stunning! The photo quality is amazing and the frame feels very premium. Ordered for my parents'' anniversary and they loved it!'),
  ('Rahul M.',      5, 'Super fast delivery and the customization was so easy. The preview matched exactly what arrived. Will order again!'),
  ('Ananya K.',     4, 'Beautiful frame and great quality. The walnut finish looks even better in person. Slightly delayed shipping but worth the wait.'),
  ('Deepak R.',     5, 'Gifted this for my wife''s birthday. She was in tears! The photo was printed perfectly and the text was elegant. Highly recommend.'),
  ('Sneha P.',      5, 'Ordered 3 of these as corporate gifts. Every single one was perfect. Framio is now my go-to for personalized gifts.')
) AS r(user_name, rating, comment);
