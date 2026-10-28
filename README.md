# Clínica Virtual - Frontend
### Trabajo Práctico Integrador N° 2 - Programación 2

Aplicación web desarrollada con **Angular 21** y **Angular Material 21**, orientada a la gestión integral hospitalaria, telemedicina, administración de turnos médicos y registros clínicos para la Clínica Virtual.

> ⚠️ **Rama de entrega:** la versión que se entrega y se defiende de este frontend se encuentra en la rama **`entrega-frontend`** del repositorio. Verificar estar parado sobre esa rama (`git checkout entrega-frontend`) antes de instalar dependencias y levantar el proyecto.

---

## 🚀 Requisitos del Sistema

Para compilar y ejecutar este proyecto de forma local se requiere:

- **Node.js**: Versión 22 LTS (recomendado 22.x)
- **NPM**: Versión 10.x o 11.x (incluido con Node.js)
- **Angular CLI**: Versión 21 (instalación global opcional: `npm install -g @angular/cli@21`)

### Versiones utilizadas

| Herramienta | Versión |
| :--- | :--- |
| Node.js | 24.6.0 (el proyecto también es compatible con 22 LTS) |
| Angular CLI | 21.2.26 |
| Angular / Angular Material / CDK | 21.2.x |
| TypeScript | 5.9.x |
| RxJS | 7.8.x |
| **Chart.js** (librería de gráficos) | 4.5.x |

### Librería de gráficos

Los reportes del administrador se visualizan con **Chart.js**, integrada mediante un componente propio (`shared/components/grafico/grafico.component.ts`) que envuelve el canvas, registra solo los controladores necesarios (barras y torta) y destruye el gráfico al cambiar los datos o al salir de la pantalla. No se usa `ng2-charts`. El dashboard se carga de forma diferida (lazy), por lo que Chart.js no forma parte del bundle inicial.

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

### Endpoints consumidos:
- `POST /auth/login`, `POST /auth/registro`, `GET /auth/coberturas` (público), `GET /auth/perfil` y `PUT /auth/perfil` (requieren `Authorization: Bearer <TOKEN>`).
- `GET|POST|PUT|DELETE /sedes`, `/especialidades`, `/coberturas`: ABM del administrador.
- `GET /usuarios` (paginado y filtrado), `POST /usuarios`, `PUT /usuarios/:id`: gestión de usuarios.
- `GET /auditoria` (paginado y filtrado) y `GET /reportes/*`: auditoría e indicadores del dashboard.
- `GET /consultas/sedes|especialidades|medicos|pacientes`: catálogos de lectura para médico, operador y paciente.
- `GET|POST|PUT|DELETE /agenda`: agenda de médicos y operadores.
- `GET /turnos`, `POST /turnos`, `PUT /turnos/:id/cancelar`, `PUT /turnos/:id/atender`, `GET /turnos/fechas-disponibles`, `GET /turnos/disponibilidad`.
- `GET|POST /historial`, `GET /notificaciones` y `PUT /notificaciones/:id/leida`.

### Manejo de sesión y errores
- `authInterceptor` adjunta el token JWT solo a las peticiones dirigidas a `environment.apiUrl`.
- `errorInterceptor` cierra la sesión y redirige al login ante un `401` (excepto en `/auth/login`), y muestra un aviso ante un error de red o un `5xx`. Los errores `4xx` los muestra cada pantalla con el mensaje devuelto por el backend.

---

## 🧰 Cambios realizados en el backend

Todos los endpoints nuevos o modificados mantienen la estructura de respuesta uniforme `{ codigo, estado, datos }`, están protegidos por rol y las altas, modificaciones y bajas de usuarios y catálogos siguen registrándose en la auditoría. Todos están documentados en la colección de Postman (`TP2-Programacion2-Backend-Riffel-Villarroel/docs`). Es necesario reiniciar el backend para que tome estos cambios.

### Endpoints nuevos

