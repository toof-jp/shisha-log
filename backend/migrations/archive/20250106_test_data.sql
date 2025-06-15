-- Test data for shisha log backend
-- Note: This uses hardcoded UUIDs for testing purposes

-- Insert test user profiles
-- Note: These profiles reference auth.users that would need to be created separately
INSERT INTO public.profiles (id, display_name, created_at, updated_at) VALUES 
('123e4567-e89b-12d3-a456-426614174000', 'テストユーザー1', '2024-01-01 10:00:00+00', '2024-01-01 10:00:00+00'),
('123e4567-e89b-12d3-a456-426614174001', 'テストユーザー2', '2024-01-02 11:00:00+00', '2024-01-02 11:00:00+00'),
('123e4567-e89b-12d3-a456-426614174002', 'シーシャ愛好家', '2024-01-03 12:00:00+00', '2024-01-03 12:00:00+00')
ON CONFLICT (id) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    updated_at = EXCLUDED.updated_at;

-- Insert test shisha sessions
INSERT INTO public.shisha_sessions (id, user_id, created_by, session_date, store_name, notes, order_details, mix_name, created_at, updated_at) VALUES 
('456e7890-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', '2024-01-15 18:00:00+00', '渋谷シーシャカフェ', '初回訪問。雰囲気が良く、スタッフも親切だった。', 'ミックスフレーバー、アイスティー', 'フルーツミックス', '2024-01-15 18:30:00+00', '2024-01-15 18:30:00+00'),
('456e7890-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174001', '2024-01-16 19:30:00+00', '新宿シーシャラウンジ', '友達と一緒に。煙が濃厚で満足度高い。', 'ダブルアップル、コーラ', 'クラシックアップル', '2024-01-16 20:00:00+00', '2024-01-16 20:00:00+00'),
('456e7890-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174002', '2024-01-17 20:00:00+00', '池袋シーシャバー', 'ミントが効いていて爽やか。長時間楽しめた。', 'ミントチョコレート、レモネード', 'チョコミント', '2024-01-17 20:30:00+00', '2024-01-17 20:30:00+00'),
('456e7890-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174000', '2024-01-20 17:00:00+00', '渋谷シーシャカフェ', '2回目の訪問。前回と同じ店だが違うフレーバーを試した。', 'ブルーベリーミント、アイスコーヒー', 'ベリーミント', '2024-01-20 17:30:00+00', '2024-01-20 17:30:00+00'),
('456e7890-e89b-12d3-a456-426614174004', '123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174001', '2024-01-22 21:00:00+00', '原宿シーシャクラブ', '新しい店を開拓。音楽が良く、リラックスできた。', 'ローズ、ハーブティー', 'ローズガーデン', '2024-01-22 21:30:00+00', '2024-01-22 21:30:00+00')
ON CONFLICT (id) DO UPDATE SET 
    session_date = EXCLUDED.session_date,
    store_name = EXCLUDED.store_name,
    notes = EXCLUDED.notes,
    order_details = EXCLUDED.order_details,
    mix_name = EXCLUDED.mix_name,
    updated_at = EXCLUDED.updated_at;

-- Insert test session flavors
INSERT INTO public.session_flavors (id, session_id, flavor_name, brand, created_at) VALUES 
-- Session 1 flavors
('789e0123-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174000', 'ダブルアップル', 'Al Fakher', '2024-01-15 18:30:00+00'),
('789e0123-e89b-12d3-a456-426614174001', '456e7890-e89b-12d3-a456-426614174000', 'オレンジ', 'Al Fakher', '2024-01-15 18:30:00+00'),
('789e0123-e89b-12d3-a456-426614174002', '456e7890-e89b-12d3-a456-426614174000', 'ミント', 'Starbuzz', '2024-01-15 18:30:00+00'),

-- Session 2 flavors
('789e0123-e89b-12d3-a456-426614174003', '456e7890-e89b-12d3-a456-426614174001', 'ダブルアップル', 'Nakhla', '2024-01-16 20:00:00+00'),

-- Session 3 flavors
('789e0123-e89b-12d3-a456-426614174004', '456e7890-e89b-12d3-a456-426614174002', 'チョコレート', 'Fumari', '2024-01-17 20:30:00+00'),
('789e0123-e89b-12d3-a456-426614174005', '456e7890-e89b-12d3-a456-426614174002', 'ペパーミント', 'Social Smoke', '2024-01-17 20:30:00+00'),

-- Session 4 flavors
('789e0123-e89b-12d3-a456-426614174006', '456e7890-e89b-12d3-a456-426614174003', 'ブルーベリー', 'Starbuzz', '2024-01-20 17:30:00+00'),
('789e0123-e89b-12d3-a456-426614174007', '456e7890-e89b-12d3-a456-426614174003', 'スペアミント', 'Al Fakher', '2024-01-20 17:30:00+00'),

-- Session 5 flavors
('789e0123-e89b-12d3-a456-426614174008', '456e7890-e89b-12d3-a456-426614174004', 'ローズ', 'Adalya', '2024-01-22 21:30:00+00')
ON CONFLICT (id) DO UPDATE SET 
    flavor_name = EXCLUDED.flavor_name,
    brand = EXCLUDED.brand,
    created_at = EXCLUDED.created_at;