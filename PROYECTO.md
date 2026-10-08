# Boda Pamela & Luis: invitación web

Invitación digital para la boda de **Pamela y Luis**, con confirmación de asistencia por familia y un panel para que los novios lleven el control de invitados en tiempo real.

- **Fecha:** sábado 17 de abril de 2027
- **Ciudad:** Texcoco, Estado de México
- **Hosting:** GitHub Pages (gratis)
- **Base de datos:** Supabase (plan gratuito)

---

## 1. Qué hace el sitio

### La invitación (`index.html`)
Cada familia recibe un enlace único, por ejemplo:

```
https://TUUSUARIO.github.io/boda-pamela-luis/?id=familia-hernandez-ruiz-k7m2
```

Al abrirlo, el invitado ve:

1. **Encabezado:** su nombre ("Con cariño para Familia Hernández Ruiz"), un dibujo de los novios escondidos detrás de un gran corazón que sostienen con las manos (se traza solo al cargar), con sus nombres escribiéndose a mano dentro del corazón, "¡Nos casamos!", la fecha y la frase de apertura.
2. **Cuenta regresiva** dentro de un marco ondulado con moños (2:00 PM, hora de Ciudad de México).
3. **Dónde y cuándo:** ceremonia (dibujo de iglesia) y recepción (dibujo de copas) con botón "Cómo llegar" (Google Maps) y botón para **agregar al calendario** (.ics con recordatorio un día antes).
4. **Programa del día:** línea de tiempo con un dibujo por actividad y corazones que aparecen al llegar a cada hora.
5. **Mesa de regalos:** Liverpool, Amazon y sobre, cada uno con su dibujo.
6. **Confirma tu asistencia:**
   - "Esta invitación contiene **X boletos**".
   - ¿Nos acompañarán? **Sí / No**.
   - Si responde que sí, elige cuántos de sus X boletos va a usar (con botones grandes de + y −, pensados para personas mayores).
   - Mensaje opcional para los novios.
   - Al confirmar caen hojitas y corazones verdes, y se ofrece agregar el evento al calendario.
   - Puede **cambiar su respuesta** después usando el mismo enlace.
7. **Cierre** con la frase final y la firma.

Si alguien abre el sitio sin enlace personal, ve toda la invitación pero, en lugar del formulario, un aviso para usar el enlace que recibió.

### El panel de control (`admin.html`)
Solo para los novios (requiere correo y contraseña):

- **Resumen:** boletos confirmados de los asignados, barra de asistentes / no asistirán / sin responder, y cuántas familias ya respondieron.
- **Lista de invitaciones** con búsqueda y filtros (Todas, Asistirán, No asistirán, Sin responder).
- **Nueva invitación:** nombre de la familia, número de boletos, WhatsApp (opcional) y notas internas. Al crearla, el enlace se copia automáticamente.
- Por cada familia: **copiar enlace**, **enviar por WhatsApp** (con mensaje prellenado), **editar** y **eliminar**.
- **Registrar respuestas a mano** (si alguien les confirma por teléfono): en Editar, sección "Respuesta".
- **Importar lista** desde Excel o CSV (columnas `nombre`, `boletos`, `telefono`). Incluye plantilla descargable.
- **Descargar Excel** con dos hojas: lista completa con enlaces y resumen.
- **Tiempo real:** cuando una familia confirma, el panel se actualiza solo y muestra un aviso.
- **Mensajes para ustedes:** todos los mensajes que dejaron los invitados.

---

## 2. Estructura del proyecto

