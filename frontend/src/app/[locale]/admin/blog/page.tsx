'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, X, Upload, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface BlogPost {
  id: number;
  titleTh: string;
  titleEn: string;
  contentTh: string;
  contentEn: string;
  excerptTh: string;
  excerptEn: string;
  image: string | null;
  slug: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const emptyForm = {
  titleTh: '', titleEn: '', contentTh: '', contentEn: '', excerptTh: '', excerptEn: '', slug: '', tags: '', isPublished: true,
};

export default function AdminBlogPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = () => {
    api.get<{ success: boolean; data: BlogPost[] }>('/admin/blog')
      .then((r) => setPosts(r.data))
      .catch(() => {});
  };

  useEffect(() => { fetchPosts(); }, []);

  const filtered = posts.filter((p) => {
    if (!search) return true;
    return p.titleTh.includes(search) || p.titleEn.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search);
  });

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      titleTh: post.titleTh,
      titleEn: post.titleEn,
      contentTh: post.contentTh,
      contentEn: post.contentEn,
      excerptTh: post.excerptTh || '',
      excerptEn: post.excerptEn || '',
      slug: post.slug,
      tags: (post.tags || []).join(', '),
      isPublished: post.isPublished,
    });
    setImageFile(null);
    setImagePreview(post.image || null);
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
    if (!form.titleTh || !form.titleEn || !form.slug) {
      toast.error(th ? 'กรุณากรอกข้อมูลให้ครบ' : 'Please fill required fields');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('titleTh', form.titleTh);
      formData.append('titleEn', form.titleEn);
      formData.append('contentTh', form.contentTh);
      formData.append('contentEn', form.contentEn);
      formData.append('excerptTh', form.excerptTh);
      formData.append('excerptEn', form.excerptEn);
      formData.append('slug', form.slug);
      formData.append('tags', form.tags);
      formData.append('isPublished', String(form.isPublished));
      if (imageFile) formData.append('image', imageFile);

      if (editingId) {
        await api.upload(`/admin/blog/${editingId}`, formData, 'PUT');
        toast.success(th ? 'อัปเดตเรียบร้อย' : 'Updated');
      } else {
        await api.upload('/admin/blog', formData);
        toast.success(th ? 'เพิ่มเรียบร้อย' : 'Added');
      }
      setShowForm(false);
      fetchPosts();
    } catch {
      toast.error(th ? 'เกิดข้อผิดพลาด' : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(th ? 'ลบบทความนี้?' : 'Delete this post?')) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      toast.success(th ? 'ลบเรียบร้อย' : 'Deleted');
      fetchPosts();
    } catch {
      toast.error('Error');
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      const formData = new FormData();
      formData.append('isPublished', String(!post.isPublished));
      await api.upload(`/admin/blog/${post.id}`, formData, 'PUT');
      fetchPosts();
    } catch {
      toast.error('Error');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {th ? 'จัดการบทความ' : 'Blog Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} {th ? 'บทความ' : 'posts'}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-[#1E3A5F] text-white rounded-lg font-medium hover:bg-[#1E3A5F]/90 transition text-sm shadow-sm">
          <Plus className="w-4 h-4" /> {th ? 'เขียนบทความ' : 'New Post'}
        </button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder={th ? 'ค้นหาบทความ...' : 'Search posts...'} value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] outline-none transition text-sm" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'รูป' : 'Image'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'หัวข้อ' : 'Title'}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'สถานะ' : 'Status'}</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">{th ? 'จัดการ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {post.image ? (
                        <Image src={post.image} alt="" width={64} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-300" /></div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{th ? post.titleTh : post.titleEn}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{th ? post.excerptTh : post.excerptEn}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono">{post.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublished(post)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition ${post.isPublished ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}>
                      {post.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {post.isPublished ? (th ? 'เผยแพร่' : 'Published') : (th ? 'ฉบับร่าง' : 'Draft')}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(post)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><Edit className="w-4 h-4 text-gray-400" /></button>
                      <button onClick={() => handleDelete(post.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">{th ? 'ไม่พบบทความ' : 'No posts found'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 pt-[3vh] overflow-y-auto" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl w-full max-w-3xl shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {editingId ? (th ? 'แก้ไขบทความ' : 'Edit Post') : (th ? 'บทความใหม่' : 'New Post')}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{th ? 'รูปปก' : 'Cover Image'}</label>
                <div onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-gray-200 rounded-xl h-40 flex items-center justify-center cursor-pointer hover:border-[#1E3A5F]/40 transition group overflow-hidden">
                  {imagePreview ? (
                    <>
                      <Image src={imagePreview} alt="" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <p className="text-white text-sm font-medium">{th ? 'เปลี่ยนรูป' : 'Change Image'}</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">{th ? 'คลิกเพื่ออัปโหลดรูป' : 'Click to upload image'}</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'หัวข้อ (ไทย)' : 'Title (Thai)'} *</label>
                  <input value={form.titleTh} onChange={(e) => setForm({ ...form, titleTh: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'หัวข้อ (อังกฤษ)' : 'Title (English)'} *</label>
                  <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug *</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="how-to-choose-paint"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'แท็ก (คั่นด้วย ,)' : 'Tags (comma separated)'}</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="paint, tips, interior"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'คำอธิบายสั้น (ไทย)' : 'Excerpt (Thai)'}</label>
                  <textarea value={form.excerptTh} onChange={(e) => setForm({ ...form, excerptTh: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition text-sm resize-none" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'คำอธิบายสั้น (อังกฤษ)' : 'Excerpt (English)'}</label>
                  <textarea value={form.excerptEn} onChange={(e) => setForm({ ...form, excerptEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition text-sm resize-none" rows={2} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'เนื้อหา (ไทย)' : 'Content (Thai)'}</label>
                  <textarea value={form.contentTh} onChange={(e) => setForm({ ...form, contentTh: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition text-sm resize-none" rows={8} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{th ? 'เนื้อหา (อังกฤษ)' : 'Content (English)'}</label>
                  <textarea value={form.contentEn} onChange={(e) => setForm({ ...form, contentEn: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition text-sm resize-none" rows={8} />
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#1E3A5F] focus:ring-[#1E3A5F]" />
                <span className="text-sm font-medium text-gray-700">{th ? 'เผยแพร่ทันที' : 'Publish immediately'}</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">{th ? 'ยกเลิก' : 'Cancel'}</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium hover:bg-[#1E3A5F]/90 transition disabled:opacity-50">
                {saving ? (th ? 'กำลังบันทึก...' : 'Saving...') : (th ? 'บันทึก' : 'Save')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
