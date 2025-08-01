CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Necesario para uuid_generate_v4()

CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  time VARCHAR(5) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20) NOT NULL,
  consultation_type VARCHAR(20) NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pendiente'
);

-- Opcional: Crear un índice para búsquedas por fecha más rápidas
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (date);
