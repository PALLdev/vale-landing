CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Necesario para uuid_generate_v4()

CREATE TABLE IF NOT EXISTS medical_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_notes TEXT NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas por paciente
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records (patient_id);

-- Índice para búsquedas por fecha de sesión
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON medical_records (session_date);

-- Índice compuesto para búsquedas por paciente y fecha
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_date ON medical_records (patient_id, session_date DESC);
