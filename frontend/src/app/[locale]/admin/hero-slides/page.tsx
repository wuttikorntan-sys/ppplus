'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X, Upload, Image as ImageIcon, Eye, EyeOff, GripVertical, Video } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface HeroSlide {
  id: number;
  type: 'image' | 'video';
  image: string | null;
  videoUrl: string | null;
  titleTh: string | null;
  titleEn: string | null;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm = {
  type: 'image' as 'image' | 'video',
  titleTh: '',
  titleEn: '',
  videoUrl: '',
  isActive: true,
  sortOrder: '0',
};

export default function AdminHeroSlidesPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const fetchSlides = () => {
    api.get<{ success: boolean; data: HeroSlide[] }>('/admin/hero-slides')
      .then((r) => setSlides(r.data))
      .catch(() => {});
  };

  useEffect(() => { fetchSlides(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setVideoFile(null);
    setVideoFileName(null);
    setShowForm(true);
  };

  const openEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setForm({
      type: slide.type,
      titleTh: slide.titleTh || '',
      titleEn: slide.titleEn || '',
      videoUrl: slide.videoUrl || '',
      isActive: slide.isActive,
      sortOrder: slide.sortOrder.toString(),
    });
    setImageFile(null);
    setImagePreview(slide.image || null);
    setVideoFile(null);
    setVideoFileName(slide.videoUrl ? slide.videoUrl.split('/').pop() || null : null);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (form.type === 'image' && !imageFile && !editingId) {
      toast.error(th ? 'กรุณาเลือกรูปภาพ' : 'Please select an image');
      return;
    }
    if (form.type === 'video' && !form.videoUrl && !videoFile) {
      toast.error(th ? 'กรุณาระบุ URL วิดีโอ หรืออัปโหลดไฟล์วิดีโอ' : 'Please provide a video URL or upload a video file');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('titleTh', form.titleTh);
      formData.append('titleEn', form.titleEn);
      formData.append('videoUrl', form.videoUrl);
      formData.append('isActive', String(form.isActive));
      formData.append('sortOrder', form.sortOrder || '0');
      if (imageFile) formData.append('image', imageFile);
      if (videoFile) formData.append('video', videoFile);

      if (editingId) {
        await api.upload(`/admin/hero-slides/${editingId}`, formData, 'PUT');
        toast.success(th ? 'อัปเดตเรียบร้อย' : 'Updated');
      } else {
        await api.upload('/admin/hero-slides', formData);
        toast.success(th ? 'เพิ่มเรียบร้อย' : 'Added');
      }
      setShowForm(false);
      fetchSlides();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (th ? 'เกิดข้อผิดพลาด' : 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(th ? 'ลบสไลด์นี้?' : 'Delete this slide?')) return;
    try {
      await api.delete(`/admin/hero-slides/${id}`);
      toast.success(th ? 'ลบเรียบร้อย' : 'Deleted');
      fetchSlides();
    } catch {
      toast.error('Error');
    }
  };

  const toggleActive = async (slide: HeroSlide) => {
    try {
      const formData = new FormData();
      formData.append('isActive', String(!slide.isActive));
      await api.upload(`/admin/hero-slides/${slide.id}`, formData, 'PUT');
      fetchSlides();
    } catch {
      toast.error('Error');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'จัดการสไลด์หน้าแรก' : 'Hero Slides'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{slides.length} {th ? 'สไลด์' : 'slides'}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1E] text-white rounded-lg font-medium hover:bg-[#1C1C1E]-light transition text-sm shadow-sm">
          <Plus className="w-4 h-4" /> {th ? 'เพิ่มสไลด์' : 'Add Slide'}
        </button>
      </div>

      {/* Slides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {slides.map((slide) => (
          <div key={slide.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
            {/* Preview */}
            <div className="relative aspect-video bg-gray-100">
              {slide.image ? (
                <Image src={slide.image} alt="" fill className="object-cover" sizes="400px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {slide.type === 'video' ? <Video className="w-10 h-10 text-gray-300" /> : <ImageIcon className="w-10 h-10 text-gray-300" />}
                </div>
              )}
              {/* Overlay info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-2 left-2 flex gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${slide.type === 'video' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {slide.type}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${slide.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {slide.isActive ? (th ? 'เปิด' : 'ON') : (th ? 'ปิด' : 'OFF')}
                </span>
              </div>
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded font-mono">
                #{slide.sortOrder}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 truncate">
                {th ? (slide.titleTh || 'ไม่มีชื่อ') : (slide.titleEn || 'Untitled')}
              </p>
              {slide.type === 'video' && slide.videoUrl && (
                <p className="text-xs text-gray-400 truncate mt-0.5">{slide.videoUrl}</p>
              )}

              <div className="flex items-center gap-1.5 mt-3">
                <button onClick={() => toggleActive(slide)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${slide.isActive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                  {slide.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {slide.isActive ? (th ? 'เปิด' : 'Active') : (th ? 'ปิด' : 'Hidden')}
                </button>
                <div className="flex-1" />
                <button onClick={() => openEdit(slide)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={() => handleDelete(slide.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {slides.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-gray-100 p-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{th ? 'ยังไม่มีสไลด์ กดเพิ่มสไลด์เพื่อเริ่มต้น' : 'No slides yet. Click Add Slide to get started.'}</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {editingId ? (th ? 'แก้ไขสไลด์' : 'Edit Slide') : (th ? 'เพิ่มสไลด์ใหม่' : 'New Slide')}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ประเภท' : 'Type'}</label>
                <div className="flex gap-2">
                  <button onClick={() => setForm({ ...form, type: 'image' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${form.type === 'image' ? 'bg-[#1C1C1E] text-white border-[#1C1C1E]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                    <ImageIcon className="w-4 h-4 inline mr-1.5" />{th ? 'รูปภาพ' : 'Image'}
                  </button>
                  <button onClick={() => setForm({ ...form, type: 'video' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${form.type === 'video' ? 'bg-[#1C1C1E] text-white border-[#1C1C1E]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                    <Video className="w-4 h-4 inline mr-1.5" />{th ? 'วิดีโอ' : 'Video'}
                  </button>
                </div>
              </div>

              {/* Image Upload - required for image type, optional poster for video */}
              {form.type === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {th ? 'รูปภาพ' : 'Image'}
                  </label>
                  <div onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#1C1C1E]/30 hover:bg-[#1C1C1E]/5 transition group">
                    {imagePreview ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                          <Upload className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      </div>
                    ) : (
                      <div className="py-6">
                        <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">{th ? 'คลิกเพื่ออัปโหลด (1920x1080 แนะนำ)' : 'Click to upload (1920x1080 recommended)'}</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </div>
                </div>
              )}

              {/* Video Upload / URL */}
              {form.type === 'video' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'อัปโหลดวิดีโอ (mp4)' : 'Upload Video (mp4)'}</label>
                    <div onClick={() => videoInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#1C1C1E]/30 hover:bg-[#1C1C1E]/5 transition group">
                      {videoFileName ? (
                        <div className="flex items-center justify-center gap-2 py-4">
                          <Video className="w-8 h-8 text-purple-500" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-800 truncate max-w-[250px]">{videoFileName}</p>
                            <p className="text-xs text-gray-400">{th ? 'คลิกเพื่อเปลี่ยนวิดีโอ' : 'Click to change video'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6">
                          <Video className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">{th ? 'คลิกเพื่ออัปโหลดวิดีโอ' : 'Click to upload video'}</p>
                        </div>
                      )}
                      <input ref={videoInputRef} type="file" accept="video/mp4,video/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setVideoFile(file); setVideoFileName(file.name); setForm({ ...form, videoUrl: '' }); }
                      }} />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-x-0 top-1/2 border-t border-gray-200" />
                    <p className="relative text-center"><span className="bg-white px-3 text-xs text-gray-400">{th ? 'หรือ' : 'or'}</span></p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ลิงก์วิดีโอ (URL)' : 'Video URL'}</label>
                    <input type="text" value={form.videoUrl} onChange={(e) => { setForm({ ...form, videoUrl: e.target.value }); if (e.target.value) { setVideoFile(null); setVideoFileName(null); } }}
                      placeholder="/hero-video.mp4"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none text-sm" />
                  </div>

                  {/* Optional Poster */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {th ? 'รูป Poster (ไม่บังคับ)' : 'Poster Image (optional)'}
                    </label>
                    <div onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:border-[#1C1C1E]/30 hover:bg-[#1C1C1E]/5 transition group">
                      {imagePreview ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                          <img src={imagePreview} alt="Poster" className="object-cover w-full h-full" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition" />
                          </div>
                        </div>
                      ) : (
                        <div className="py-3">
                          <ImageIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                          <p className="text-xs text-gray-400">{th ? 'คลิกเพื่ออัปโหลดรูป poster (ไม่บังคับ)' : 'Click to upload poster (optional)'}</p>
                        </div>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </div>
                  </div>
                </>
              )}

              {/* Titles */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อ (TH)' : 'Title (TH)'}</label>
                  <input type="text" value={form.titleTh} onChange={(e) => setForm({ ...form, titleTh: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none text-sm"
                    placeholder={th ? 'ไม่บังคับ' : 'Optional'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ชื่อ (EN)' : 'Title (EN)'}</label>
                  <input type="text" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none text-sm"
                    placeholder={th ? 'ไม่บังคับ' : 'Optional'} />
                </div>
              </div>

              {/* Sort Order & Active */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'ลำดับ' : 'Sort Order'}</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1C1C1E]/20 focus:border-[#1C1C1E] outline-none text-sm" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#1C1C1E] focus:ring-[#1C1C1E]" />
                    <span className="text-sm text-gray-700">{th ? 'เปิดใช้งาน' : 'Active'}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">
                {th ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 bg-[#1C1C1E] text-white text-sm font-medium rounded-lg hover:bg-[#1C1C1E]-light transition disabled:opacity-50">
                {saving ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึก' : 'Save')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
