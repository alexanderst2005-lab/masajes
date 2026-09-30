import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Calendar, Menu, Clock, Leaf, Heart, Sparkles, X, MessageCircle } from 'lucide-react';
import './index.css';

// WhatsApp Business Number (Editable)
const WHATSAPP_NUMBER = '1234567890'; // e.g. '1234567890' (Include country code, no +, no spaces)

// Content structure to allow easy editing and bilingual support
const content = {
  en: {
    nav: { home: 'Home', services: 'Services', about: 'About', benefits: 'Benefits', contact: 'Contact', book: 'Book a Massage' },
    hero: { tag: 'Massage Therapy & Wellness', title: 'Relax. Restore. Reconnect.', desc: 'Professional massage therapy designed to help you relax, release tension, and feel your best.', bookBtn: 'Book Your Massage', exploreBtn: 'Explore Services', note: 'Your wellness starts here.' },
    services: { title: 'Our Massage Services', subtitle: 'Personalized massage experiences created to help you relax, recover, and take care of your body.', book: 'Book Now', list: [
      { id: 1, name: 'Relaxation Massage', desc: 'A calming massage focused on relaxation and stress relief.', time: '60 min', price: '$80', img: '/service1.jpg' },
      { id: 2, name: 'Deep Tissue Massage', desc: 'Focused pressure to help release muscle tension and tightness.', time: '60 min', price: '$95', img: '/service2.jpg' },
      { id: 3, name: 'Swedish Massage', desc: 'Long, flowing techniques designed to promote relaxation and improve circulation.', time: '60 min', price: '$85', img: '/service3.jpg' },
      { id: 4, name: 'Hot Stone Massage', desc: 'Warm stones combined with massage techniques for a deeply relaxing experience.', time: '75 min', price: '$110', img: '/service4.jpg' },
      { id: 5, name: 'Custom Massage', desc: "A personalized massage adapted to your body's needs.", time: '90 min', price: '$130', img: '/service5.jpg' }
    ]},
    about: { title: 'Meet Your Massage Therapist', p1: 'With a passion for wellness and helping others feel their best, I provide personalized massage experiences in a calm, comfortable, and welcoming environment.', p2: "Every session is tailored to your individual needs, whether you're looking to relax, relieve muscle tension, or simply take time for yourself.", btn: 'Learn More' },
    benefits: { title: 'Why Choose Us?', list: [
      { title: 'PERSONALIZED CARE', desc: 'Every session is tailored to your needs.', icon: 'Heart' },
      { title: 'RELAXING ENVIRONMENT', desc: 'A peaceful space designed for your comfort.', icon: 'Leaf' },
      { title: 'PROFESSIONAL SERVICE', desc: 'Quality care with attention to every detail.', icon: 'Sparkles' },
      { title: 'YOUR WELLNESS MATTERS', desc: 'Your comfort and wellbeing are always our priority.', icon: 'Heart' }
    ]},
    gallery: { title: 'A Moment Just for You', subtitle: 'Step away from the stress of everyday life and give your body and mind the time they deserve.' },
    menu: { title: 'Massage Menu', subtitle: 'Find the perfect treatment for your needs.', bookBtn: 'Book Your Session', items: [
      { name: 'Relaxation Massage', desc: 'Light to medium pressure for pure relaxation.', options: [{time: '60 min', price: '$80'}] },
      { name: 'Deep Tissue Massage', desc: 'Firm pressure to target deep muscle layers.', options: [{time: '60 min', price: '$95'}] },
      { name: 'Custom Massage', desc: 'Tailored specifically for you.', options: [{time: '90 min', price: '$130'}] }
    ]},
    testimonials: { title: 'What Our Clients Say', list: [
      { text: "Such a relaxing experience. I left feeling completely refreshed.", author: "Sarah M." },
      { text: "I loved the atmosphere and the attention to detail. I'll definitely be coming back.", author: "Jessica R." },
      { text: "Professional, relaxing, and exactly what I needed.", author: "Amanda T." }
    ]},
    booking: { title: 'Ready to Relax?', subtitle: 'Give yourself the time you deserve. Book your massage session today.', btn: 'Book an Appointment' },
    location: { title: 'Find Us', address: '123 Wellness Ave, Suite 100, City, ST 12345', phone: '(555) 123-4567', email: 'hello@serenitymassage.com' },
    finalCta: { t1: 'Your body deserves a little care.', t2: 'Take a moment for yourself.', btn: 'Book Your Massage' },
    footer: { rights: '© 2026 Serenity Massage & Wellness. All rights reserved.' },
    modal: {
      title: 'Book Your Session',
      service: 'Select Service',
      duration: 'Duration',
      date: 'Date',
      time: 'Time',
      name: 'Full Name',
      phone: 'Phone Number',
      email: 'Email',
      request: 'Special Request (Optional)',
      confirm: 'Confirm Appointment',
      durations: ['30 min', '60 min', '90 min', '120 min']
    }
  },
  es: {
    nav: { home: 'Inicio', services: 'Servicios', about: 'Sobre mí', benefits: 'Beneficios', contact: 'Contacto', book: 'Reservar un masaje' },
    hero: { tag: 'Massage Therapy & Wellness', title: 'Relájate. Recupera. Conecta contigo.', desc: 'Masajes profesionales diseñados para ayudarte a relajarte, liberar tensiones y sentirte mejor.', bookBtn: 'Reserva tu masaje', exploreBtn: 'Ver servicios', note: 'Tu bienestar comienza aquí.' },
    services: { title: 'Nuestros Servicios', subtitle: 'Experiencias de masaje personalizadas creadas para ayudarte a relajar, recuperar y cuidar tu cuerpo.', book: 'Reservar', list: [
      { id: 1, name: 'Masaje de Relajación', desc: 'Un masaje calmante enfocado en la relajación y el alivio del estrés.', time: '60 min', price: '$80', img: '/service1.jpg' },
      { id: 2, name: 'Masaje de Tejido Profundo', desc: 'Presión enfocada para ayudar a liberar la tensión muscular.', time: '60 min', price: '$95', img: '/service2.jpg' },
      { id: 3, name: 'Masaje Sueco', desc: 'Técnicas largas y fluidas diseñadas para promover la relajación y mejorar la circulación.', time: '60 min', price: '$85', img: '/service3.jpg' },
      { id: 4, name: 'Masaje con Piedras Calientes', desc: 'Piedras calientes combinadas con técnicas de masaje para una experiencia profundamente relajante.', time: '75 min', price: '$110', img: '/service4.jpg' },
      { id: 5, name: 'Masaje Personalizado', desc: 'Un masaje personalizado adaptado a las necesidades de tu cuerpo.', time: '90 min', price: '$130', img: '/service5.jpg' }
    ]},
    about: { title: 'Conoce a tu terapeuta', p1: 'Con pasión por el bienestar y por ayudar a las personas a sentirse mejor, ofrezco experiencias de masaje personalizadas en un ambiente tranquilo, cómodo y acogedor.', p2: 'Cada sesión se adapta a tus necesidades, ya sea que busques relajarte, aliviar la tensión muscular o simplemente dedicarte un momento para ti.', btn: 'Saber más' },
    benefits: { title: '¿Por qué elegirnos?', list: [
      { title: 'ATENCIÓN PERSONALIZADA', desc: 'Cada sesión se adapta a tus necesidades.', icon: 'Heart' },
      { title: 'AMBIENTE RELAJANTE', desc: 'Un espacio tranquilo pensado para tu comodidad.', icon: 'Leaf' },
      { title: 'SERVICIO PROFESIONAL', desc: 'Atención de calidad cuidando cada detalle.', icon: 'Sparkles' },
      { title: 'TU BIENESTAR ES IMPORTANTE', desc: 'Tu comodidad y bienestar son nuestra prioridad.', icon: 'Heart' }
    ]},
    gallery: { title: 'Un momento solo para ti', subtitle: 'Aléjate del estrés de la vida diaria y dale a tu cuerpo y mente el tiempo que merecen.' },
    menu: { title: 'Menú de Masajes', subtitle: 'Encuentra el tratamiento perfecto para ti.', bookBtn: 'Reservar mi sesión', items: [
      { name: 'Masaje de Relajación', desc: 'Presión de ligera a media para relajación pura.', options: [{time: '60 min', price: '$80'}] },
      { name: 'Masaje de Tejido Profundo', desc: 'Presión firme para llegar a capas musculares profundas.', options: [{time: '60 min', price: '$95'}] },
      { name: 'Masaje Personalizado', desc: 'Adaptado específicamente para tus necesidades.', options: [{time: '90 min', price: '$130'}] }
    ]},
    testimonials: { title: 'Lo que dicen nuestros clientes', list: [
      { text: "Una experiencia muy relajante. Salí sintiéndome completamente renovada.", author: "Sarah M." },
      { text: "Me encantó el ambiente y la atención al detalle. Definitivamente volveré.", author: "Jessica R." },
      { text: "Profesional, relajante y exactamente lo que necesitaba.", author: "Amanda T." }
    ]},
    booking: { title: '¿Lista para relajarte?', subtitle: 'Date el tiempo que mereces. Reserva tu sesión de masaje hoy mismo.', btn: 'Agendar una cita' },
    location: { title: 'Encuéntranos', address: '123 Wellness Ave, Suite 100, City, ST 12345', phone: '(555) 123-4567', email: 'hello@serenitymassage.com' },
    finalCta: { t1: 'Tu cuerpo merece un poco de cuidado.', t2: 'Regálate un momento para ti.', btn: 'Reservar mi masaje' },
    footer: { rights: '© 2026 Serenity Massage & Wellness. Todos los derechos reservados.' },
    modal: {
      title: 'Reserva tu sesión',
      service: 'Selecciona el Servicio',
      duration: 'Duración',
      date: 'Fecha',
      time: 'Hora',
      name: 'Nombre Completo',
      phone: 'Teléfono',
      email: 'Correo Electrónico',
      request: 'Solicitud Especial (Opcional)',
      confirm: 'Confirmar Cita',
      durations: ['30 min', '60 min', '90 min', '120 min']
    }
  }
};

