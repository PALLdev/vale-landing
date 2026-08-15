# NutriciónPro – Landing + Sistema de Gestión

Aplicación web completa para una consulta de nutrición.  
Incluye landing page pública, sistema de agendamiento de citas y panel de administración para gestionar pacientes, historial médico, citas y archivos.

**Demo:** [vale-landing.vercel.app](https://vale-landing.vercel.app)

---

## Características

### Lado público

- Landing page profesional de la consulta de nutrición
- Formulario de agendamiento de citas (`/agendar-consulta`)
- Selección de fecha y hora según disponibilidad
- Tipos de consulta: ingreso y seguimiento

### Panel de administración (`/admin`)

- Autenticación de administrador
- Gestión completa de citas (crear, editar, eliminar, cambiar estado)
- Gestión de pacientes
- Historial médico por paciente (timeline)
- Subida y gestión de archivos adjuntos (PDFs e imágenes)
- Compresión de PDFs
- Gestión de disponibilidad horaria
- Conversión de citas a pacientes

---

## Tecnologías

| Tecnología               | Uso                              |
| ------------------------ | -------------------------------- |
| **Next.js 15**           | Framework (App Router)           |
| **React 19**             | UI                               |
| **TypeScript**           | Tipado estático                  |
| **Supabase**             | Base de datos, Auth y Storage    |
| **Server Actions**       | Lógica del lado del servidor     |
| **Zod**                  | Validación de formularios        |
| **Tailwind CSS 4**       | Estilos                          |
| **shadcn/ui + Radix UI** | Componentes de interfaz          |
| **pdf-lib**              | Manipulación y compresión de PDF |
| **date-fns**             | Manejo de fechas                 |
| **Sonner**               | Notificaciones toast             |

---

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/PALLdev/vale-landing.git
cd vale-landing
npm install
```

### 2. Variables de entorno

Crea un archivo .env.local basado en .env.example:

NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

### 3. Configurar Supabase

Necesitas crear las siguientes tablas en Supabase (aprox.):

appointments
patients
medical_records
attachments
availability

Además, configurar Storage para los archivos adjuntos y las políticas de autenticación correspondientes.

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

### Funcionalidades principales:

**Citas**: CRUD completo + estados (pendiente, confirmada, cancelada).
**Pacientes**: Registro y edición de pacientes.
**Historial médico**: Timeline de registros clínicos por paciente.
**Archivos**: Subida de PDFs/imágenes + compresión de PDFs.
**Disponibilidad**: Configuración de horarios disponibles.
**Auth**: Login de administrador protegido por middleware.
