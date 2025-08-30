-- Migration: Add language support to database tables
-- Add language columns to jenis_paket table (English only, Indonesian uses existing nama_paket)
ALTER TABLE jenis_paket ADD COLUMN nama_paket_en VARCHAR(255);

-- Add language columns to makanan table (English only, Indonesian uses existing deskripsi)
ALTER TABLE makanan ADD COLUMN deskripsi_en TEXT;

-- Update existing data with English translations
UPDATE jenis_paket SET 
  nama_paket_en = CASE 
    WHEN nama_paket = 'Nasi Box' THEN 'Rice Box'
    WHEN nama_paket = 'Snack Box' THEN 'Snack Box'
    WHEN nama_paket = 'Minuman' THEN 'Beverages'
    ELSE nama_paket
  END;

UPDATE makanan SET 
  deskripsi_en = CASE 
    WHEN nama_makanan = 'Nasi Gudeg' THEN 'Traditional Yogyakarta gudeg rice with chicken and egg'
    WHEN nama_makanan = 'Nasi Rendang' THEN 'Rice with tender beef rendang and spicy seasoning'
    WHEN nama_makanan = 'Risoles Mayo' THEN 'Vegetable risoles with fresh mayonnaise'
    WHEN nama_makanan = 'Es Teh Manis' THEN 'Refreshing sweet iced tea'
    ELSE deskripsi
  END;
