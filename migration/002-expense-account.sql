-- Which account an expense is deducted from: Combined | Samuel | Ruth
ALTER TABLE expenses ADD COLUMN account TEXT NOT NULL DEFAULT 'Combined';
