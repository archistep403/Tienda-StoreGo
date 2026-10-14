// Envío de correos con EmailJS (https://www.emailjs.com) usando su API REST, sin dependencias extra.
// Las claves van en .env (VITE_EMAILJS_*). El destinatario (archistep403@gmail.com)
// se configura en la plantilla de EmailJS, campo "To Email".
const ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const EMAIL_DESTINO = 'archistep403@gmail.com';

export function emailConfigurado() {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

async function enviar(params) {
  if (!emailConfigurado()) {
    throw new Error('Falta configurar EmailJS en el archivo .env (ver README).');
  }
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: { to_email: EMAIL_DESTINO, ...params }
      })
    });
  } catch {
    throw new Error('No se pudo conectar. Revisa tu internet e inténtalo de nuevo.');
  }
  if (!res.ok) {
    const detalle = await res.text().catch(() => '');
    console.error('[EmailJS]', res.status, detalle);
    throw new Error('No se pudo enviar el correo. Inténtalo más tarde.');
  }
}

export function enviarContacto({ nombre, email, mensaje }) {
  return enviar({
    asunto: `Nuevo mensaje de contacto de ${nombre}`,
    tipo: 'Contacto',
    nombre,
    email,
    reply_to: email,
    mensaje
  });
}

export function enviarSuscripcion(email) {
  return enviar({
    asunto: 'Nueva suscripción al boletín de StoreGo',
    tipo: 'Suscripción',
    nombre: 'Suscriptor',
    email,
    reply_to: email,
    mensaje: `El correo ${email} se suscribió para recibir ofertas.`
  });
}
