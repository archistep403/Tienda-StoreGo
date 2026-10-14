import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { isAllowedEmail } from '../lib/validators';
import { enviarContacto } from '../lib/email';

export default function Contacto() {
  const { showToast } = useStore();
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (enviando) return;
    const datos = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      mensaje: form.mensaje.trim()
    };
    if (!isAllowedEmail(datos.email)) {
      showToast('Usa un correo @gmail.com, @duoc.cl o @profesor.duoc.cl');
      return;
    }
    setEnviando(true);
    try {
      await enviarContacto(datos);
      showToast('Mensaje enviado, te responderemos pronto.');
      setForm({ nombre: '', email: '', mensaje: '' });
    } catch (err) {
      showToast(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="container hero-inner">
          <span className="eyebrow">CONTACTO</span>
          <h1>¿Tienes una <span className="grad-text">pregunta</span>?</h1>
          <p className="hero-copy">Escríbenos y te respondemos a la brevedad.</p>
        </div>
      </section>
      <section className="products">
        <div className="container">
          <form className="contact-form" onSubmit={handleSubmit}>
            <input type="text" name="nombre" maxLength={50} placeholder="Nombre" required value={form.nombre} onChange={set} />
            <input type="email" name="email" placeholder="Correo" required value={form.email} onChange={set} />
            <textarea name="mensaje" placeholder="Mensaje" rows="5" maxLength={2000} required value={form.mensaje} onChange={set} />
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar mensaje'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
