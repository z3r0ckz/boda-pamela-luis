# Boda Pamela & Luis

Sitio estático (HTML, CSS y JS sin compilación) para GitHub Pages, con Supabase como base de datos. Lee `PROYECTO.md` antes de cambiar algo: ahí están los datos de la boda, la arquitectura, la seguridad y la dirección de diseño.

## Reglas del proyecto
- Todo el contenido editable (textos, horarios, enlaces, claves) vive en `js/config.js`. No escribas datos de la boda directamente en el HTML ni en otros JS.
- Sin frameworks ni paso de build. Módulos ES nativos. Librerías externas solo por CDN con versión fija (supabase-js 2.45.4, xlsx 0.18.5) y cargadas bajo demanda.
- Textos para el usuario en español de México, en minúsculas de oración, sin guiones largos (—).
- La paleta verde, tipografías (Ms Madi para títulos, Jost para texto) y radios están en `css/base.css` como variables. Para texto usa `--tinta`, `--tinta-suave` y `--acento` (contraste AA); `--trazo` es solo para ilustraciones.
- Las ilustraciones son SVG de línea en `js/ilustraciones.js` (mismo grosor, `stroke="currentColor"`, atributo `data-draw`). Se dibujan una vez al entrar en pantalla; el texto no se anima. Para agregar un dibujo nuevo, súmalo a `ARTE`. Respeta `prefers-reduced-motion`.
- Cualquier cambio a la base de datos va en `supabase/schema.sql` y debe mantener RLS: los invitados solo usan las funciones `obtener_invitacion` y `responder_invitacion`.
- Mantén el modo demo de `js/data.js` funcionando igual que Supabase.

## Skills de diseño instaladas (`.claude/skills`)
- `impeccable`: para auditar (`/impeccable audit`), pulir (`/impeccable polish`) o criticar (`/impeccable critique`) cualquier pantalla.
- `emil-design-eng`: para decisiones y revisión de animaciones e interacciones.
- `design-taste-frontend` (taste-skill): para evitar patrones genéricos al agregar secciones nuevas.

## Verificar cambios
Sirve la carpeta (`npx serve .`) y revisa con Playwright (MCP configurado en `.mcp.json`) en 390px y 1440px de ancho:
- `/?id=familia-martinez-olvera-p3xd` (formulario, modo demo)
- `/?id=familia-hernandez-ruiz-k7m2` (ya confirmada)
- `/` (sin enlace) y `/admin.html`
