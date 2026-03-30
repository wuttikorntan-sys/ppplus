'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { api } from '@/lib/api';
import { Save, RotateCcw, MapPin, Phone, Mail, MessageCircle, Clock, Map, ChevronDown, ChevronRight, Locate, Search, MousePointerClick } from 'lucide-react';

interface ContentMap {
  [key: string]: { th: string; en: string };
}

const sections: { id: string; titleTh: string; titleEn: string; icon: typeof MapPin; fields: { key: string; labelTh: string; labelEn: string; multiline?: boolean }[] }[] = [
  {
    id: 'address',
    titleTh: 'ที่อยู่ร้าน',
    titleEn: 'Store Address',
    icon: MapPin,
    fields: [
      { key: 'location.address', labelTh: 'ที่อยู่', labelEn: 'Address', multiline: true },
    ],
  },
  {
    id: 'contact',
    titleTh: 'ข้อมูลติดต่อ',
    titleEn: 'Contact Information',
    icon: Phone,
    fields: [
      { key: 'location.phone', labelTh: 'เบอร์โทรศัพท์', labelEn: 'Phone Number' },
      { key: 'location.email', labelTh: 'อีเมล', labelEn: 'Email' },
      { key: 'location.line', labelTh: 'LINE ID', labelEn: 'LINE ID' },
    ],
  },
  {
    id: 'hours',
    titleTh: 'เวลาทำการ',
    titleEn: 'Opening Hours',
    icon: Clock,
    fields: [
      { key: 'location.hours_title', labelTh: 'หัวข้อเวลาทำการ', labelEn: 'Hours Title' },
      { key: 'location.lunch', labelTh: 'เวลามื้อกลางวัน', labelEn: 'Lunch Hours' },
      { key: 'location.dinner', labelTh: 'เวลามื้อเย็น', labelEn: 'Dinner Hours' },
      { key: 'location.closed', labelTh: 'วันหยุด', labelEn: 'Closed Days' },
    ],
  },
];

const defaults: ContentMap = {
  'location.address': { th: 'กรุงเทพมหานคร 10110', en: 'Bangkok 10110' },
  'location.phone': { th: '02-123-4567', en: '02-123-4567' },
  'location.email': { th: 'info@PP+.co.th', en: 'info@PP+.co.th' },
  'location.line': { th: '@PP+', en: '@PP+' },
  'location.hours_title': { th: 'เวลาทำการ', en: 'Opening Hours' },
  'location.lunch': { th: 'จันทร์ - เสาร์: 08:00 - 18:00', en: 'Mon - Sat: 8:00 AM - 6:00 PM' },
  'location.dinner': { th: 'อาทิตย์: 09:00 - 15:00', en: 'Sun: 9:00 AM - 3:00 PM' },
  'location.closed': { th: 'เปิดทุกวัน', en: 'Open Every Day' },
  'location.map_embed': { th: 'https://maps.google.com/maps?q=13.7563,100.5018&z=17&output=embed', en: 'https://maps.google.com/maps?q=13.7563,100.5018&z=17&output=embed' },
  'location.lat': { th: '13.7563', en: '13.7563' },
  'location.lng': { th: '100.5018', en: '100.5018' },
};

