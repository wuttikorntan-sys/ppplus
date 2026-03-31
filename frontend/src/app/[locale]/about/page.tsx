'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Beaker, Factory, Award, FlaskConical, Microscope } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  const t = useTranslations('about');
  const locale = useLocale();

  const values = [
    { icon: Target, key: 'quality' as const, color: 'bg-[#1E3A5F]' },
    { icon: Beaker, key: 'variety' as const, color: 'bg-[#2EC4B6]' },
    { icon: ShieldCheck, key: 'service' as const, color: 'bg-[#64748B]' },
  ];

  const capabilities = [
    {
      icon: FlaskConical,
      title: locale === 'th' ? 'ห้องปฏิบัติการ QC' : 'QC Laboratory',
      text: locale === 'th' ? 'ทดสอบคุณภาพสีทุก Batch ด้วยเครื่องมือมาตรฐาน ISO' : 'ISO-standard quality testing for every batch',
    },
    {
      icon: Microscope,
      title: locale === 'th' ? 'Spectrophotometer' : 'Spectrophotometer',
      text: locale === 'th' ? 'วัดค่าสีด้วย X-Rite เทียบ ΔE ≤ 1.0 ทุกสูตร' : 'X-Rite color measurement with ΔE ≤ 1.0 for every formula',
    },
    {
      icon: Factory,
      title: locale === 'th' ? 'โรงงานผลิต' : 'Manufacturing Plant',
      text: locale === 'th' ? 'ผลิตในประเทศไทย ควบคุมคุณภาพครบกระบวนการ' : 'Made in Thailand with full quality control process',
    },
    {
      icon: Award,
      title: locale === 'th' ? 'มาตรฐาน มอก.' : 'TIS Certified',
      text: locale === 'th' ? 'ผ่านการรับรองมาตรฐานอุตสาหกรรม' : 'Certified by Thai Industrial Standards Institute',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 text-white overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1920&h=600&fit=crop" alt="Automotive paint factory" fill className="object-cover" priority />
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

      {/* Capabilities */}
      <section className="py-20 bg-[#1E3A5F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
            {locale === 'th' ? 'ศักยภาพการผลิต' : 'Our Capabilities'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((cap, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="w-14 h-14 bg-[#2EC4B6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <cap.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{cap.title}</h3>
                <p className="text-white/70 text-sm">{cap.text}</p>
              </motion.div>
            ))}
          </div>
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
              <Factory className="w-12 h-12 text-[#1E3A5F]" />
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
              { src: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=400&fit=crop', alt: 'Auto body shop' },
              { src: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400&h=400&fit=crop', alt: 'Spray booth' },
              { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', alt: 'Paint mixing' },
              { src: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=400&h=400&fit=crop', alt: 'Color samples' },
              { src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop', alt: 'Finished car' },
              { src: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop', alt: 'Paint cans' },
              { src: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop', alt: 'Factory floor' },
              { src: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400&h=400&fit=crop', alt: 'Lab equipment' },
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