const getIcon = (iconName) => {
  switch(iconName) {
    case 'Heart': return <Heart size={32} />;
    case 'Leaf': return <Leaf size={32} />;
    case 'Sparkles': return <Sparkles size={32} />;
    default: return <Heart size={32} />;
  }
};

function App() {
  const [lang, setLang] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  
  const [formData, setFormData] = useState({
    service: '',
    duration: '60 min',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: '',
    request: ''
  });

  const t = content[lang];

  // Scroll animation hook
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lang]); 

  const toggleLang = (newLang) => setLang(newLang);

  const openBooking = (e, serviceName = '') => {
    e.preventDefault();
    setFormData(prev => ({ ...prev, service: serviceName || t.services.list[0].name }));
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeBooking = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitBooking = (e) => {
    e.preventDefault();
    
    let message = "";
    if(lang === 'en') {
      message = `📅 *NEW MASSAGE APPOINTMENT*

👤 *Name:* ${formData.name}
💆 *Service:* ${formData.service}
⏱️ *Duration:* ${formData.duration}
📆 *Date:* ${formData.date}
🕐 *Time:* ${formData.time}
📞 *Phone:* ${formData.phone}
📧 *Email:* ${formData.email}
📝 *Special Request:* ${formData.request || 'None'}

"Hello! I would like to request this massage appointment. Please confirm availability."`;
    } else {
      message = `📅 *NUEVA SOLICITUD DE CITA*

👤 *Nombre:* ${formData.name}
💆 *Servicio:* ${formData.service}
⏱️ *Duración:* ${formData.duration}
📆 *Fecha:* ${formData.date}
🕐 *Hora:* ${formData.time}
📞 *Teléfono:* ${formData.phone}
📧 *Correo:* ${formData.email}
📝 *Solicitud especial:* ${formData.request || 'Ninguna'}

"Hola, quisiera solicitar esta cita para masaje. Por favor, confírmame la disponibilidad."`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    closeBooking();
  };

  return (
    <>
      {/* Header */}
      <header>
        <div className="container header-container">
          <div className="logo">Serenity</div>
          <nav className="nav-links">
            <a href="#home" className="nav-link">{t.nav.home}</a>
            <a href="#services" className="nav-link">{t.nav.services}</a>
            <a href="#about" className="nav-link">{t.nav.about}</a>
            <a href="#benefits" className="nav-link">{t.nav.benefits}</a>
            <a href="#contact" className="nav-link">{t.nav.contact}</a>
            
            <div className="lang-switch">
              <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => toggleLang('en')}>EN</button>
              |
              <button className={`lang-btn ${lang === 'es' ? 'active' : ''}`} onClick={() => toggleLang('es')}>ES</button>
            </div>
            
            <a href="#" onClick={openBooking} className="btn btn-primary">{t.nav.book}</a>
          </nav>
          
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-menu fade-in visible">
            <a href="#home" onClick={() => setMobileMenuOpen(false)}>{t.nav.home}</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)}>{t.nav.services}</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>{t.nav.about}</a>
            <a href="#benefits" onClick={() => setMobileMenuOpen(false)}>{t.nav.benefits}</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>{t.nav.contact}</a>
            
            <div className="lang-switch-mobile">
              <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => toggleLang('en')}>EN</button>
              <span style={{margin: '0 0.5rem'}}>|</span>
              <button className={`lang-btn ${lang === 'es' ? 'active' : ''}`} onClick={() => toggleLang('es')}>ES</button>
            </div>
          </div>
        )}
      </header>

      {/* Floating Action Button */}
      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="fab whatsapp-fab">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
      </a>

      {/* Hero */}
      <section id="home" className="hero fade-in">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-content">
            <span className="hero-tag">{t.hero.tag}</span>
            <h1 className="hero-title">{t.hero.title}</h1>
            <p className="hero-desc">{t.hero.desc}</p>
            <div className="hero-buttons">
              <a href="#" onClick={openBooking} className="btn btn-primary">{t.hero.bookBtn}</a>
              <a href="#services" className="btn btn-outline">{t.hero.exploreBtn}</a>
            </div>
            <p className="hero-note">{t.hero.note}</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="container fade-in">
        <h2 className="section-title">{t.services.title}</h2>
        <p className="section-subtitle">{t.services.subtitle}</p>
        
        <div className="services-grid">
          {t.services.list.map(service => (
            <div key={service.id} className="service-card fade-in">
              <img src={service.img} alt={service.name} className="service-img" />
              <div className="service-content">
                <h3 className="service-title">{service.name}</h3>
                <p className="service-desc">{service.desc}</p>
                <div className="service-footer">
                  <div className="service-meta">
                    <span className="service-time"><Clock size={14} style={{display:'inline', marginRight: '4px', verticalAlign: 'middle'}}/> {service.time}</span>
                    <span className="service-price">{service.price}</span>
                  </div>
                  <a href="#" onClick={(e) => openBooking(e, service.name)} className="btn btn-primary" style={{padding: '0.5rem 1.2rem'}}>{t.services.book}</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="about-section fade-in">
        <div className="container about-grid">
          <div className="about-img-wrapper fade-in">
            <img src="/about.jpg" alt="Massage Therapist" className="about-img" />
          </div>
          <div className="about-content fade-in">
            <h2 className="about-title">{t.about.title}</h2>
            <p className="about-text">{t.about.p1}</p>
            <p className="about-text">{t.about.p2}</p>
            <a href="#services" className="btn btn-outline" style={{marginTop: '1rem'}}>{t.about.btn}</a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="container fade-in">
        <h2 className="section-title">{t.benefits.title}</h2>
        <div className="benefits-grid" style={{marginTop: '4rem'}}>
          {t.benefits.list.map((benefit, i) => (
            <div key={i} className="benefit-item fade-in">
              <div className="benefit-icon">
                {getIcon(benefit.icon)}
              </div>
              <h3 className="benefit-title">{benefit.title}</h3>
              <p className="benefit-desc">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="container fade-in">
        <h2 className="section-title">{t.gallery.title}</h2>
        <p className="section-subtitle">{t.gallery.subtitle}</p>
        
        <div className="gallery-grid fade-in">
          <div className="gallery-item gallery-item-1">
            <img src="/service1.jpg" alt="Spa" />
          </div>
          <div className="gallery-item gallery-item-2">
            <img src="/service3.jpg" alt="Massage" />
          </div>
          <div className="gallery-item gallery-item-3">
            <img src="/service5.jpg" alt="Oils" />
          </div>
          <div className="gallery-item gallery-item-4">
            <img src="/service4.jpg" alt="Stones" />
          </div>
        </div>
      </section>

      {/* Menu / Pricing */}
      <section className="menu-section fade-in">
        <div className="container">
          <h2 className="section-title">{t.menu.title}</h2>
          <p className="section-subtitle">{t.menu.subtitle}</p>
          
          <div className="menu-list fade-in">
            {t.menu.items.map((item, i) => (
              <div key={i} className="menu-item">
                <div className="menu-item-info">
                  <h4>{item.name}</h4>
                  <p>{item.desc}</p>
                </div>
                <div className="menu-item-price">
                  <span className="time">{item.options[0].time}</span>
                  <span className="price">{item.options[0].price}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="menu-action fade-in">
            <a href="#" onClick={openBooking} className="btn btn-outline">{t.menu.bookBtn}</a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container fade-in">
        <h2 className="section-title">{t.testimonials.title}</h2>
        <div className="testimonials-grid" style={{marginTop: '4rem'}}>
          {t.testimonials.list.map((testimonial, i) => (
            <div key={i} className="testimonial-card fade-in">
              <MessageCircle className="quote-icon" size={40} />
              <p className="testimonial-text">"{testimonial.text}"</p>
              <h4 className="testimonial-author">— {testimonial.author}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Booking CTA */}
      <section className="booking-section fade-in">
        <div className="container">
          <h2 className="section-title" style={{color:'white'}}>{t.booking.title}</h2>
          <p className="section-subtitle" style={{color:'white'}}>{t.booking.subtitle}</p>
          <a href="#" onClick={openBooking} className="btn btn-accent" style={{fontSize: '1.2rem', padding: '1rem 3rem'}}>{t.booking.btn}</a>
          
          <div className="contact-options fade-in">
            <div className="contact-option"><Phone size={20}/> {t.location.phone}</div>
            <div className="contact-option"><Mail size={20}/> {t.location.email}</div>
            <div className="contact-option"><Mail size={20}/> @serenitymassage</div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="contact" className="location-section container fade-in">
        <div className="location-content">
          <h2 className="section-title">{t.location.title}</h2>
          <div className="location-details">
            <div className="location-item"><MapPin size={24} color="var(--color-primary)" /> {t.location.address}</div>
            <div className="location-item"><Phone size={24} color="var(--color-primary)" /> {t.location.phone}</div>
            <div className="location-item"><Mail size={24} color="var(--color-primary)" /> {t.location.email}</div>
          </div>
        </div>
        
        {/* Placeholder for Google Maps */}
        <div className="map-container fade-in">
          <MapPin size={48} opacity={0.2} />
          <p style={{marginLeft: '1rem'}}>Map Integration Placeholder</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta fade-in">
        <div className="final-cta-content">
          <h2>{t.finalCta.t1}</h2>
          <p>{t.finalCta.t2}</p>
          <a href="#" onClick={openBooking} className="btn btn-accent">{t.finalCta.btn}</a>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-col">
              <div className="logo" style={{color: 'white', marginBottom: '1rem'}}>Serenity</div>
              <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem'}}>Massage Therapy & Wellness</p>
            </div>
            
            <div className="footer-col">
              <h3>Links</h3>
              <ul className="footer-links">
                <li><a href="#home">{t.nav.home}</a></li>
                <li><a href="#services">{t.nav.services}</a></li>
                <li><a href="#about">{t.nav.about}</a></li>
                <li><a href="#contact">{t.nav.contact}</a></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h3>Connect</h3>
              <div className="social-links">
                <a href="#"><Mail size={20} /></a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            {t.footer.rights}
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeBooking}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeBooking}><X size={24} /></button>
            <h3 className="modal-title">{t.modal.title}</h3>
            
            <form onSubmit={submitBooking} className="booking-form">
              <div className="form-group">
                <label>{t.modal.service}</label>
                <select name="service" value={formData.service} onChange={handleFormChange} required>
                  {t.services.list.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                  {t.menu.items.map((m, i) => (
                    <option key={`m-${i}`} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t.modal.duration}</label>
                  <select name="duration" value={formData.duration} onChange={handleFormChange} required>
                    {t.modal.durations.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>{t.modal.date}</label>
                  <input type="date" name="date" value={formData.date} onChange={handleFormChange} required />
                </div>
                
                <div className="form-group">
                  <label>{t.modal.time}</label>
                  <input type="time" name="time" value={formData.time} onChange={handleFormChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>{t.modal.name}</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="John Doe" required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t.modal.phone}</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="+1 234 567 890" required />
                </div>
                
                <div className="form-group">
                  <label>{t.modal.email}</label>
                  <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="email@example.com" required />
                </div>
              </div>

              <div className="form-group">
                <label>{t.modal.request}</label>
                <textarea name="request" value={formData.request} onChange={handleFormChange} rows="3" placeholder="..."></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-100" style={{marginTop: '1rem', width: '100%'}}>
                {t.modal.confirm}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
