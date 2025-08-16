CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Necesario para uuid_generate_v4()

CREATE TABLE IF NOT EXISTS medical_record_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por ficha médica
CREATE INDEX IF NOT EXISTS idx_attachments_medical_record ON medical_record_attachments (medical_record_id);

-- Índice para búsquedas por fecha de creación
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON medical_record_attachments (created_at DESC);

-- Índice compuesto para búsquedas por ficha médica y fecha
CREATE INDEX IF NOT EXISTS idx_attachments_record_date ON medical_record_attachments (medical_record_id, created_at DESC);