| Endpoint | Roles | Descripción |
| :--- | :--- | :--- |
| `GET /consultas/sedes` | médico, operador, paciente | Listado de sedes de solo lectura (el ABM sigue siendo del administrador). |
| `GET /consultas/especialidades` | médico, operador, paciente | Listado de especialidades de solo lectura. |
| `GET /consultas/medicos?id_sede&id_especialidad` | médico, operador, paciente | Médicos con nombre, apellido, sede y especialidades, filtrables por sede y especialidad. No expone otros datos personales. |
| `GET /consultas/pacientes?dni&apellido` | médico, operador | Búsqueda de pacientes por DNI (prefijo) o apellido (máx. 25). El médico solo ve pacientes con turnos en su agenda. |
| `GET /turnos/fechas-disponibles?id_medico&id_sede&id_especialidad` | paciente, operador | Fechas futuras en que el médico tiene agenda con al menos un horario libre. |
| `GET /turnos/disponibilidad?id_medico&id_sede&id_especialidad&fecha` | paciente, operador | Horarios libres del día: rangos de agenda menos turnos confirmados, en bloques de `DURACION_TURNO_MIN` minutos (misma duración que valida el alta de turno). |
| `PUT /auth/perfil` | cualquier usuario con sesión | Actualiza solo `email`, `telefono`, `id_cobertura` y, opcionalmente, `contrasena` (mínimo 6 caracteres, se guarda hasheada con bcrypt). Valida formato y unicidad del email y existencia de la cobertura. |

### Endpoints modificados

**`consulta.controller.js`** y **`turno.controller.js`**
- `GET /consultas/pacientes` ahora devuelve también `id_cobertura` (se muestra en el resumen al asignar un turno).
- `GET /turnos` incluye `paciente_fecha_nacimiento` (el médico ve la edad del paciente en *Turnos programados*).

**`usuario.controller.js`**
- `GET /usuarios`: paginado y filtrable. Parámetros opcionales: `pagina` (default 1), `limite` (default 10, máximo 100), `nombre`, `apellido` (búsqueda parcial), `rol` e `id_sede`. La respuesta es `{ usuarios, total, pagina, limite }` e incluye `dni`, `fecha_nacimiento`, `sede` y `especialidades` (médicos).
- `POST /usuarios` y `PUT /usuarios/:id`: aceptan `especialidades` (arreglo de ids) y las guardan en `medico_especialidad` dentro de una transacción. Operador y médico requieren `id_sede`; el médico requiere al menos una especialidad; administrador y paciente se guardan sin sede. DNI o email duplicado responde `409`; modificar un usuario inexistente, `404`.
- `DELETE /usuarios/:id`: también elimina las filas de `medico_especialidad`.

**`auditoria.controller.js`**
- `GET /auditoria`: paginado, más recientes primero. Parámetros opcionales: `pagina`, `limite`, `id_usuario`, `usuario` (nombre, apellido o correo), `entidad`, `desde` y `hasta`. La respuesta es `{ logs, total, pagina, limite }`.

**`turno.controller.js`**
- `GET /turnos`: el paciente ve solo sus turnos; el médico los suyos en cualquier sede (filtros `fecha` e `id_sede`); el operador los de su sede (filtro `fecha`).

### Columna `telefono`

La tabla `usuario` no necesita migración manual: `GET /auth/perfil` y `PUT /auth/perfil` verifican con `SHOW COLUMNS` si existe la columna `telefono` y, si falta, ejecutan `ALTER TABLE usuario ADD COLUMN telefono VARCHAR(30) NULL` una sola vez por ejecución del servidor. Funciona igual en bases nuevas y en bases creadas antes de este cambio.

> Quien consuma `GET /usuarios` o `GET /auditoria` debe tener en cuenta que ahora devuelven una sola página.

---

## 🛠️ Levantar el backend y la base de datos (desde cero)

Requisitos: Node.js 22 LTS o 24 y MySQL 8 (o MariaDB 10.6+) en ejecución.

1. **Instalar dependencias del backend:**
   ```bash
   cd TP2-Programacion2-Backend-Riffel-Villarroel/backend
   npm install
   ```
2. **Crear la base y cargar los datos de prueba** con el script `backend/sql/schema_and_seed.sql`. Crea la base `clinica_TP2_programacion`, todas las tablas (`usuario`, `sede`, `especialidad`, `cobertura`, `medico_especialidad`, `agenda`, `turno`, `historial_clinico`, `log_auditoria`, `notificacion`) y los datos de prueba:
   ```bash
   mysql -u root -p < sql/schema_and_seed.sql
   ```
   (o abrir el archivo en MySQL Workbench y ejecutarlo completo). Es idempotente: se puede volver a ejecutar y además refresca las fechas de agenda y turnos (son relativas al día actual). Está pensado para una base nueva.
3. **Crear el archivo `backend/.env`** (no se versiona):
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=<tu_contraseña_de_mysql>
   DB_NAME=clinica_TP2_programacion
   JWT_SECRET=<un_texto_secreto_cualquiera>
   ```
4. **Iniciar el servidor** (CORS ya está habilitado):
   ```bash
   npm run dev     # con nodemon; o: npm start
   ```
   Verificar en `http://localhost:3000/health`.
