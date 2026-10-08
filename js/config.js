// =====================================================================
//  CONFIGURACIÓN DE LA BODA
//  Este es el único archivo que necesitas editar para cambiar textos,
//  horarios, enlaces y la conexión a Supabase.
// =====================================================================

export const CONFIG = {
  // --- Supabase -------------------------------------------------------
  // Déjalos vacíos para usar el MODO DEMO (los datos viven solo en tu
  // navegador). Cuando crees tu proyecto en supabase.com, copia aquí:
  // Project Settings -> API -> "Project URL" y "anon public key".
  supabase: {
    url: '',
    anonKey: '',
  },

  // URL pública del sitio (opcional). Se usa para armar los enlaces de
  // cada familia. Si la dejas vacía se calcula sola a partir de la
  // dirección donde abras el panel. Ej: 'https://tuusuario.github.io/boda-pamela-luis/'
  urlSitio: '',

  // --- Los novios -----------------------------------------------------
  novia: 'Pamela',
  novio: 'Luis',

  // Fecha y hora de la ceremonia (hora de Ciudad de México, UTC-6).
  // Se usa para la cuenta regresiva y el archivo de calendario.
  fechaISO: '2027-04-17T14:00:00-06:00',
  fechaTexto: 'Sábado 17 de abril de 2027',
  ciudad: 'Texcoco, Estado de México',

  frases: {
    apertura: 'Dos vidas, un mismo camino; dos historias, un mismo comienzo.',
    cierre: 'Gracias por ser parte de esta nueva etapa. Nos vemos muy pronto.',
    firma: 'Con todo nuestro cariño',
  },

  ceremonia: {
    titulo: 'Ceremonia religiosa',
    hora: '2:00 PM',
    lugar: 'Parroquia de San Luis Obispo de Huexotla',
    zona: 'San Luis Huexotla, Texcoco',
    mapa: 'https://maps.app.goo.gl/vnVAGAaa6wSZLhT39',
  },

  recepcion: {
    titulo: 'Recepción',
    hora: '7:00 PM',
    lugar: 'Salón Pintoraco',
    zona: 'San Luis Huexotla, Texcoco',
    mapa: 'https://maps.app.goo.gl/YFvU8MfJwEQ6ukKW9',
  },

  // Itinerario. OJO: solo 2:00 PM y 7:00 PM están confirmados; el resto
  // son horarios de ejemplo. Ajusta o borra filas antes de enviar.
  // Pon mostrarItinerario en false para ocultar la sección completa.
  mostrarItinerario: true,
  itinerario: [
    // icono: iglesia, anillos, camara, coctel, cena, copas, disco, corazon
    { hora: '2:00 PM', actividad: 'Ceremonia religiosa', icono: 'iglesia' },
    { hora: '3:30 PM', actividad: 'Sesión de fotos con los novios', icono: 'camara' },
    { hora: '5:00 PM', actividad: 'Cóctel de bienvenida', icono: 'coctel' },
    { hora: '7:00 PM', actividad: 'Recepción y cena', icono: 'cena' },
    { hora: '9:00 PM', actividad: 'Vals y brindis', icono: 'copas' },
    { hora: '10:00 PM', actividad: 'Pista abierta', icono: 'disco' },
  ],

  // Mesa de regalos. Cuando tengas el enlace, pégalo en "enlace".
  // Si "enlace" está vacío y "pendiente" es true, se muestra "Disponible próximamente".
  regalos: [
    { nombre: 'Liverpool', detalle: 'Mesa de regalos', enlace: '', pendiente: true, icono: 'bolsa' },
    { nombre: 'Amazon', detalle: 'Lista de regalos en línea', enlace: '', pendiente: true, icono: 'regalo' },
    { nombre: 'Sobre', detalle: 'Tendremos un buzón especial el día del evento', enlace: '', pendiente: false, icono: 'sobre' },
  ],

  // Fecha límite para confirmar (formato 'AAAA-MM-DD'). Déjala en null
  // si no quieres mostrar ni aplicar una fecha límite.
  fechaLimiteConfirmacion: null,

  // Mensaje que se arma al compartir por WhatsApp desde el panel.
  // {familia}, {boletos} y {enlace} se reemplazan automáticamente.
  mensajeWhatsApp:
    '¡Hola, {familia}! Con mucha alegría queremos invitarte a nuestra boda el 17 de abril de 2027 en Texcoco. ' +
    'Tu invitación es para {boletos}. Aquí puedes verla y confirmar tu asistencia: {enlace}\n\nPamela & Luis',
};