```
boda-pamela-luis/
├── index.html            Invitación
├── admin.html            Panel de control
├── css/
│   ├── base.css          Tipografías, paleta, botones (compartido)
│   ├── styles.css        Estilos de la invitación
│   └── admin.css         Estilos del panel
├── js/
│   ├── config.js         ← AQUÍ se editan textos, horarios, enlaces y Supabase
│   ├── data.js           Conexión a Supabase + modo demo
│   ├── app.js            Lógica de la invitación
│   ├── admin.js          Lógica del panel
│   ├── ilustraciones.js  Dibujos de línea (SVG) y animación de trazo
│   └── icons.js          Íconos (Phosphor Icons)
├── assets/
│   ├── fonts/            Ms Madi y Jost (auto-alojadas)
│   ├── favicon.svg
│   └── og-image.png      Imagen de vista previa para WhatsApp
├── supabase/
│   └── schema.sql        Tablas, seguridad y funciones
├── PROYECTO.md           Este documento
├── README.md             Resumen para GitHub
├── CLAUDE.md             Instrucciones para Claude Code
└── .nojekyll             Para que GitHub Pages sirva todo tal cual
```

No hay paso de compilación: son archivos HTML, CSS y JavaScript que se suben tal cual.

---

## 3. Probarlo en tu computadora (modo demo)

Mientras `js/config.js` no tenga las claves de Supabase, el sitio funciona en **modo demo**: trae 6 familias de ejemplo y guarda todo en el navegador. Sirve para ver y probar todo antes de conectar nada.

Como el sitio usa módulos de JavaScript, hay que abrirlo con un servidor local (no con doble clic):

```powershell
cd "C:\Users\luism\Documentos\Proyectos\boda_abril_2027"
npx serve .
```

Luego abre:

- Invitación general: http://localhost:3000/
- Como una familia: http://localhost:3000/?id=familia-martinez-olvera-p3xd
- Panel: http://localhost:3000/admin.html

> Si no tienes Node, también funciona `python -m http.server 3000`.

En el panel, el botón **Restaurar datos de ejemplo** reinicia el demo.

---

## 4. Conectar Supabase (confirmaciones reales)