5. **Levantar el frontend** como se indica en *Instalación y Puesta en Marcha* y abrir `http://localhost:4200/`.

---

## 👤 Usuarios de prueba

Cargados por `schema_and_seed.sql`. Todos se ingresan con **DNI y contraseña** (el email no se usa para loguearse).

| Rol | DNI | Email | Contraseña | Notas |
| :--- | :--- | :--- | :--- | :--- |
| Administrador | 12312312 | - | admin123 | Acceso total: ABMs, reportes y auditoría |
| Operador | 40123123 | operador@gmail.com | prueba123 | Gestión de agendas y asignación de turnos en su sede (Sede Central) |
| Médico | 41123123 | medico@gmail.com | prueba123 | Cardiología y Clínica Médica; **agenda en Sede Central y Sede Norte** |
| Paciente 1 | 42123123 | - | prueba123 | Reserva y consulta de historial — cobertura OSDE |
| Paciente 2 | 43123123 | - | prueba123 | Reserva y consulta de historial — cobertura Swiss Medical |
| Paciente 3 | 44123123 | - | prueba123 | Reserva y consulta de historial — cobertura PAMI |

Además, la semilla incluye dos médicos adicionales para poder probar la gestión multi-sede (agenda y turnos en otras sedes y especialidades):

| Rol | DNI | Email | Contraseña | Sede |
| :--- | :--- | :--- | :--- | :--- |
| Médico 2 (Pediatría) | 20000002 | medico2@clinica.test | prueba123 | Sede Norte |
| Médico 3 (Dermatología) | 20000003 | medico3@clinica.test | prueba123 | Sede Sur |

Datos cargados: 3 sedes, 4 coberturas, 4 especialidades, agendas para hoy, mañana y los próximos días, y 11 turnos (5 confirmados, 3 atendidos con historial clínico y 3 cancelados), además de notificaciones y registros de auditoría de ejemplo.

---

## 🧭 Guía rápida de prueba por rol

Con el backend y el frontend corriendo, ingresar en `http://localhost:4200/login` con el DNI y contraseña de cada rol de la tabla anterior.

- **Administrador** (`12312312` / `admin123`)
  - `Dashboard` (`/admin/reportes`): indicadores generales y gráficos con Chart.js (turnos por estado, por sede, por especialidad), con filtro de fechas.
  - `Usuarios` (`/admin/usuarios`): alta, edición y baja de operadores, médicos y pacientes, con asignación de sede y especialidades.
  - `Sedes`, `Especialidades`, `Coberturas` (`/admin/sedes`, `/admin/especialidades`, `/admin/coberturas`): ABM de catálogos base del sistema.
  - `Auditoría` (`/admin/auditoria`): log de solo lectura de todas las acciones de alta/modificación/baja registradas por el sistema, con filtros por usuario, entidad y fecha.

- **Operador** (`40123123` / `prueba123`, Sede Central)
  - `Agenda` (`/operador/agenda`): asignación de franjas horarias a los médicos de su sede.
  - `Turnos` (`/operador/turnos`) y `Asignar turno` (`/operador/asignar-turno`): reserva de turnos para pacientes existentes o nuevos, filtrando por sede, especialidad y médico.
  - `Pacientes` (`/operador/pacientes`): búsqueda y alta de pacientes.

- **Médico** (`41123123` / `prueba123`, Cardiología/Clínica Médica — para probar multi-sede también están el Médico 2 `20000002` y el Médico 3 `20000003`, ambos con contraseña `prueba123`)
  - `Mi Agenda` (`/medico/agenda`): publicación de las franjas horarias en las que atiende.
  - `Turnos Programados` (`/medico/turnos`): listado de turnos a atender; al atender uno se completa diagnóstico y tratamiento, lo que genera un registro de historial clínico.
  - `Historial Clínico` (`/medico/historial`): consulta del historial de los pacientes atendidos.

- **Paciente** (por ejemplo `42123123` / `prueba123`)
  - `Nuevo turno` (`/paciente/nuevo-turno`): alta de un turno eligiendo sede, especialidad, médico, fecha y horario disponible.
  - `Mis turnos` (`/paciente/mis-turnos`): listado de turnos propios (próximos, atendidos y cancelados), con la ficha de historial clínico embebida en los turnos ya atendidos.
  - `Mis datos` (`/paciente/datos`): edición de email, teléfono, cobertura y contraseña.

---

## 📬 Colección de Postman

Archivo: `TP2-Programacion2-Backend-Riffel-Villarroel/docs/TP2 - API (Riffel-Villarroel).postman_collection.json` (Postman → *Import*).

