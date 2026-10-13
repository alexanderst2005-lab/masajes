import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  LogOut,
  Image as ImageIcon,
  Video as VideoIcon,
  MessageSquare,
  Calendar,
  LayoutDashboard,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Plus,
  CheckCircle,
  AlertCircle,
  X,
  Upload,
  RefreshCw,
  Star,
  User,
  ShieldCheck,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { getVideoPoster } from './WorkGallerySection.jsx';

export default function AdminPanel({ isOpen, onClose, onServicesUpdated, isStandalone = false }) {
  const [token, setToken] = useState(() => localStorage.getItem('sxm_admin_token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(() => !!localStorage.getItem('sxm_admin_token'));

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Active admin tab
  const [activeTab, setActiveTab] = useState('overview'); // overview | services | gallery | reviews | bookings

  // Data states
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Gallery form state (new or edit)
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [galleryMediaType, setGalleryMediaType] = useState('image');
  const [galleryUrl, setGalleryUrl] = useState('');
  const [galleryFile, setGalleryFile] = useState(null);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryDesc, setGalleryDesc] = useState('');
  const [filePreview, setFilePreview] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  // Services form state (single English input + auto Spanish translation)
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceImageUrl, setServiceImageUrl] = useState('');
  const [serviceFile, setServiceFile] = useState(null);
  const [serviceFilePreview, setServiceFilePreview] = useState('');
  const [serviceUploadingFile, setServiceUploadingFile] = useState(false);
  const [serviceOptions, setServiceOptions] = useState([
    { time: '60 Minutes', price: '$90 USD' },
    { time: '90 Minutes', price: '$130 USD' }
  ]);

  // Check existing session token on mount
  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const res = await fetch('/api/auth', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        } else {
          localStorage.removeItem('sxm_admin_token');
          setToken('');
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Session verify failed:', err);
      } finally {
        setCheckingAuth(false);
      }
    };

    verify();
  }, [token]);

  // Load all admin data when authenticated
  const loadAdminData = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [servicesRes, reviewsRes, galleryRes, bookingsRes] = await Promise.all([
        fetch('/api/services', { headers }),
        fetch('/api/reviews', { headers }),
        fetch('/api/gallery', { headers }),
        fetch('/api/bookings', { headers })
      ]);

      if (servicesRes.ok) {
        const sData = await servicesRes.json();
        setServices(Array.isArray(sData) ? sData : []);
      }
      if (reviewsRes.ok) {
        const rData = await reviewsRes.json();
        setReviews(Array.isArray(rData) ? rData : []);
      }
      if (galleryRes.ok) {
        const gData = await galleryRes.json();
        setGallery(Array.isArray(gData) ? gData : []);
      }
      if (bookingsRes.ok) {
        const bData = await bookingsRes.json();
        setBookings(Array.isArray(bData) ? bData : []);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && currentUser) {
      Promise.resolve().then(loadAdminData);
    }
  }, [token, currentUser, loadAdminData]);

  const showNotification = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 5000);
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }

      localStorage.setItem('sxm_admin_token', data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setUsername('');
      setPassword('');
      showNotification('success', 'Sesión iniciada correctamente');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('sxm_admin_token');
    setToken('');
    setCurrentUser(null);
    showNotification('success', 'Sesión cerrada');
  };

  // Review Actions
  const handleToggleReviewVisibility = async (id, currentVisibility) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id, is_visible: !currentVisibility })
      });

      if (!res.ok) throw new Error('Error al actualizar visibilidad');

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_visible: !currentVisibility } : r))
      );
      showNotification(
        'success',
        !currentVisibility ? 'Reseña visible públicamente' : 'Reseña ocultada'
      );
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('¿Estás segura de eliminar permanentemente esta reseña?')) return;

    try {
      const res = await fetch(`/api/reviews?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al eliminar reseña');

      setReviews((prev) => prev.filter((r) => r.id !== id));
      showNotification('success', 'Reseña eliminada permanentemente');
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // Gallery Actions
  const handleOpenFilePicker = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGalleryFile(file);
    if (file.type.startsWith('video/')) {
      setGalleryMediaType('video');
    } else {
      setGalleryMediaType('image');
    }

    const preview = URL.createObjectURL(file);
    setFilePreview(preview);
    setGalleryUrl('');
  };

  const handleOpenGalleryModal = (itemToEdit = null) => {
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setGalleryMediaType(itemToEdit.media_type || 'image');
      setGalleryUrl(itemToEdit.url || '');
      setGalleryFile(null);
      setGalleryTitle(itemToEdit.title || '');
      setGalleryDesc(itemToEdit.description || '');
      setFilePreview(itemToEdit.url || '');
    } else {
      setEditingItem(null);
      setGalleryMediaType('image');
      setGalleryUrl('');
      setGalleryFile(null);
      setGalleryTitle('');
      setGalleryDesc('');
      setFilePreview('');
    }
    setIsGalleryModalOpen(true);
  };

  const handleSaveGalleryItem = async (e) => {
    e.preventDefault();
    if (!galleryFile && !galleryUrl.trim()) {
      showNotification('error', 'Por favor selecciona un video/foto o ingresa un enlace.');
      return;
    }

    setUploadingFile(true);
    try {
      let finalUrl = galleryUrl;

      // Subida directa desde el navegador a Cloudinary (sin límite de 4.5MB de Vercel)
      if (galleryFile) {
        // 1. Obtener firma autorizada de la API
        const sigRes = await fetch(`/api/upload?type=${galleryMediaType}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sig = await sigRes.json();
        if (!sigRes.ok) throw new Error(sig.error || 'Error autorizando subida a Cloudinary');

        // 2. Subir directamente el archivo a Cloudinary
        const formData = new FormData();
        formData.append('file', galleryFile);
        formData.append('timestamp', sig.timestamp);
        formData.append('api_key', sig.apiKey);
        formData.append('signature', sig.signature);
        formData.append('folder', sig.folder);

        const cRes = await fetch(sig.uploadUrl, {
          method: 'POST',
          body: formData
        });

        const cData = await cRes.json();
        if (!cRes.ok || !cData.secure_url) {
          throw new Error(cData.error?.message || 'Error al subir el video a Cloudinary');
        }
        finalUrl = cData.secure_url;
      }

      const autoThumbnail = galleryMediaType === 'video' ? getVideoPoster(finalUrl) : null;
      const payload = {
        title: galleryTitle.trim(),
        description: galleryDesc.trim(),
        media_type: galleryMediaType,
        url: finalUrl,
        thumbnail_url: autoThumbnail || null
      };

      let res;
      if (editingItem) {
        res = await fetch('/api/gallery', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ id: editingItem.id, ...payload })
        });
      } else {
        res = await fetch('/api/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar elemento');

      if (editingItem) {
        setGallery((prev) => prev.map((g) => (g.id === editingItem.id ? data.item : g)));
        showNotification('success', 'Publicación actualizada correctamente');
      } else {
        setGallery((prev) => [data.item, ...prev]);
        showNotification('success', 'Video/foto publicado en la galería con éxito');
      }

      setIsGalleryModalOpen(false);
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    if (!window.confirm('¿Segura que deseas eliminar este contenido de la galería?')) return;

    try {
      const res = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al eliminar');

      setGallery((prev) => prev.filter((g) => g.id !== id));
      showNotification('success', 'Elemento eliminado de la galería');
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // Booking Delete
  const handleDeleteBooking = async (id) => {
    if (!window.confirm('¿Eliminar registro de esta reserva?')) return;
    try {
      const res = await fetch(`/api/bookings?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        showNotification('success', 'Reserva eliminada del historial');
      }
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // Service Handlers
  const handleOpenServiceModal = (serviceToEdit = null) => {
    if (serviceToEdit) {
      setEditingService(serviceToEdit);
      setServiceName(serviceToEdit.name_en || serviceToEdit.name_es || '');
      setServiceDesc(serviceToEdit.desc_en || serviceToEdit.desc_es || '');
      setServiceImageUrl(serviceToEdit.image_url || '');
      setServiceFilePreview(serviceToEdit.image_url || '');
      setServiceFile(null);
      setServiceOptions(
        Array.isArray(serviceToEdit.options) && serviceToEdit.options.length > 0
          ? serviceToEdit.options
          : [{ time: '60 Minutes', price: '$90 USD' }]
      );
    } else {
      setEditingService(null);
      setServiceName('');
      setServiceDesc('');
      setServiceImageUrl('');
      setServiceFilePreview('');
      setServiceFile(null);
      setServiceOptions([
        { time: '60 Minutes', price: '$90 USD' },
        { time: '90 Minutes', price: '$130 USD' }
      ]);
    }
    setIsServiceModalOpen(true);
  };

  const handleRemoveServiceImage = () => {
    setServiceFile(null);
    setServiceImageUrl('');
    setServiceFilePreview('');
  };

  const handleServiceFilePicker = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setServiceFile(file);
    const preview = URL.createObjectURL(file);
    setServiceFilePreview(preview);
    setServiceImageUrl('');
  };

  const handleOptionChange = (index, field, value) => {
    setServiceOptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddOption = () => {
    setServiceOptions((prev) => [...prev, { time: '', price: '' }]);
  };

  const handleRemoveOption = (index) => {
    setServiceOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      showNotification('error', 'Por favor ingresa el nombre del servicio.');
      return;
    }

    setServiceUploadingFile(true);
    try {
      let finalImgUrl = serviceImageUrl;

      if (serviceFile) {
        try {
          const sigRes = await fetch('/api/upload?type=image', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const sig = await sigRes.json();
          if (sigRes.ok && sig.uploadUrl) {
            const formData = new FormData();
            formData.append('file', serviceFile);
            formData.append('timestamp', sig.timestamp);
            formData.append('api_key', sig.apiKey);
            formData.append('signature', sig.signature);
            formData.append('folder', sig.folder);

            const cRes = await fetch(sig.uploadUrl, {
              method: 'POST',
              body: formData
            });
            const cData = await cRes.json();
            if (cData.secure_url) finalImgUrl = cData.secure_url;
          }
        } catch (err) {
          console.error('Service image upload error:', err);
        }
      }

      const payload = {
        name: serviceName.trim(),
        desc: serviceDesc.trim(),
        image_url: finalImgUrl || null,
        options: serviceOptions.filter((o) => o.time.trim() || o.price.trim())
      };

      let res;
      if (editingService) {
        res = await fetch('/api/services', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ ...payload, id: editingService.id })
        });
      } else {
        res = await fetch('/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar servicio');

      if (editingService) {
        setServices((prev) => prev.map((s) => (s.id === editingService.id ? data.item : s)));
        showNotification('success', 'Servicio actualizado correctamente');
      } else {
        setServices((prev) => [...prev, data.item]);
        showNotification('success', 'Nuevo servicio creado con éxito');
      }

      if (onServicesUpdated) onServicesUpdated();
      setIsServiceModalOpen(false);
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setServiceUploadingFile(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('¿Segura que deseas eliminar este servicio del menú?')) return;
    try {
      const res = await fetch(`/api/services?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al eliminar servicio');

      setServices((prev) => prev.filter((s) => s.id !== id));
      showNotification('success', 'Servicio eliminado');
      if (onServicesUpdated) onServicesUpdated();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleResetDefaultServices = async () => {
    if (!window.confirm('¿Deseas restaurar/cargar los 6 servicios originales en la base de datos?')) return;
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'seed_defaults' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar servicios');
      if (Array.isArray(data.items)) {
        setServices(data.items);
      } else {
        await loadAdminData();
      }
      showNotification('success', 'Los 6 servicios originales se han cargado correctamente.');
      if (onServicesUpdated) onServicesUpdated();
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  if (!isOpen && !isStandalone) return null;

  return (
    <div className={isStandalone ? "admin-standalone-wrapper" : "admin-portal-overlay"}>
      <div className={isStandalone ? "admin-standalone-container" : "admin-portal-container"}>
        {/* Header */}
        <div className="admin-portal-header">
          <div className="admin-brand">
            <div className="admin-logo-circle">
              <Lock size={18} color="white" />
            </div>
            <div>
              <h3>The Art of Relaxation Sxm</h3>
              <span>Panel de Administración</span>
            </div>
          </div>
          <div className="admin-header-actions">
            <button
              type="button"
              className="admin-back-btn"
              onClick={onClose}
              title="Volver a la página web"
            >
              <ArrowLeft size={18} />
              <span className="admin-back-btn-text">Volver a la web</span>
            </button>
            {currentUser && (
              <button
                type="button"
                className="admin-logout-btn"
                onClick={handleLogout}
                title="Cerrar sesión"
              >
                <LogOut size={18} />
                <span className="hide-on-mobile">Cerrar sesión</span>
              </button>
            )}
            {!isStandalone && (
              <button
                type="button"
                className="admin-close-btn"
                onClick={onClose}
                aria-label="Cerrar panel"
              >
                <X size={22} />
              </button>
            )}
          </div>
        </div>

        {/* Status notification toast */}
        {statusMessage.text && (
          <div className={`admin-toast admin-toast-${statusMessage.type}`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Main Body */}
        {checkingAuth ? (
          <div className="admin-auth-loading">
            <div className="spinner"></div>
            <p>Verificando credenciales...</p>
          </div>
        ) : !currentUser ? (
          /* LOGIN SCREEN */
          <div className="admin-login-wrapper">
            <div className="admin-login-split">
              <aside className="admin-login-brand">
                <div className="admin-login-brand-glow"></div>
                <div className="admin-login-brand-inner">
                  <div className="admin-login-brand-icon">
                    <Sparkles size={26} />
                  </div>
                  <h2>The Art of Relaxation</h2>
                  <span className="admin-login-brand-tag">Sint Maarten</span>
                  <p>Gestiona tu galería, reseñas y reservas desde un solo lugar.</p>
                  <ul>
                    <li><ShieldCheck size={16} /> Acceso privado y seguro</li>
                    <li><ImageIcon size={16} /> Galería de trabajos</li>
                    <li><Calendar size={16} /> Reservas de clientes</li>
                  </ul>
                </div>
              </aside>

              <div className="admin-login-card">
                <div className="admin-login-header">
                  <div className="admin-key-icon">
                    <Lock size={26} color="var(--color-primary-dark)" />
                  </div>
                  <h2>Bienvenida</h2>
                  <p>Ingresa tus credenciales para administrar la página.</p>
                </div>

                {loginError && (
                  <div className="admin-alert admin-alert-error">
                    <AlertCircle size={18} />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="admin-login-form">
                  <div className="admin-field">
                    <label htmlFor="admin-username">Correo o Usuario</label>
                    <div className="admin-input-wrap">
                      <User size={18} className="admin-input-icon" />
                      <input
                        id="admin-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="theartofrelaxation.sxm@gmail.com"
                        autoComplete="username"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="admin-field">
                    <label htmlFor="admin-password">Contraseña</label>
                    <div className="admin-input-wrap">
                      <Lock size={18} className="admin-input-icon" />
                      <input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="admin-input-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="admin-login-submit"
                  >
                    {loginLoading ? 'Iniciando sesión...' : 'Entrar al panel'}
                  </button>
                </form>

                <div className="admin-login-back-container">
                  <button
                    type="button"
                    onClick={onClose}
                    className="admin-login-back-btn"
                  >
                    <ArrowLeft size={16} />
                    <span>Volver al sitio web principal</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="admin-body">
            {/* Navigation Tabs */}
            <div className="admin-tabs">
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <LayoutDashboard size={18} />
                <span>Resumen</span>
              </button>

              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                <Sparkles size={18} />
                <span>Servicios ({services.length})</span>
              </button>

              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                <ImageIcon size={18} />
                <span>Galería ({gallery.length})</span>
              </button>

              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <MessageSquare size={18} />
                <span>Reseñas ({reviews.length})</span>
              </button>

              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                <Calendar size={18} />
                <span>Reservas ({bookings.length})</span>
              </button>

              <button
                type="button"
                className="admin-refresh-btn"
                onClick={loadAdminData}
                title="Actualizar datos"
              >
                <RefreshCw size={16} className={loadingData ? 'spinning' : ''} />
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="admin-content-area">
              {/* TAB 1: RESUMEN / OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="admin-overview">
                  <div className="admin-stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon-wrapper" style={{ background: '#F0F4EE' }}>
                        <Sparkles size={26} color="var(--color-primary-dark)" />
                      </div>
                      <div className="stat-info">
                        <h3>{services.length}</h3>
                        <p>Servicios Creados</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon-wrapper" style={{ background: '#EBF3E8' }}>
                        <MessageSquare size={26} color="var(--color-primary)" />
                      </div>
                      <div className="stat-info">
                        <h3>{reviews.length}</h3>
                        <p>Total Reseñas</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon-wrapper" style={{ background: '#E6F4EA' }}>
                        <Eye size={26} color="#1E8E3E" />
                      </div>
                      <div className="stat-info">
                        <h3>{reviews.filter((r) => r.is_visible).length}</h3>
                        <p>Reseñas Visibles</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon-wrapper" style={{ background: '#FEF7E0' }}>
                        <EyeOff size={26} color="#B06000" />
                      </div>
                      <div className="stat-info">
                        <h3>{reviews.filter((r) => !r.is_visible).length}</h3>
                        <p>Reseñas Ocultas</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon-wrapper" style={{ background: '#F5EFE6' }}>
                        <ImageIcon size={26} color="var(--color-accent)" />
                      </div>
                      <div className="stat-info">
                        <h3>{gallery.length}</h3>
                        <p>Fotos y Videos</p>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon-wrapper" style={{ background: '#E8F0FE' }}>
                        <Calendar size={26} color="#1A73E8" />
                      </div>
                      <div className="stat-info">
                        <h3>{bookings.length}</h3>
                        <p>Reservas Recibidas</p>
                      </div>
                    </div>
                  </div>

                  <div className="admin-quick-actions">
                    <h4>Acciones Rápidas</h4>
                    <div className="quick-buttons">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          setActiveTab('services');
                          handleOpenServiceModal();
                        }}
                      >
                        <Plus size={18} />
                        <span>Agregar Nuevo Servicio</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          setActiveTab('gallery');
                          handleOpenGalleryModal();
                        }}
                      >
                        <Plus size={18} />
                        <span>Subir Foto o Video</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setActiveTab('reviews')}
                      >
                        <MessageSquare size={18} />
                        <span>Gestionar Reseñas</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB SERVICIOS */}
              {activeTab === 'services' && (
                <div className="admin-services-section">
                  <div className="admin-section-header">
                    <div>
                      <h3>Gestión de Servicios de Masajes</h3>
                      <p>Agrega, edita o elimina tarjetas de servicios que se muestran en la página web.</p>
                    </div>
                    <div className="admin-header-buttons" style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleOpenServiceModal()}
                      >
                        <Plus size={18} />
                        <span>Nuevo Servicio</span>
                      </button>
                    </div>
                  </div>

                  {services.length === 0 ? (
                    <div className="admin-empty">
                      <Sparkles size={44} opacity={0.5} />
                      <p>Aún no hay servicios en la base de datos.</p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ marginTop: '1rem' }}
                        onClick={() => handleOpenServiceModal()}
                      >
                        <Plus size={16} />
                        <span>Crear nuevo servicio</span>
                      </button>
                    </div>
                  ) : (
                    <div className="admin-gallery-grid">
                      {services.map((srv) => (
                        <div key={srv.id} className="admin-gallery-card">
                          <div className="admin-media-thumb" style={!srv.image_url ? { background: '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}}>
                            {srv.image_url ? (
                              <img src={srv.image_url} alt={srv.name_en || srv.name_es} />
                            ) : (
                              <div style={{ textAlign: 'center', color: 'var(--color-primary-dark)', padding: '1rem' }}>
                                <Sparkles size={26} style={{ margin: '0 auto 0.2rem', display: 'block', opacity: 0.6 }} />
                                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Sin foto</span>
                              </div>
                            )}
                            <span className="admin-type-tag">Servicio</span>
                          </div>
                          <div className="admin-gallery-meta">
                            <h4>{srv.name_en || srv.name_es}</h4>
                            {srv.name_es && srv.name_es !== srv.name_en && (
                              <span style={{ fontSize: '0.78rem', color: 'var(--color-primary-dark)', marginBottom: '0.3rem', display: 'block' }}>
                                ES: {srv.name_es}
                              </span>
                            )}
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '0.6rem' }}>
                              {srv.desc_en || srv.desc_es || 'Sin descripción'}
                            </p>
                            
                            {Array.isArray(srv.options) && srv.options.length > 0 && (
                              <div style={{ background: '#FAF9F7', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.8rem', fontSize: '0.8rem' }}>
                                {srv.options.map((opt, idx) => (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.15rem 0' }}>
                                    <span>{opt.time}</span>
                                    <strong style={{ color: 'var(--color-accent)' }}>{opt.price}</strong>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="admin-card-actions">
                              <button
                                type="button"
                                className="action-btn edit-btn"
                                onClick={() => handleOpenServiceModal(srv)}
                                title="Editar servicio"
                              >
                                <Edit2 size={16} />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteService(srv.id)}
                                title="Eliminar servicio"
                              >
                                <Trash2 size={16} />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: GALERÍA */}
              {activeTab === 'gallery' && (
                <div className="admin-gallery-section">
                  <div className="admin-section-header">
                    <div>
                      <h3>Gestión de la Galería "Nuestro Trabajo"</h3>
                      <p>Sube fotografías o videos de tus masajes, clientes, villas y yates.</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleOpenGalleryModal()}
                    >
                      <Plus size={18} />
                      <span>Nueva Publicación</span>
                    </button>
                  </div>

                  {gallery.length === 0 ? (
                    <div className="admin-empty">
                      <ImageIcon size={44} opacity={0.5} />
                      <p>Aún no hay publicaciones en la galería.</p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ marginTop: '1rem' }}
                        onClick={() => handleOpenGalleryModal()}
                      >
                        Subir la primera foto o video
                      </button>
                    </div>
                  ) : (
                    <div className="admin-gallery-grid">
                      {gallery.map((item) => (
                        <div key={item.id} className="admin-gallery-card">
                          <div className="admin-media-thumb">
                            {item.media_type === 'video' ? (
                              <img
                                src={getVideoPoster(item.url, item.thumbnail_url) || item.url}
                                alt={item.title || 'Video'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <img src={item.url} alt={item.title || 'Foto'} />
                            )}
                            <span className="admin-type-tag">
                              {item.media_type === 'video' ? 'Video' : 'Foto'}
                            </span>
                          </div>
                          <div className="admin-gallery-meta">
                            <h4>{item.title || 'Sin título'}</h4>
                            {item.description && <p>{item.description}</p>}
                            <div className="admin-card-actions">
                              <button
                                type="button"
                                className="action-btn edit-btn"
                                onClick={() => handleOpenGalleryModal(item)}
                                title="Editar título y descripción"
                              >
                                <Edit2 size={16} />
                                <span>Editar</span>
                              </button>
                              <button
                                type="button"
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteGalleryItem(item.id)}
                                title="Eliminar definitivamente"
                              >
                                <Trash2 size={16} />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RESEÑAS */}
              {activeTab === 'reviews' && (
                <div className="admin-reviews-section">
                  <div className="admin-section-header">
                    <div>
                      <h3>Gestión de Reseñas de Clientes</h3>
                      <p>
                        Las reseñas se publican automáticamente. Aquí puedes ocultarlas temporalmente
                        o eliminarlas.
                      </p>
                    </div>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="admin-empty">
                      <MessageSquare size={44} opacity={0.5} />
                      <p>No hay reseñas registradas todavía.</p>
                    </div>
                  ) : (
                    <div className="admin-reviews-table">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className={`admin-review-row ${!rev.is_visible ? 'is-hidden-row' : ''}`}
                        >
                          <div className="review-main-info">
                            <div className="review-top-meta">
                              <span className="reviewer-name-badge">{rev.name}</span>
                              <div className="review-stars-mini">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={15}
                                    fill={s <= rev.rating ? '#C4A77D' : 'none'}
                                    color="#C4A77D"
                                  />
                                ))}
                              </div>
                              <span
                                className={`review-status-pill ${
                                  rev.is_visible ? 'status-visible' : 'status-hidden'
                                }`}
                              >
                                {rev.is_visible ? 'Pública' : 'Oculta'}
                              </span>
                              <span className="review-date-mini">
                                {rev.created_at
                                  ? new Date(rev.created_at).toLocaleDateString()
                                  : ''}
                              </span>
                            </div>
                            <p className="review-comment-text">"{rev.comment}"</p>
                          </div>

                          <div className="review-row-actions">
                            <button
                              type="button"
                              className={`action-btn ${
                                rev.is_visible ? 'hide-btn' : 'show-btn'
                              }`}
                              onClick={() =>
                                handleToggleReviewVisibility(rev.id, rev.is_visible)
                              }
                            >
                              {rev.is_visible ? (
                                <>
                                  <EyeOff size={16} />
                                  <span>Ocultar</span>
                                </>
                              ) : (
                                <>
                                  <Eye size={16} />
                                  <span>Mostrar</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteReview(rev.id)}
                            >
                              <Trash2 size={16} />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: RESERVAS */}
              {activeTab === 'bookings' && (
                <div className="admin-bookings-section">
                  <div className="admin-section-header">
                    <div>
                      <h3>Historial de Solicitudes de Cita</h3>
                      <p>Registros de clientes que iniciaron reserva a través del sitio web.</p>
                    </div>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="admin-empty">
                      <Calendar size={44} opacity={0.5} />
                      <p>No hay solicitudes de reserva registradas todavía.</p>
                    </div>
                  ) : (
                    <div className="admin-bookings-grid">
                      {bookings.map((b) => (
                        <div key={b.id} className="admin-booking-card">
                          <div className="booking-card-head">
                            <h4>{b.name}</h4>
                            <span className="booking-date-badge">
                              {b.date} {b.time}
                            </span>
                          </div>
                          <div className="booking-details">
                            <p>
                              <strong>Servicio:</strong> {b.service} ({b.duration})
                            </p>
                            <p>
                              <strong>Teléfono:</strong> {b.phone || 'No especificado'}
                            </p>
                            <p>
                              <strong>Email:</strong> {b.email || 'No especificado'}
                            </p>
                            {b.request && (
                              <p>
                                <strong>Nota especial:</strong> {b.request}
                              </p>
                            )}
                          </div>
                          <div className="booking-card-footer">
                            <a
                              href={`https://wa.me/${(b.phone || '').replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            >
                              Contactar WhatsApp
                            </a>
                            <button
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteBooking(b.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: SUBIR / EDITAR FOTO O VIDEO DE GALERIA */}
        {isGalleryModalOpen && (
          <div className="admin-submodal-backdrop" onClick={() => setIsGalleryModalOpen(false)}>
            <div className="admin-submodal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-submodal-header">
                <h3>{editingItem ? 'Editar Publicación' : 'Subir Nueva Foto o Video'}</h3>
                <button
                  type="button"
                  className="admin-close-btn"
                  onClick={() => setIsGalleryModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveGalleryItem} className="admin-gallery-form">
                <div className="form-group">
                  <label>Tipo de Contenido</label>
                  <div className="media-type-selector">
                    <button
                      type="button"
                      className={`type-choice-btn ${galleryMediaType === 'image' ? 'active' : ''}`}
                      onClick={() => setGalleryMediaType('image')}
                    >
                      <ImageIcon size={18} />
                      <span>Fotografía</span>
                    </button>
                    <button
                      type="button"
                      className={`type-choice-btn ${galleryMediaType === 'video' ? 'active' : ''}`}
                      onClick={() => setGalleryMediaType('video')}
                    >
                      <VideoIcon size={18} />
                      <span>Video</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Seleccionar archivo de tu dispositivo</label>
                  <label className="file-drop-zone">
                    <Upload size={24} color="var(--color-primary)" />
                    <span>Toca para elegir foto o video desde tu celular o computador</span>
                    <input
                      type="file"
                      accept={galleryMediaType === 'video' ? 'video/*' : 'image/*'}
                      onChange={handleOpenFilePicker}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label>O ingresar enlace directo (URL)</label>
                  <input
                    type="url"
                    value={galleryUrl}
                    onChange={(e) => {
                      setGalleryUrl(e.target.value);
                      setFilePreview(e.target.value);
                    }}
                    placeholder="https://ejemplo.com/foto.jpg o enlace al video"
                  />
                </div>

                {/* Vista previa antes de publicar */}
                {filePreview && (
                  <div className="form-group">
                    <label>Vista previa antes de publicar</label>
                    <div className="upload-preview-box">
                      {galleryMediaType === 'video' ? (
                        <video src={filePreview} controls playsInline />
                      ) : (
                        <img src={filePreview} alt="Previsualización" />
                      )}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Título (Opcional)</label>
                  <input
                    type="text"
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                    placeholder="Ej. Sesión relajante en Villa Terres Basses"
                  />
                </div>

                <div className="form-group">
                  <label>Descripción breve (Opcional)</label>
                  <textarea
                    value={galleryDesc}
                    onChange={(e) => setGalleryDesc(e.target.value)}
                    placeholder="Ej. Masaje al atardecer frente al mar Caribe..."
                    rows="2"
                  />
                </div>

                <div className="admin-form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsGalleryModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingFile}
                    className="btn btn-primary"
                  >
                    {uploadingFile ? (galleryMediaType === 'video' ? 'Subiendo video a Cloudinary (un momento)...' : 'Subiendo...') : editingItem ? 'Actualizar' : 'Publicar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* MODAL: CREAR / EDITAR SERVICIO DE MASAJE */}
        {isServiceModalOpen && (
          <div className="admin-submodal-backdrop" onClick={() => setIsServiceModalOpen(false)}>
            <div className="admin-submodal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-submodal-header">
                <h3>{editingService ? 'Editar Servicio' : 'Nuevo Servicio de Masaje'}</h3>
                <button
                  type="button"
                  className="admin-close-btn"
                  onClick={() => setIsServiceModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="admin-gallery-form">
                <div className="form-group">
                  <label style={{ fontWeight: 600 }}>Nombre del Servicio (en Inglés) *</label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="Ej. Deep Tissue Massage"
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 600 }}>Descripción del Servicio</label>
                  <textarea
                    value={serviceDesc}
                    onChange={(e) => setServiceDesc(e.target.value)}
                    placeholder="Ej. Focused pressure to help release muscle tension and tightness..."
                    rows="2"
                  />
                  <small style={{ color: 'var(--color-primary-dark)', display: 'block', marginTop: '0.35rem', fontSize: '0.8rem' }}>
                    ✨ Escríbelo en inglés. La página web lo traducirá automáticamente al español cuando el visitante cambie de idioma.
                  </small>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    Foto del Servicio (Opcional)
                  </label>

                  {serviceFilePreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <div className="upload-preview-box" style={{ maxWidth: '240px', maxHeight: '160px', overflow: 'hidden', borderRadius: '10px' }}>
                        <img src={serviceFilePreview} alt="Previsualización servicio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <label className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Upload size={15} />
                          <span>Cambiar foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleServiceFilePicker}
                            style={{ display: 'none' }}
                          />
                        </label>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#c0392b', borderColor: '#e74c3c', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                          onClick={handleRemoveServiceImage}
                        >
                          <Trash2 size={15} />
                          <span>Eliminar imagen</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="file-drop-zone" style={{ padding: '1.2rem' }}>
                        <Upload size={24} color="var(--color-primary)" />
                        <span style={{ fontSize: '0.9rem' }}>Seleccionar foto desde tu dispositivo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleServiceFilePicker}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <small style={{ color: 'var(--color-text-light)', display: 'block', marginTop: '0.35rem', fontSize: '0.8rem' }}>
                        Si no deseas imagen para este servicio, puedes dejarlo sin foto.
                      </small>
                    </div>
                  )}
                </div>

                {/* Opciones de duración y precio */}
                <div className="form-group" style={{ marginTop: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <label style={{ margin: 0, fontWeight: 600 }}>Opciones de Duración y Precio</label>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                      onClick={handleAddOption}
                    >
                      + Agregar otra duración
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {serviceOptions.map((opt, index) => (
                      <div key={index} className="admin-service-option-row">
                        <input
                          type="text"
                          value={opt.time}
                          onChange={(e) => handleOptionChange(index, 'time', e.target.value)}
                          placeholder="Duración (Ej. 60 Minutes)"
                          style={{ flex: 2 }}
                          required
                        />
                        <input
                          type="text"
                          value={opt.price}
                          onChange={(e) => handleOptionChange(index, 'price', e.target.value)}
                          placeholder="Precio (Ej. $100 USD)"
                          style={{ flex: 1.5 }}
                          required
                        />
                        {serviceOptions.length > 1 && (
                          <button
                            type="button"
                            className="action-btn delete-btn"
                            onClick={() => handleRemoveOption(index)}
                            title="Quitar opción"
                            style={{ padding: '0.6rem' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsServiceModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={serviceUploadingFile}
                    className="btn btn-primary"
                  >
                    {serviceUploadingFile ? 'Guardando...' : editingService ? 'Actualizar Servicio' : 'Guardar y Publicar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
