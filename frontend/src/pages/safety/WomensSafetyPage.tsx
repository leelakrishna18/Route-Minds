import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  PhoneCall,
  MapPin,
  Users,
  Plus,
  Trash2,
  Share2,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  Info
} from 'lucide-react';
import { api, ApiError } from '../../services/api';
import { TrustedContact } from '../../types';
import { LocationMap } from '../../components/maps/LocationMap';

export const WomensSafetyPage: React.FC = () => {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  // Contact form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    mobile_number: '',
    relationship: 'Family Member',
    is_primary: false
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Geolocation & Sharing state
  const [isSharingActive, setIsSharingActive] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const watchIdRef = useRef<number | null>(null);

  // Load contacts
  const fetchContacts = async () => {
    try {
      const data = await api.get<TrustedContact[]>('/safety/contacts');
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    return () => {
      stopLocationWatch();
    };
  }, []);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.post('/safety/contacts', contactForm);
      setShowAddModal(false);
      setContactForm({ name: '', mobile_number: '', relationship: 'Family Member', is_primary: false });
      fetchContacts();
    } catch (err: any) {
      setFormError(err.message || 'Error saving contact.');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to remove this trusted emergency contact?')) return;
    try {
      await api.delete(`/safety/contacts/${id}`);
      fetchContacts();
    } catch (err: any) {
      alert(err.message || 'Error deleting contact.');
    }
  };

  // Start Location Sharing
  const startLocationSharing = () => {
    setLocationError(null);

    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude, accuracy });

        try {
          const resp: any = await api.post('/safety/location/start', {
            latitude,
            longitude,
            accuracy_meters: accuracy
          });

          setIsSharingActive(true);
          const fullShareLink = `${window.location.origin}${resp.share_url}`;
          setShareUrl(fullShareLink);

          // Start watching location updates
          startLocationWatch();
        } catch (err: any) {
          setLocationError(err.message || 'Unable to start location sharing session.');
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please allow location access in your browser settings to use this feature.');
        } else {
          setLocationError(`Unable to retrieve GPS location (${err.message}).`);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const startLocationWatch = () => {
    if (!('geolocation' in navigator)) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude, accuracy });
        api.post('/safety/location/update', {
          latitude,
          longitude,
          accuracy_meters: accuracy
        }).catch(() => {});
      },
      (err) => console.warn('Watch position error:', err),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
    );
  };

  const stopLocationWatch = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Stop Location Sharing
  const stopLocationSharing = async () => {
    stopLocationWatch();
    setIsSharingActive(false);
    setShareUrl(null);
    try {
      await api.post('/safety/location/stop');
    } catch (err) {
      console.error(err);
    }
  };

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Banner with Emergency 112 option */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>APSRTC Suraksha &bull; Women's Safety Assistance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Passenger Safety & Emergency Hub</h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
              Activate permission-based temporary location sharing and configure trusted family contacts.
              In any immediate life-threatening emergency, always contact police services directly on 112.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href="tel:112"
              className="bg-white hover:bg-slate-100 text-rose-700 font-extrabold px-5 py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition text-base"
            >
              <PhoneCall className="w-5 h-5 text-rose-600 animate-pulse" />
              <span>Call 112 Emergency</span>
            </a>
          </div>
        </div>

        {/* Safety Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
          <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <b>Safety Notice:</b> This digital feature is designed to support your journey with consensual, temporary location sharing and rapid helpline access.
            It does not replace official police dispatch. Location coordinates are collected only with your explicit click and stop immediately when you end the session.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Section 1: Live Location Sharing */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-rose-600" />
                  Live Location Sharing
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Share a secure, temporary tracking link with your family
                </p>
              </div>

              {isSharingActive && (
                <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 mr-1.5"></span>
                  Active Sharing
                </span>
              )}
            </div>

            {locationError && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{locationError}</span>
              </div>
            )}

            {/* Map Preview when sharing */}
            {isSharingActive && currentCoords && (
              <div className="space-y-3">
                <LocationMap
                  latitude={currentCoords.lat}
                  longitude={currentCoords.lng}
                  accuracy={currentCoords.accuracy}
                  markerTitle="Your Current Location"
                />

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-500">Secure Shareable Link:</div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl || ''}
                      className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-700"
                    />
                    <button
                      onClick={copyShareLink}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center space-x-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Expires automatically in 4 hours or upon clicking "Stop Sharing".
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div>
              {!isSharingActive ? (
                <button
                  type="button"
                  onClick={startLocationSharing}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-sm transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Start Live Location Sharing</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopLocationSharing}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-sm transition"
                >
                  <span>Stop Location Sharing</span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-400 leading-normal">
              Privacy Guarantee: Your coordinates are never collected silently in the background. Sharing ceases the instant you click Stop.
            </div>
          </div>

          {/* Section 2: Trusted Contacts */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-apsrtc-primary" />
                  Trusted Emergency Contacts
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save up to 5 verified mobile numbers for quick alerts
                </p>
              </div>

              {contacts.length < 5 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-apsrtc-primary hover:bg-apsrtc-primaryDark text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Contact</span>
                </button>
              )}
            </div>

            {loadingContacts ? (
              <div className="text-xs text-slate-400 py-8 text-center">Loading saved contacts...</div>
            ) : contacts.length === 0 ? (
              <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-600">No emergency contacts saved yet.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-xs font-bold text-apsrtc-primary hover:underline"
                >
                  + Add your first trusted contact
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                        <span>{c.name}</span>
                        {c.is_primary && (
                          <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {c.relationship} &bull; +91 {c.mobile_number}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={`tel:+91${c.mobile_number}`}
                        className="p-2 text-slate-600 hover:text-emerald-600 bg-white rounded-lg border border-slate-200 shadow-sm"
                        title="Call"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 bg-white rounded-lg border border-slate-200 shadow-sm"
                        title="Remove contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-[11px] text-slate-400 leading-normal">
              Trusted contacts receive direct SMS links when you initiate safety alerts through carrier integration.
            </div>
          </div>

        </div>

        {/* Add Contact Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Add Trusted Contact</h3>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddContact} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Sitaram (Father)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">10-Digit Mobile Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-500 text-xs font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={contactForm.mobile_number}
                      onChange={(e) => setContactForm({ ...contactForm, mobile_number: e.target.value })}
                      placeholder="9848012345"
                      className="w-full bg-slate-50 border border-slate-300 rounded-r-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={contactForm.relationship}
                    onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-apsrtc-primary"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                    <option value="Friend">Friend</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={contactForm.is_primary}
                    onChange={(e) => setContactForm({ ...contactForm, is_primary: e.target.checked })}
                    className="h-4 w-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
                  />
                  <label htmlFor="is_primary" className="text-xs text-slate-700 font-medium">
                    Mark as primary emergency contact
                  </label>
                </div>

                <div className="flex space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-apsrtc-primary hover:bg-apsrtc-primaryDark text-white rounded-lg text-xs font-semibold"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
