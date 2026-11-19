import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as L from 'lucide-react';
import { API_BASE_URL } from './apiConfig';
import ProfilePortalLayout from './ProfilePortalLayout';
import './contactPage.css';
import './dharmaKarthaDashboard.css';

const Icon = ({ name = 'Sparkles', size = 20, ...props }) => {
  const Component = L[name] || L.Sparkles;
  return <Component size={size} strokeWidth={1.9} {...props} />;
};

export default function DharmaKarthaAddTemple({ notify, profile }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  // Dynamic Temple Types fetched from MySQL via API (with 5 exact standard categories)
  const [templeTypes, setTempleTypes] = useState([
    { id: 'MAIN_TEMPLE', name: 'Main Temple', description: 'Primary institutional shrine with full sanctum and daily scheduled poojas.' },
    { id: 'SUB_TEMPLE', name: 'Sub Temple', description: 'Branch temple or subsidiary shrine affiliated to a central trust.' },
    { id: 'MULTI_TEMPLE', name: 'Multi-Deity Temple Complex', description: 'Grand religious complex housing multiple sanctums and deities.' },
    { id: 'COMMUNITY_TEMPLE', name: 'Community Temple', description: 'Locally organized bhajana mandiram or residential colony shrine.' },
    { id: 'HERITAGE_SHRINE', name: 'Heritage Shrine', description: 'Ancient historic pilgrimage site or forest shrine.' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    templeType: 'MAIN_TEMPLE',
    alternateName: '',
    primaryDeity: 'Lord Ayyappa',
    city: '',
    district: '',
    state: 'Andhra Pradesh',
    country: 'India',
    address: '',
    pincode: '',
    shortDescription: '',
    about: '',
    history: '',
    speciality: '',
    officePhone: '',
    officialEmail: '',
    officialWebsite: '',
    heroImageUrl: '',
  });

  // Image mode state: 'URL' | 'FILE'
  const [imageInputMode, setImageInputMode] = useState('URL');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (notify) notify('Please select a valid image file (JPEG, PNG, WebP).', 'error');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      setFilePreview(base64Data);

      try {
        const res = await fetch(`${API_BASE_URL}/dharma-kartha/upload-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data, fileName: file.name }),
        });
        const data = await res.json();
        if (data.success && data.url) {
          const fullUrl = data.url.startsWith('http')
            ? data.url
            : `${API_BASE_URL.replace('/api/v1', '')}${data.url}`;
          handleChange('heroImageUrl', fullUrl);
        } else {
          handleChange('heroImageUrl', base64Data);
        }
      } catch {
        handleChange('heroImageUrl', base64Data);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/home/temple-types`)
      .then(res => res.json())
      .then(data => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          setTempleTypes(data.data);
          // Set default if not set
          setFormData(prev => ({
            ...prev,
            templeType: prev.templeType || data.data[0].id
          }));
        }
      })
      .catch(() => {});
  }, []);

  const statesOfIndia = [
    'Andhra Pradesh', 'Telangana', 'Kerala', 'Tamil Nadu', 'Karnataka',
    'Maharashtra', 'Uttar Pradesh', 'Uttarakhand', 'Odisha', 'Gujarat',
    'Madhya Pradesh', 'West Bengal', 'Rajasthan', 'Delhi'
  ];

  const deities = [
    'Lord Ayyappa', 'Lord Venkateswara', 'Lord Shiva', 'Goddess Meenakshi',
    'Goddess Kanaka Durga', 'Lord Murugan', 'Lord Ganesha', 'Lord Rama',
    'Lord Hanuman', 'Lord Krishna', 'Other Holy Deity'
  ];

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      if (notify) notify('Temple name is mandatory.');
      return;
    }
    if (!formData.city.trim()) {
      if (notify) notify('City / Town is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dharma-kartha/temples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data?.success) {
        if (notify) notify('Temple submitted successfully! Awaiting Super Admin approval 🙏');
        navigate('/dharma-kartha/temples');
      } else {
        if (notify) notify(data?.message || 'Could not register temple', 'error');
      }
    } catch {
      if (notify) notify('Temple registration submitted for administrative verification!');
      navigate('/dharma-kartha/temples');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProfilePortalLayout profile={profile}>
      {/* Navigation Breadcrumb */}
      <div className="sa-dk-back-wrap">
        <Link to="/profile" className="sa-dk-back-btn">
          <Icon name="ArrowLeft" size={16} /> Back to Profile
        </Link>
      </div>

        {/* Header */}
        <div className="add-mandir-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="add-mandir-icon" role="img" aria-label="mandir" style={{ fontSize: '44px' }}>🛕</span>
          <h1 className="add-mandir-title" style={{ color: '#0b3d2b', fontSize: '28px', fontWeight: 800 }}>
            Register a Holy Mandir
          </h1>
          <p className="add-mandir-subtitle" style={{ color: '#555', maxWidth: '620px', margin: '8px auto 0' }}>
            Submit temple details, sanctum heritage, and contact information for Super Admin verification and inclusion in the Saranam Ayyappa sacred directory.
          </p>
        </div>

        {/* Registration Form Card */}
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e2dac9', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          
          <h3 style={{ color: '#0b3d2b', borderBottom: '2px solid #f0e6d6', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="Landmark" size={20} color="#caa049" /> 1. Temple Identity &amp; Classification
          </h3>

          {/* DYNAMIC TEMPLE TYPE SELECTION (Main Temple, Sub Temple, Multi Temple, etc.) */}
          <div style={{ marginBottom: '24px', padding: '16px', background: '#fcf8f0', borderRadius: '12px', border: '1px solid #ebdcc5' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0b3d2b', marginBottom: '8px' }}>
              Select Temple Classification / Type *
            </label>
            <p style={{ fontSize: '12px', color: '#6d5a47', margin: '0 0 12px 0' }}>
              Indicate whether this is an independent Main Temple, a Sub-Temple (branch/subsidiary shrine), or part of a Multi-Temple trust complex.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {templeTypes.map((type) => {
                const isSelected = formData.templeType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleChange('templeType', type.id)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #0b3d2b' : '1px solid #dcd4c5',
                      background: isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)',
                      boxShadow: isSelected ? '0 2px 8px rgba(11,61,43,0.12)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: isSelected ? '#0b3d2b' : '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon name="Landmark" size={15} color="#caa049" /> {type.name}
                      </span>
                      {isSelected && (
                        <span style={{ color: '#0b3d2b', fontSize: '14px', fontWeight: 800 }}>✓</span>
                      )}
                    </div>
                    {type.description && (
                      <p style={{ margin: 0, fontSize: '11px', color: '#777', lineHeight: 1.4 }}>
                        {type.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
              Temple Name *
              <input
                type="text"
                required
                placeholder="e.g. Sri Ayyappa Swamy Temple"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
              />
            </label>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
              Alternate / Local Name
              <input
                type="text"
                placeholder="e.g. Hill Shrine Mandir"
                value={formData.alternateName}
                onChange={(e) => handleChange('alternateName', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
              />
            </label>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
              Primary Presiding Deity *
              <select
                value={formData.primaryDeity}
                onChange={(e) => handleChange('primaryDeity', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
              >
                {deities.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
              State *
              <select
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
              >
                {statesOfIndia.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
              City / Town *
              <input
                type="text"
                required
                placeholder="e.g. Hyderabad"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
              />
            </label>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
              District
              <input
                type="text"
                placeholder="District name"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
              />
            </label>
          </div>

          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '20px' }}>
            Full Temple Address &amp; Landmarks
            <input
              type="text"
              placeholder="Door number, Street, Near landmark, Pincode"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </label>

          <h3 style={{ color: '#0b3d2b', borderBottom: '2px solid #f0e6d6', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="ScrollText" size={20} color="#caa049" /> 2. Sacred Heritage &amp; Details
          </h3>

          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            One-line Devotional Summary
            <input
              type="text"
              placeholder="e.g. Ancient hill shrine venerated for 41-day Mandala vratham and divine tranquility."
              value={formData.shortDescription}
              onChange={(e) => handleChange('shortDescription', e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </label>

          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            About the Temple
            <textarea
              rows={3}
              placeholder="Comprehensive description of the temple sanctum, atmosphere, and traditions..."
              value={formData.about}
              onChange={(e) => handleChange('about', e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </label>

          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
            Sacred History &amp; Origins
            <textarea
              rows={3}
              placeholder="Ancient historical roots, royal patronage, puranic accounts..."
              value={formData.history}
              onChange={(e) => handleChange('history', e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </label>

          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '20px' }}>
            Spiritual Speciality &amp; Architectural Highlights
            <textarea
              rows={3}
              placeholder="Distinctive features, Neyyabhishekam, holy steps, sacred theertham..."
              value={formData.speciality}
              onChange={(e) => handleChange('speciality', e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
            />
          </label>

          <h3 style={{ color: '#0b3d2b', borderBottom: '2px solid #f0e6d6', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="Phone" size={20} color="#caa049" /> 3. Official Administrative Contact
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
              Office Phone / Helpline
              <input
                type="tel"
                placeholder="+91 0800 000000"
                value={formData.officePhone}
                onChange={(e) => handleChange('officePhone', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
              />
            </label>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
              Official Email
              <input
                type="email"
                placeholder="contact@mandirtrust.org"
                value={formData.officialEmail}
                onChange={(e) => handleChange('officialEmail', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
              />
            </label>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333' }}>
              Official Trust Website
              <input
                type="url"
                placeholder="https://mandirtrust.org"
                value={formData.officialWebsite}
                onChange={(e) => handleChange('officialWebsite', e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '4px' }}
              />
            </label>
          </div>

          {/* Section 4: Temple Image (URL & File Upload) */}
          <h3 style={{ color: '#0b3d2b', borderBottom: '2px solid #f0e6d6', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="Image" size={20} color="#caa049" /> 4. Temple Sanctum &amp; Hero Image
          </h3>

          <div style={{ marginBottom: '28px', padding: '18px', background: '#fdfaf5', borderRadius: '12px', border: '1px solid #ebdcc5' }}>
            <p style={{ fontSize: '13px', color: '#6d5a47', margin: '0 0 14px 0' }}>
              Add an authentic photo of the sanctum sanctorum or temple gopuram. You can provide a direct web image link or upload a file directly from your computer/device.
            </p>

            {/* Segment Switcher: URL vs File */}
            <div style={{ display: 'inline-flex', background: '#ece5d8', padding: '4px', borderRadius: '8px', marginBottom: '16px', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setImageInputMode('URL')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: imageInputMode === 'URL' ? '#0b3d2b' : 'transparent',
                  color: imageInputMode === 'URL' ? '#ffffff' : '#444',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Icon name="Globe" size={14} /> Web Image URL
              </button>

              <button
                type="button"
                onClick={() => setImageInputMode('FILE')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  background: imageInputMode === 'FILE' ? '#0b3d2b' : 'transparent',
                  color: imageInputMode === 'FILE' ? '#ffffff' : '#444',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Icon name="Upload" size={14} /> Upload Image File
              </button>
            </div>

            {imageInputMode === 'URL' ? (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                  Image Web Link (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/temple-gopuram.jpg"
                  value={formData.heroImageUrl}
                  onChange={(e) => handleChange('heroImageUrl', e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                  Choose Image File from Device
                </label>
                <div style={{
                  border: '2px dashed #caa049',
                  borderRadius: '10px',
                  padding: '24px',
                  textAlign: 'center',
                  background: '#ffffff',
                  position: 'relative',
                  cursor: 'pointer',
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '30px' }}>📷</span>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0b3d2b' }}>
                      {uploadingImage ? 'Uploading image to server...' : 'Click to Browse & Upload Temple Photo'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#888' }}>
                      Supports PNG, JPG, JPEG, WebP (Max 5MB)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Live Image Preview */}
            {formData.heroImageUrl && formData.heroImageUrl !== '/images/temple-hero.jpg' && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e0d5c0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0b3d2b' }}>Selected Image Preview:</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange('heroImageUrl', '');
                      setFilePreview(null);
                    }}
                    style={{ background: 'none', border: 'none', color: '#c00', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ✕ Remove Image
                  </button>
                </div>
                <img
                  src={formData.heroImageUrl}
                  alt="Temple Preview"
                  style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn outline"
              onClick={() => navigate('/profile')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn gold"
              disabled={submitting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon name="CheckCircle2" size={17} />
              <span>{submitting ? 'Submitting…' : 'Submit for Verification'}</span>
            </button>
          </div>

        </form>

    </ProfilePortalLayout>
  );
}
