CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Necesario para uuid_generate_v4()

CREATE TABLE IF NOT EXISTS availability_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  time_slot VARCHAR(5), -- NULL para bloquear todo el día, específico para bloquear solo una hora
  block_type VARCHAR(20) NOT NULL DEFAULT 'unavailable', -- 'unavailable', 'vacation', 'maintenance', etc.
  reason TEXT, -- Razón opcional del bloqueo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_availability_blocks_date ON availability_blocks (date);
CREATE INDEX IF NOT EXISTS idx_availability_blocks_date_time ON availability_blocks (date, time_slot);

-- Constraint para evitar duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_availability_block 
ON availability_blocks (date, COALESCE(time_slot, ''));