export default function AdminLocationPage() {
  const locale = useLocale();
  const [content, setContent] = useState<ContentMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['address', 'contact', 'hours', 'map']));
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  useEffect(() => {
    api.get<{ success: boolean; data: ContentMap }>('/site-content')
      .then((res) => {
        const merged = { ...defaults };
        Object.entries(res.data).forEach(([key, val]) => {
          if (key.startsWith('location.')) {
            // Only override default if DB value is not empty
            if (val.th || val.en) {
              merged[key] = val;
            }
          }
        });
        setContent(merged);
      })
      .catch(() => {
        setContent({ ...defaults });
      })
      .finally(() => setLoading(false));
  }, []);

  // Set coordinates and auto-generate embed URL
  const setCoordinates = useCallback((lat: number, lng: number) => {
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    const embedUrl = `https://maps.google.com/maps?q=${latStr},${lngStr}&z=17&output=embed`;
    setContent((prev) => ({
      ...prev,
      'location.lat': { th: latStr, en: latStr },
      'location.lng': { th: lngStr, en: lngStr },
      'location.map_embed': { th: embedUrl, en: embedUrl },
    }));
  }, []);

  // Load Leaflet and initialize interactive map
  useEffect(() => {
    if (loading || !mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    const loadLeaflet = async () => {
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!(window as unknown as Record<string, unknown>).L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      if (!mapContainerRef.current) return;

      const currentLat = parseFloat(content['location.lat']?.th || content['location.lat']?.en || '9.532993');
      const currentLng = parseFloat(content['location.lng']?.th || content['location.lng']?.en || '100.065811');

      const map = L.map(mapContainerRef.current).setView([currentLat, currentLng], 16);
      leafletMapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const marker = L.marker([currentLat, currentLng], { draggable: true, icon: redIcon }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setCoordinates(pos.lat, pos.lng);
      });

      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng(e.latlng);
        setCoordinates(e.latlng.lat, e.latlng.lng);
      });
    };

    loadLeaflet();
  }, [loading, setCoordinates]);

  // Search location using Nominatim (OpenStreetMap geocoding)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lon);
        setCoordinates(latNum, lngNum);

        // Move map and marker
        if (leafletMapRef.current && markerRef.current) {
          leafletMapRef.current.setView([latNum, lngNum], 16);
          markerRef.current.setLatLng([latNum, lngNum]);
        }
      } else {
        alert(locale === 'th' ? 'ไม่พบสถานที่ กรุณาลองค้นหาใหม่' : 'Location not found. Please try again.');
      }
    } catch {
      alert(locale === 'th' ? 'ค้นหาไม่สำเร็จ' : 'Search failed');
    }
    setSearching(false);
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateField = (key: string, lang: 'th' | 'en', value: string) => {
    setContent((prev) => ({
      ...prev,
      [key]: { ...prev[key], [lang]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = Object.entries(content).map(([key, val]) => ({
        key,
        valueTh: val.th,
        valueEn: val.en,
        type: 'text',
      }));
      await api.put('/admin/site-content', items);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleReset = () => {
    if (confirm(locale === 'th' ? 'รีเซ็ตเป็นค่าเริ่มต้น?' : 'Reset to defaults?')) {
      setContent({ ...defaults });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" /></div>;

  const mapEmbedUrl = content['location.map_embed']?.th || content['location.map_embed']?.en || '';
  const currentLat = content['location.lat']?.th || content['location.lat']?.en || '';
  const currentLng = content['location.lng']?.th || content['location.lng']?.en || '';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: 'var(--font-heading)' }}>
            {locale === 'th' ? 'จัดการตำแหน่งที่ตั้งร้าน' : 'Store Location'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {locale === 'th' ? 'แก้ไขที่อยู่ ข้อมูลติดต่อ เวลาทำการ และแผนที่' : 'Edit address, contact info, hours and map'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            <RotateCcw className="w-4 h-4" /> {locale === 'th' ? 'รีเซ็ต' : 'Reset'}
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium hover:bg-[#1E3A5F]/90 transition disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? (locale === 'th' ? 'กำลังบันทึก...' : 'Saving...') : (locale === 'th' ? 'บันทึกทั้งหมด' : 'Save All')}
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {locale === 'th' ? 'บันทึกเรียบร้อยแล้ว!' : 'Saved successfully!'}
        </div>
      )}

      {/* Interactive Map Picker */}
      <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-[#1E3A5F]" />
            <span className="font-semibold text-[#1E293B]">{locale === 'th' ? 'กำหนดตำแหน่งร้าน' : 'Set Store Location'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <MousePointerClick className="w-4 h-4" />
            {locale === 'th' ? 'คลิกบนแผนที่หรือลากหมุดเพื่อกำหนดตำแหน่ง' : 'Click map or drag pin to set location'}
          </div>
        </div>

        {/* Search bar */}
        <div className="px-5 py-3 border-b bg-gray-50">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={locale === 'th' ? 'ค้นหาสถานที่... เช่น PP+ กรุงเทพ' : 'Search location... e.g. PP+ Bangkok'}
                className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium hover:bg-[#1E3A5F]/90 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              {searching ? (locale === 'th' ? 'กำลังค้นหา...' : 'Searching...') : (locale === 'th' ? 'ค้นหา' : 'Search')}
            </button>
          </div>
        </div>

        {/* Leaflet interactive map */}
        <div ref={mapContainerRef} className="h-[400px] w-full" style={{ zIndex: 0 }} />

        {/* Current coordinates display */}
        <div className="px-5 py-3 border-t bg-gray-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#1E3A5F]" />
              <span className="text-gray-500">{locale === 'th' ? 'พิกัดปัจจุบัน:' : 'Current coordinates:'}</span>
            </div>
            <span className="font-mono text-[#1E293B] font-medium">
              {currentLat && currentLng ? `${currentLat}, ${currentLng}` : (locale === 'th' ? 'ยังไม่ได้กำหนด — คลิกบนแผนที่เพื่อวางหมุด' : 'Not set — click on the map to drop a pin')}
            </span>
          </div>
          {mapEmbedUrl && (
            <span className="text-xs text-green-600 font-medium">✓ {locale === 'th' ? 'สร้าง URL แผนที่แล้ว' : 'Map URL generated'}</span>
          )}
        </div>
      </div>

      {/* Google Maps Preview */}
      {mapEmbedUrl && (
        <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b flex items-center gap-2">
            <Map className="w-5 h-5 text-[#1E3A5F]" />
            <span className="font-semibold text-[#1E293B]">{locale === 'th' ? 'ตัวอย่างแผนที่ Google Maps (ที่จะแสดงในเว็บไซต์)' : 'Google Maps Preview (shown on website)'}</span>
          </div>
          <div className="h-64">
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location"
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id);
          const Icon = section.icon;
          return (
            <div key={section.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[#1E3A5F]" />
                  <span className="font-semibold text-[#1E293B]">
                    {locale === 'th' ? section.titleTh : section.titleEn}
                  </span>
                  <span className="text-xs text-gray-400">{section.fields.length} {locale === 'th' ? 'ฟิลด์' : 'fields'}</span>
                </div>
                {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t">
                  {section.fields.map((field) => (
                    <div key={field.key} className="grid md:grid-cols-2 gap-4 pt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          {locale === 'th' ? field.labelTh : field.labelEn} — <span className="text-[#1E3A5F]">TH</span>
                        </label>
                        {field.multiline ? (
                          <textarea
                            value={content[field.key]?.th || ''}
                            onChange={(e) => updateField(field.key, 'th', e.target.value)}
                            rows={3}
                            className="w-full border rounded-lg px-3 py-2 text-sm resize-y"
                          />
                        ) : (
                          <input
                            type="text"
                            value={content[field.key]?.th || ''}
                            onChange={(e) => updateField(field.key, 'th', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          {locale === 'th' ? field.labelTh : field.labelEn} — <span className="text-blue-600">EN</span>
                        </label>
                        {field.multiline ? (
                          <textarea
                            value={content[field.key]?.en || ''}
                            onChange={(e) => updateField(field.key, 'en', e.target.value)}
                            rows={3}
                            className="w-full border rounded-lg px-3 py-2 text-sm resize-y"
                          />
                        ) : (
                          <input
                            type="text"
                            value={content[field.key]?.en || ''}
                            onChange={(e) => updateField(field.key, 'en', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