- Variables: `base_url` (por defecto `http://localhost:3000`) y `tp2_token`.
- Flujo: ejecutar **Auth → Iniciar Sesión (Login)** con el usuario del rol a probar y usar el token devuelto (variable `tp2_token`) en el resto de las peticiones.
- Carpetas: Health, Auth, Coberturas, Sedes, Especialidades, Agenda, Consultas, Turnos, Historial Clínico, Notificaciones, Usuarios (Admin), Auditoría y Reportes y Estadísticas. El nombre de cada carpeta o petición indica el rol habilitado.
- Todas las respuestas tienen la forma `{ "codigo": <número>, "estado": "ok" | "error", "datos": { ... } }`.

---

## 🏛️ Arquitectura Implementada

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
│   │   ├── auth.interceptor.ts       # Inyección automática del JWT Bearer en peticiones a la API
│   │   └── error.interceptor.ts      # Sesión vencida (401), servidor caído y errores 5xx
│   ├── models/
│   │   ├── auth.models.ts            # Interfaces TypeScript (Usuario, Cobertura, ApiResponse)
│   │   └── admin.models.ts           # Sedes, especialidades, usuarios, auditoría y reportes
│   ├── services/
│   │   ├── auth.service.ts           # Gestión reactiva de sesión con Angular Signals
│   │   ├── catalogo-api.ts           # Base común del CRUD de catálogos
│   │   ├── sede / especialidad / cobertura.service.ts
│   │   ├── usuario / auditoria / reporte.service.ts
│   │   └── notificador.service.ts    # Avisos con MatSnackBar y extracción de mensajes del backend
│   └── utils/                        # Fechas (ISO <-> Date) y paginador en español
├── shared/
│   └── components/
│       ├── header/                   # Barra de navegación reactiva (auth/unauth, tooltip, logout)
│       ├── sidebar/                  # Menú lateral dinámico filtrado por rol con mat-nav-list
│       ├── footer/                   # Pie de página institucional completo y responsive
│       ├── confirm-dialog/           # Diálogo de confirmación reutilizable
│       ├── grafico/                  # Wrapper de Chart.js (barras y torta)
│       └── nuevo-turno/              # Stepper de solicitud de turno, compartido por paciente y operador
└── features/
    ├── admin/                        # Cargado con loadChildren desde app.routes.ts
    │   ├── admin.routes.ts
    │   ├── catalogos/                # ABM de sedes, especialidades y coberturas (un único componente configurable)
    │   ├── usuarios/                 # Listado paginado con filtros y alta/edición por tipo de usuario
    │   ├── auditoria/                # Registro de solo lectura, paginado y filtrable
    │   └── dashboard/                # Indicadores y gráficos con filtro de fechas
    ├── auth/
    │   ├── login/                    # Inicio de sesión con validaciones y feedback (SnackBar)
    │   └── registro/                 # Formulario reactivo de registro de pacientes
    ├── home/                         # Landing interactiva con vista pública y privada por rol
    ├── perfil/                       # Vista protegida de perfil con datos personales y cobertura
    ├── medico/                       # Agenda, turnos programados e historial clínico
    ├── operador/                     # Agenda por sede, turnos, alta de pacientes y asignación
    ├── paciente/                     # Nuevo turno, mis turnos y mis datos
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
| `/admin/reportes` | Privado | `authGuard`, `roleGuard(['administrador'])` | Dashboard de indicadores (ruta inicial de `/admin`) |
| `/admin/usuarios` | Privado | `authGuard`, `roleGuard(['administrador'])` | Gestión de usuarios |
| `/admin/sedes`, `/admin/especialidades`, `/admin/coberturas` | Privado | `authGuard`, `roleGuard(['administrador'])` | ABM de catálogos |
| `/admin/auditoria` | Privado | `authGuard`, `roleGuard(['administrador'])` | Registro de auditoría |
| `/medico/agenda`, `/medico/turnos`, `/medico/historial` | Privado | `authGuard`, `roleGuard(['medico'])` | Agenda, turnos programados e historial clínico |
| `/operador/agenda`, `/operador/turnos`, `/operador/asignar-turno`, `/operador/pacientes` | Privado | `authGuard`, `roleGuard(['operador'])` | Agenda por sede, turnos, asignación y alta de pacientes |
| `/paciente/nuevo-turno`, `/paciente/mis-turnos`, `/paciente/datos` | Privado | `authGuard`, `roleGuard(['paciente'])` | Solicitud de turnos, listado y datos personales |
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