1. Crea una cuenta en [supabase.com](https://supabase.com) y un proyecto nuevo (región: la más cercana, por ejemplo `us-east-1`).
2. Ve a **SQL Editor → New query**, pega el contenido de `supabase/schema.sql`.
3. **Antes de ejecutar**, cambia en la última línea `TU_CORREO@ejemplo.com` por el correo con el que vas a entrar al panel. Puedes agregar dos (el de Pamela y el de Luis):
   ```sql
   insert into public.admins (email) values ('pamela@correo.com'), ('luis@correo.com')
   on conflict do nothing;
   ```
   Luego presiona **Run**.
4. Ve a **Authentication → Users → Add user → Create new user** y crea el usuario con ese mismo correo y una contraseña. Marca "Auto Confirm User".
5. Ve a **Authentication → Sign In / Providers** y **desactiva "Allow new users to sign up"**. (Aunque alguien se registrara, no podría ver nada porque no está en la tabla `admins`, pero así queda más limpio.)
6. Ve a **Project Settings → API** y copia:
   - **Project URL**
   - **anon public key**
7. Pégalos en `js/config.js`:
   ```js
   supabase: {
     url: 'https://xxxxxxxx.supabase.co',
     anonKey: 'eyJhbGciOi...',
   },
   ```
   La clave `anon` es pública por diseño: la seguridad la dan las reglas de la base de datos (RLS).

### Cómo está protegida la información
- Los invitados **no pueden leer la tabla**. Solo pueden consultar y responder **su propia invitación** a través de dos funciones (`obtener_invitacion` y `responder_invitacion`), y solo si conocen su enlace.
- Los enlaces llevan 4 caracteres aleatorios (`familia-garcia-x7k2`) para que no se puedan adivinar.
- La base de datos rechaza confirmar más boletos de los asignados.
- Solo los correos en la tabla `admins` pueden ver, crear, editar o borrar invitaciones.
- El panel tiene `noindex` para que no aparezca en buscadores.

> Nota del plan gratuito de Supabase: los proyectos se pausan tras 7 días sin actividad. Si eso pasa, entra a supabase.com y presiona "Restore". Una vez que empiecen a llegar confirmaciones, la actividad lo mantiene despierto.

---

## 5. Publicar en GitHub Pages

### Opción A: con la terminal (Git instalado)
```powershell
cd "C:\Users\luism\Documentos\Proyectos\boda_abril_2027"
git init
git add .
git commit -m "Invitación de boda Pamela & Luis"
git branch -M main
git remote add origin https://github.com/TUUSUARIO/boda-pamela-luis.git
git push -u origin main
```
(Primero crea el repositorio vacío `boda-pamela-luis` en github.com → New repository.)

### Opción B: sin terminal
En github.com → New repository → `boda-pamela-luis` → "uploading an existing file" → arrastra todo el contenido de la carpeta → Commit.

### Activar Pages
En el repositorio: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**. En uno o dos minutos el sitio queda en:

```
https://TUUSUARIO.github.io/boda-pamela-luis/
```

### Después de publicar
1. En `js/config.js`, llena `urlSitio` con esa dirección (así los enlaces que copies desde el panel siempre usan la dirección pública).
2. En `index.html`, cambia `og:image` por la dirección completa: `https://TUUSUARIO.github.io/boda-pamela-luis/assets/og-image.png` (WhatsApp necesita la URL completa para mostrar la imagen).
3. Sube los cambios.

> El repositorio puede ser **público** sin riesgo: los datos de los invitados viven en Supabase, no en el código. (GitHub Pages gratis requiere repositorio público.)

---

## 6. Flujo de trabajo para los novios

1. Entrar a `.../admin.html`.
2. Cargar invitados: uno por uno con **Nueva invitación**, o todos de golpe con **Importar lista** (usa la plantilla).
3. Enviar: botón de WhatsApp en cada fila (abre el chat con el mensaje y el enlace ya escritos).
4. Seguir respuestas en vivo; registrar a mano quien confirme por teléfono.
5. Descargar el Excel para el salón, el catering o el acomodo de mesas.

El texto del mensaje de WhatsApp se cambia en `config.js` → `mensajeWhatsApp`.

---

## 7. Datos de la boda

### Ceremonia
- **Hora:** 2:00 PM
- **Lugar:** Parroquia de San Luis Obispo de Huexotla, Texcoco
- **Mapa:** https://maps.app.goo.gl/vnVAGAaa6wSZLhT39

### Recepción
- **Hora:** 7:00 PM
- **Lugar:** Salón Pintoraco, San Luis Huexotla, Texcoco
- **Mapa:** https://maps.app.goo.gl/YFvU8MfJwEQ6ukKW9

### Itinerario (provisional)
| Hora | Actividad | Estado |
|------|-----------|--------|
| 2:00 PM | Ceremonia religiosa | Confirmado |
| 3:30 PM | Sesión de fotos con los novios | Ejemplo |
| 5:00 PM | Cóctel de bienvenida | Ejemplo |
| 7:00 PM | Recepción y cena | Confirmado |
| 9:00 PM | Vals y brindis | Ejemplo |
| 10:00 PM | Pista abierta | Ejemplo |

Se muestra completo en la invitación. Ajusta los horarios en `config.js` antes de enviar enlaces, o pon `mostrarItinerario: false` para ocultarlo.

### Mesa de regalos (por completar)
- **Liverpool:** número de mesa y enlace pendientes → `config.js` → `regalos`
- **Amazon:** enlace pendiente
- **Sobre:** buzón el día del evento

### Textos
- **Apertura:** "Dos vidas, un mismo camino; dos historias, un mismo comienzo."
- **Cierre:** "Gracias por ser parte de esta nueva etapa. Nos vemos muy pronto."
- **Firma:** Con todo nuestro cariño, Pamela & Luis

### Fecha límite para confirmar
Opcional. En `config.js` → `fechaLimiteConfirmacion: '2027-03-15'` (por ejemplo). Con `null` no se muestra ni se aplica.

---

## 8. Dirección de diseño

**Idea central:** una invitación de papel, verde y minimalista, donde todo lo decorativo es un dibujo de línea que se traza solo. Abre con los novios detrás de un gran corazón: se traza el corazón, aparecen las manos, el pantalón de él y el vestido de ella, y los nombres se escriben a mano adentro; al bajar, cada ilustración (iglesia, copas, cámara, regalo, sobre) se dibuja una sola vez cuando aparece en pantalla. El texto no se anima: queda quieto y fácil de leer.

Referencias tomadas como inspiración (no copiadas): invitaciones web de una sola columna con ilustraciones de línea, títulos en letra manuscrita, línea de tiempo con íconos y cuenta regresiva enmarcada.

### Paleta (verde)
| Nombre | Código | Uso |
|--------|--------|-----|
| Papel | `#F6F7F0` | Fondo de la invitación |
| Tinta | `#2E3324` | Texto principal (12:1) |
| Tinta suave | `#5C6352` | Texto secundario (5.8:1) |
| Olivo | `#4F5D2F` | Títulos, botones, enlaces (6.6:1) |
| Olivo oscuro | `#3F4B24` | Botones al pasar el cursor |
| Musgo | `#6E7F43` | Ilustraciones de línea |
| Salvia | `#A7B48A` | Detalles suaves |
| Salvia clara | `#E4E9D8` | Botones suaves y etiquetas |
| Niebla | `#EEF1E6` | Fondo de la sección de confirmación |
| Mesa | `#DDE3CF` | Fondo detrás de la tarjeta en computadora |

Todos los textos cumplen contraste AA. La paleta anterior (bugambilias rosas) quedó reemplazada.

### Tipografía
- **Ms Madi**: letra manuscrita de trazo uniforme, para nombres y títulos de sección. Combina con el grosor de las ilustraciones.
- **Jost** (300, 400, 500): texto, horarios, números y todo el panel de control.

Ambas están auto-alojadas en `assets/fonts`.

### Composición
- En el celular la invitación ocupa toda la pantalla; en computadora se ve como una tarjeta de papel sobre un fondo salvia.
- Una sola columna centrada, con mucho aire entre secciones.
- Botones en píldora; "Cómo llegar" en salvia suave; "Confirmar asistencia" en olivo.
- Las opciones Sí / No son círculos que se rellenan al elegir.

### Movimiento
- Encabezado: el corazón y los novios se dibujan (1.6 s), el pantalón se rellena, los nombres se escriben de izquierda a derecha dentro del corazón y después aparece el resto del texto.
- Al bajar: cada ilustración se traza una sola vez al entrar en pantalla; en el programa del día, la línea crece y el corazón de cada hora aparece con un pequeño rebote.
- Al confirmar asistencia: caen hojitas y corazones verdes (solo una vez).
- Botones con respuesta al presionar (`scale(0.97)`) y curvas propias de *ease-out*.
- Con "reducir movimiento" activado en el teléfono, todo aparece ya dibujado y sin animación.

### Skills de diseño usadas
- **impeccable** (Paul Bakaus): piso de calidad (contraste, estados de carga, error y vacío, foco y selección con color propio), modo *Persuade* para la invitación y *Operate* para el panel.
- **emil-design-eng** (Emil Kowalski): marco de decisión de animaciones (qué se anima y por qué), animación solo de trazo, opacidad y transformaciones, curvas de easing, transiciones interrumpibles y respeto a `prefers-reduced-motion`.
- **taste-skill / design-taste-frontend** (Leonxlnx): sin etiquetas decorativas sobre los títulos, sin guiones largos, una sola escala de radios, etiqueta arriba de cada campo, contraste revisado en botones y formularios.
- **frontend-design**: un solo elemento memorable (los novios detrás del corazón) y todo lo demás en calma.

## 9. Pendientes

- [ ] Ajustar horarios provisionales del itinerario
- [ ] Número de mesa y enlace de Liverpool
- [ ] Enlace de la lista de Amazon
- [ ] Decidir fecha límite para confirmar
- [ ] Crear proyecto en Supabase y pegar claves en `config.js`
- [ ] Publicar en GitHub Pages y actualizar `urlSitio` y `og:image`
- [ ] (Opcional) Foto de los novios para la invitación
- [ ] Cargar la lista de invitados en el panel
