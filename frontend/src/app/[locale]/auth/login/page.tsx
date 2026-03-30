'use client';

import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Paintbrush } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from '@/i18n/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success(locale === 'th' ? 'เข้าสู่ระบบสำเร็จ' : 'Login successful');
      router.push(res?.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : locale === 'th' ? 'เข้าสู่ระบบไม่สำเร็จ' : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#1E3A5F] rounded-xl flex items-center justify-center">
              <Paintbrush className="w-8 h-8 text-[#2EC4B6]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('login.title')}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">{t('login.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">{t('login.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1E3A5F] text-white rounded-xl font-semibold hover:bg-[#1E3A5F]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {loading ? '...' : t('login.submit')}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
