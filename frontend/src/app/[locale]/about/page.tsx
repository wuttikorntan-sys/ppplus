'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ShieldCheck, Palette, Truck } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  const t = useTranslations('about');

  const values = [
    { icon: ShieldCheck, key: 'quality' as const, color: 'bg-[#1E3A5F]' },
    { icon: Palette, key: 'variety' as const, color: 'bg-[#2EC4B6]' },
    { icon: Truck, key: 'service' as const, color: 'bg-[#64748B]' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 text-white overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1920&h=600&fit=crop" alt="Paint shop" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F]/85 to-[#2EC4B6]/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{t('title')}</h1>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-[#1E293B] mb-8 text-center" style={{ fontFamily: 'var(--font-heading)' }}>{t('story.title')}</h2>
            <div className="space-y-6 text-[#64748B] text-lg leading-relaxed">
              <p>{t('story.p1')}</p>
              <p>{t('story.p2')}</p>
              <p>{t('story.p3')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1E293B] mb-12 text-center" style={{ fontFamily: 'var(--font-heading)' }}>{t('values.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v, idx) => (
              <motion.div key={v.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className={`w-16 h-16 ${v.color} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                  <v.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#1E293B] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{t(`values.${v.key}.title`)}</h3>
                <p className="text-[#64748B]">{t(`values.${v.key}.text`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 relative bg-[#1E3A5F]/10 flex items-center justify-center">
              <Palette className="w-12 h-12 text-[#1E3A5F]" />
            </div>
            <h2 className="text-3xl font-bold text-[#1E293B] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{t('team.title')}</h2>
            <p className="text-[#64748B] text-lg">{t('team.text')}</p>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop', alt: 'Paint cans' },
              { src: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop', alt: 'Color mixing' },
              { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', alt: 'Wall painting' },
              { src: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=400&h=400&fit=crop', alt: 'Color palette' },
              { src: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=400&fit=crop', alt: 'Interior design' },
              { src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=400&fit=crop', alt: 'Modern room' },
              { src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', alt: 'Living room' },
              { src: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400&h=400&fit=crop', alt: 'Paint roller' },
            ].map((img, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                <Image src={img.src} alt={img.alt} fill className="object-cover hover:scale-110 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
