CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Necesario para uuid_generate_v4()

CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rut VARCHAR(12) UNIQUE NOT NULL, -- RUT chileno formato: 12.345.678-9
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por RUT
CREATE INDEX IF NOT EXISTS idx_patients_rut ON patients (rut);

-- Índice para búsquedas por nombre
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients (name);
