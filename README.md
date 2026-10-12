# Clínica Virtual - Frontend
### Trabajo Práctico Integrador N° 2 - Programación 2

Aplicación web desarrollada con **Angular 21** y **Angular Material 21**, orientada a la gestión integral hospitalaria, telemedicina, administración de turnos médicos y registros clínicos para la Clínica Virtual.

---

## 🚀 Requisitos del Sistema

Para compilar y ejecutar este proyecto de forma local se requiere:

- **Node.js**: Versión 22 LTS (recomendado 22.x)
- **NPM**: Versión 10.x o 11.x (incluido con Node.js)
- **Angular CLI**: Versión 21 (instalación global opcional: `npm install -g @angular/cli@21`)

---

## ⚙️ Instalación y Puesta en Marcha

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd TP2-Programacion2-Riffel-Villarroel-Frontend
   ```

2. **Instalar dependencias:**
   Ejecutar la instalación utilizando el flag `--legacy-peer-deps` para asegurar la compatibilidad estricta de paquetes:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   ng serve
   # o alternativamente:
   npm start
   ```

4. **Acceder a la aplicación:**
   Abrir un navegador web e ingresar a `http://localhost:4200/`.

---

## 🔌 Conexión con el Backend

El frontend se comunica con una API REST desarrollada en Node.js / Express con base de datos MySQL, la cual debe estar corriendo en:

- **URL Base:** `http://localhost:3000`
- **Configuración de entorno:** Definida en `src/environments/environment.ts`
  ```typescript
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:3000'
  };
  ```
- **Requisito de red:** El backend debe tener CORS habilitado para permitir peticiones provenientes de `http://localhost:4200`.

### Endpoints principales consumidos en esta etapa:
- `POST /auth/login`: Autenticación por DNI y contraseña. Devuelve token JWT y datos iniciales.
- `POST /auth/registro`: Alta de pacientes con selección de obra social / cobertura.
- `GET /auth/perfil`: Datos del usuario autenticado (requiere Header `Authorization: Bearer <TOKEN>`).
- `GET /coberturas`: Listado de obras sociales y prepagas disponibles.

---

## 🏛️ Arquitectura Implementada (Semana 1 - Bloque 1 y Bloque 2)

El frontend está estructurado siguiendo las mejores prácticas de Angular moderno con componentes Standalone, control flow nativo y detección de cambios **Zoneless** (`provideZonelessChangeDetection`):

```
src/app/
├── app.config.ts                     # Configuración zoneless, router, http con interceptores
├── app.routes.ts                     # Rutas públicas, protegidas, por rol y páginas de error
├── app.ts / app.html / app.css       # Layout Shell con mat-sidenav-container y sticky footer
├── core/
│   ├── guards/
│   │   └── auth.guard.ts             # authGuard y roleGuard(rolesPermitidos)
│   ├── interceptors/
│   │   └── auth.interceptor.ts       # Inyección automática del JWT Bearer en peticiones HTTP
│   ├── models/
│   │   └── auth.models.ts            # Interfaces TypeScript (Usuario, Cobertura, ApiResponse)
│   └── services/
│       ├── auth.service.ts           # Gestión reactiva de sesión con Angular Signals
│       └── cobertura.service.ts      # Consulta de obras sociales disponibles
├── shared/
│   └── components/
│       ├── header/                   # Barra de navegación reactiva (auth/unauth, tooltip, logout)
│       ├── sidebar/                  # Menú lateral dinámico filtrado por rol con mat-nav-list
│       └── footer/                   # Pie de página institucional completo y responsive
└── features/
    ├── auth/
    │   ├── login/                    # Inicio de sesión con validaciones y feedback (SnackBar)
    │   └── registro/                 # Formulario reactivo de registro de pacientes
    ├── home/                         # Landing interactiva con vista pública y privada por rol
    ├── perfil/                       # Vista protegida de perfil con datos personales y cobertura
    ├── shared/
    │   └── en-construccion/          # Componente informativo de funcionalidades en desarrollo
    └── errors/
        ├── acceso-denegado/          # Error 403 (falta de permisos por rol)
        └── not-found/                # Error 404 (ruta inexistente)
```

---

## 🔐 Matriz de Rutas y Control de Acceso (RBAC)

| Ruta | Acceso | Guard / Protección | Descripción |
| :--- | :--- | :--- | :--- |
| `/` | Público / Privado | Ninguno | Landing institucional si no hay sesión; Panel de bienvenida si está logueado |
| `/login` | Público | Ninguno | Inicio de sesión con DNI y contraseña |
| `/registro` | Público | Ninguno | Registro de nuevos pacientes |
| `/perfil` | Privado | `authGuard` | Consulta de perfil del usuario en sesión (`GET /auth/perfil`) |
| `/en-construccion` | Privado | `authGuard` | Notificación de módulo correspondiente a semanas posteriores |
| `/admin` | Privado | `authGuard`, `roleGuard(['administrador'])` | Panel de administración |
| `/medico` | Privado | `authGuard`, `roleGuard(['medico'])` | Portal médico |
| `/operador` | Privado | `authGuard`, `roleGuard(['operador'])` | Gestión de turnos y recepción |
| `/paciente` | Privado | `authGuard`, `roleGuard(['paciente'])` | Portal del paciente |
| `/acceso-denegado`| Público / Privado | Ninguno | Pantalla de error 403 |
| `/404` | Público / Privado | Ninguno | Pantalla de error 404 |
| `**` | Cualquiera | Redirige a `/404` | Redirección comodín |

---

## 🧪 Compilación para Producción

Para compilar el proyecto y generar los artefactos optimizados:

```bash
npm run build
```

Los archivos resultantes se encontrarán en el directorio `dist/frontend`.
