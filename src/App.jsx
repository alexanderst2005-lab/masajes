import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Calendar, Menu, Clock, Leaf, Heart, Sparkles, X, MessageCircle } from 'lucide-react';
import './index.css';

// Content structure to allow easy editing and bilingual support
const content = {
  en: {
    nav: { home: 'Home', services: 'Services', about: 'About', benefits: 'Benefits', contact: 'Contact', book: 'Book a Massage' },
    hero: { tag: 'Massage Therapy & Wellness', title: 'Relax. Restore. Reconnect.', desc: 'Professional massage therapy designed to help you relax, release tension, and feel your best.', bookBtn: 'Book Your Massage', exploreBtn: 'Explore Services', note: 'Your wellness starts here.' },
    services: { title: 'Our Massage Services', subtitle: 'Personalized massage experiences created to help you relax, recover, and take care of your body.', book: 'Book Now', list: [
      { id: 1, name: 'Relaxation Massage', desc: 'A calming massage focused on relaxation and stress relief.', time: '60 min', price: '$80', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80' },
      { id: 2, name: 'Deep Tissue Massage', desc: 'Focused pressure to help release muscle tension and tightness.', time: '60 min', price: '$95', img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80' },
      { id: 3, name: 'Swedish Massage', desc: 'Long, flowing techniques designed to promote relaxation and improve circulation.', time: '60 min', price: '$85', img: 'https://images.unsplash.com/photo-1600334129128-685054110de4?auto=format&fit=crop&q=80' },
      { id: 4, name: 'Hot Stone Massage', desc: 'Warm stones combined with massage techniques for a deeply relaxing experience.', time: '75 min', price: '$110', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80' },
      { id: 5, name: 'Custom Massage', desc: "A personalized massage adapted to your body's needs.", time: '90 min', price: '$130', img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80' }
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
    footer: { rights: '© 2026 Serenity Massage & Wellness. All rights reserved.' }
  },
  es: {
    nav: { home: 'Inicio', services: 'Servicios', about: 'Sobre mí', benefits: 'Beneficios', contact: 'Contacto', book: 'Reservar un masaje' },
    hero: { tag: 'Massage Therapy & Wellness', title: 'Relájate. Recupera. Conecta contigo.', desc: 'Masajes profesionales diseñados para ayudarte a relajarte, liberar tensiones y sentirte mejor.', bookBtn: 'Reserva tu masaje', exploreBtn: 'Ver servicios', note: 'Tu bienestar comienza aquí.' },
    services: { title: 'Nuestros Servicios', subtitle: 'Experiencias de masaje personalizadas creadas para ayudarte a relajar, recuperar y cuidar tu cuerpo.', book: 'Reservar', list: [
      { id: 1, name: 'Masaje de Relajación', desc: 'Un masaje calmante enfocado en la relajación y el alivio del estrés.', time: '60 min', price: '$80', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80' },
      { id: 2, name: 'Masaje de Tejido Profundo', desc: 'Presión enfocada para ayudar a liberar la tensión muscular.', time: '60 min', price: '$95', img: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80' },
      { id: 3, name: 'Masaje Sueco', desc: 'Técnicas largas y fluidas diseñadas para promover la relajación y mejorar la circulación.', time: '60 min', price: '$85', img: 'https://images.unsplash.com/photo-1600334129128-685054110de4?auto=format&fit=crop&q=80' },
      { id: 4, name: 'Masaje con Piedras Calientes', desc: 'Piedras calientes combinadas con técnicas de masaje para una experiencia profundamente relajante.', time: '75 min', price: '$110', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80' },
      { id: 5, name: 'Masaje Personalizado', desc: 'Un masaje personalizado adaptado a las necesidades de tu cuerpo.', time: '90 min', price: '$130', img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80' }
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
    footer: { rights: '© 2026 Serenity Massage & Wellness. Todos los derechos reservados.' }
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
  }, [lang]); // Re-run when language changes as DOM might update

  const toggleLang = (newLang) => setLang(newLang);

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
            
            <a href="#booking" className="btn btn-primary">{t.nav.book}</a>
          </nav>
          
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Floating Action Button */}
      <a href="#booking" className="fab">
        <Calendar size={20} />
        {t.services.book}
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
              <a href="#booking" className="btn btn-primary">{t.hero.bookBtn}</a>
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
                  <a href="#booking" className="btn btn-primary" style={{padding: '0.5rem 1.2rem'}}>{t.services.book}</a>
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
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80" alt="Massage Therapist" className="about-img" />
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
            <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80" alt="Spa" />
          </div>
          <div className="gallery-item gallery-item-2">
            <img src="https://images.unsplash.com/photo-1600334129128-685054110de4?auto=format&fit=crop&q=80" alt="Massage" />
          </div>
          <div className="gallery-item gallery-item-3">
            <img src="https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&q=80" alt="Oils" />
          </div>
          <div className="gallery-item gallery-item-4">
            <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80" alt="Stones" />
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
            <a href="#booking" className="btn btn-outline">{t.menu.bookBtn}</a>
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
      <section id="booking" className="booking-section fade-in">
        <div className="container">
          <h2 className="section-title">{t.booking.title}</h2>
          <p className="section-subtitle">{t.booking.subtitle}</p>
          <a href="#" className="btn btn-accent" style={{fontSize: '1.2rem', padding: '1rem 3rem'}}>{t.booking.btn}</a>
          
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
          <a href="#booking" className="btn btn-accent">{t.finalCta.btn}</a>
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
    </>
  );
}

export default App;
