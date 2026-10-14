# StoreGo (React + Express + MySQL)

Tienda de consolas PlayStation con **React + Vite** en el frontend y una **API Express** que guarda todo en **MySQL**:
usuarios, productos (con galería de fotos), pedidos y su historial de seguimiento.

## Requisitos

- Node.js 18 o superior
- MySQL 5.7+ / 8.x (o MariaDB 10.4+) encendido

## Puesta en marcha

```bash
npm install
cp .env.example .env        # en Windows: copy .env.example .env
# edita .env y pon tu contraseña de MySQL en DB_PASSWORD
npm run db:init             # crea la base "storego", las tablas y los datos iniciales
npm run dev:all             # web en http://localhost:5173 y API en http://localhost:3001
```

`npm run db:init` se puede repetir sin problema: solo crea lo que falta y actualiza bases antiguas (por ejemplo, agrega `pedidos.cliente_run` y lo completa en los pedidos ya hechos). También puedes ejecutar `server/schema.sql`
a mano en MySQL Workbench / phpMyAdmin (selecciona antes la base de datos).

Si prefieres dos terminales: `npm run dev` (web) y `npm run server` (API).

### Producción

```bash
npm run build
NODE_ENV=production JWT_SECRET=<texto-largo-aleatorio> npm start
```

Con `dist/` generado, la misma API entrega el sitio y atiende `/api` en un solo puerto. Usa HTTPS delante (las contraseñas viajan en la petición de login).

## Cuentas de prueba (se crean solo si no hay ningún usuario)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@duoc.cl | admin123 |
| Vendedor | vendedor@duoc.cl | vend123 |

Antes de publicar el sitio crea tu propio administrador desde **Panel → Nuevo usuario** y elimina estas cuentas:

```sql
DELETE FROM usuarios WHERE email IN ('admin@duoc.cl', 'vendedor@duoc.cl');
```

## Qué se guarda dónde

| Dato | Dónde |
|---|---|
| Usuarios (contraseña con bcrypt), productos, galería, fotos subidas, pedidos e historial | **MySQL** |
| Sesión | Token JWT (7 días) en el navegador, validado por la API en cada petición |
| Carrito | `localStorage` del navegador; al finalizar la compra pasa a MySQL como pedido |

Tablas: `usuarios`, `productos`, `producto_imagenes`, `imagenes`, `pedidos`, `pedido_items`, `pedido_historial`.

- Las fotos subidas desde el panel se guardan dentro de MySQL (tabla `imagenes`) y se sirven en `/api/imagenes/ID`. Cada foto admite hasta 3 MB; las fotos que dejan de usarse se borran solas.
- Cada pedido guarda una copia del nombre, el RUT, el precio y el teléfono del cliente: editar o borrar un producto o usuario después no cambia el historial.
- No puedes cambiar tu propio rol ni eliminar tu propia cuenta, y siempre debe quedar al menos un administrador. Al eliminar un usuario sus pedidos se conservan en el panel de pedidos.
- El servidor calcula el total con los precios de la base de datos; nunca confía en los precios que envía el navegador.

## Panel de administración

| Ruta | Rol | Qué hace |
|---|---|---|
| `/admin` | admin, vendedor | Resumen: productos, usuarios, pedidos, pendientes y ventas |
| `/admin/productos` | admin, vendedor | Agregar, editar y quitar productos, con imagen principal y galería de hasta 6 fotos |
| `/admin/pedidos` | admin, vendedor | Compras con RUT y teléfono del cliente; buscar (también por RUT), filtrar y cambiar el estado |
| `/admin/usuarios` | admin | Usuarios con número de compras y total gastado; cambiar el rol (administrador, vendedor, cliente) y eliminar usuarios |
| `/admin/usuarios/nuevo` | admin | Crear usuarios con rol |

Los usuarios ven el seguimiento de sus compras en `/mis-pedidos` (se actualiza solo cada 30 s).

## API

| Método y ruta | Acceso |
|---|---|
| `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me` | público / público / sesión |
| `GET /api/productos` | público |
| `POST /api/productos`, `PUT /api/productos/:id`, `DELETE /api/productos/:id` | admin, vendedor |
| `GET /api/imagenes/:id` | público |
| `POST /api/pedidos`, `GET /api/pedidos/mios` | sesión |
| `GET /api/pedidos`, `PATCH /api/pedidos/:codigo/estado` | admin, vendedor |
| `GET /api/usuarios`, `POST /api/usuarios`, `PATCH /api/usuarios/:id/rol`, `DELETE /api/usuarios/:id` | admin |
| `GET /api/admin/resumen` | admin, vendedor |

## Estructura

```
server/                API Express: index.js, init-db.js, schema.sql, routes/, lib/, middleware/
src/lib/api.js         cliente de la API (agrega el token a cada petición)
src/lib/useFetch.js    carga datos de la API con refresco automático
src/context/           StoreContext (productos, carrito, pedidos), AuthContext (sesión)
src/pages, components  páginas y componentes de React
```

## Problemas frecuentes

- **"Faltan la base de datos o las tablas"**: ejecuta `npm run db:init`.
- **"MySQL rechazó el usuario o la contraseña"**: revisa `DB_USER` y `DB_PASSWORD` en `.env`.
- **Error al subir una foto grande**: sube `max_allowed_packet` de MySQL (por ejemplo `SET GLOBAL max_allowed_packet = 16*1024*1024;`). En MySQL 5.7 el valor por defecto es 4 MB.
- **Las sesiones se cierran al reiniciar la API**: define `JWT_SECRET` en `.env`.

## Contacto y suscripción por correo (EmailJS)

El formulario de **Contacto** y el de **Suscripción** (inicio) envían un correo a `archistep403@gmail.com` con EmailJS (plan gratis: 200 correos al mes).

1. Crea una cuenta en https://www.emailjs.com y en **Email Services** conecta el Gmail desde el que se enviará (copia el *Service ID*).
2. En **Email Templates** crea una plantilla con estos datos:
   - **To Email:** `{{to_email}}`  (o escribe directamente `archistep403@gmail.com`)
   - **Reply To:** `{{reply_to}}`
   - **Subject:** `{{asunto}}`
   - **Content:**
     ```
     Tipo: {{tipo}}
     Nombre: {{nombre}}
     Correo: {{email}}

     {{mensaje}}
     ```
   Copia el *Template ID*.
3. En **Account → General** copia la *Public Key*.
4. Pon los tres valores en `.env` (`VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`) y reinicia `npm run dev`. Si haces `npm run build`, hazlo con el `.env` ya completo.

Si falta alguna clave, el sitio avisa con un mensaje en pantalla en vez de fallar en silencio. En EmailJS, en **Account → Security**, puedes limitar los dominios autorizados para que nadie más use tu clave pública.
