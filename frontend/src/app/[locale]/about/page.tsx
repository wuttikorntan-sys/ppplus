'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Beaker, Factory, Award, FlaskConical, Microscope } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';

interface TeamMember {
  image: string;
  nameTh: string;
  nameEn: string;
  roleTh: string;
  roleEn: string;
}

export default function AboutPage() {
  const t = useTranslations('about');
  const locale = useLocale();
  const [headerImg, setHeaderImg] = useState('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&h=600&fit=crop');
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    api.get<{ success: boolean; data: Record<string, { th: string; en: string }> }>('/site-content')
      .then((r) => {
        if (r.data?.['header.about']?.th) setHeaderImg(r.data['header.about'].th);
        const list: TeamMember[] = [];
        for (let i = 1; i <= 6; i++) {
          const img = r.data?.[`team.member${i}.image`]?.th;
          if (!img) continue;
          const nameRec = r.data?.[`team.member${i}.name`];
          const roleRec = r.data?.[`team.member${i}.role`];
          list.push({
            image: img,
            nameTh: nameRec?.th || '',
            nameEn: nameRec?.en || nameRec?.th || '',
            roleTh: roleRec?.th || '',
            roleEn: roleRec?.en || roleRec?.th || '',
          });
        }
        setMembers(list);
      })
      .catch(() => {});
  }, []);

  const values = [
    { icon: Target, key: 'quality' as const, color: 'bg-[#1C1C1E]' },
    { icon: Beaker, key: 'variety' as const, color: 'bg-[#F5841F]' },
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
        <img src={headerImg} alt="Automotive paint workshop" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1E]/85 to-[#F5841F]/50"></div>
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
            <h2 className="text-3xl font-bold text-[#2D2D2D] mb-8 text-center" style={{ fontFamily: 'var(--font-heading)' }}>{t('story.title')}</h2>
            <div className="space-y-6 text-[#64748B] text-lg leading-relaxed">
              <p>{t('story.p1')}</p>
              <p>{t('story.p2')}</p>
              <p>{t('story.p3')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 bg-white dark:bg-[#1C1C1E] text-[#2D2D2D] dark:text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center text-[#2D2D2D] dark:text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            {locale === 'th' ? 'ศักยภาพการผลิต' : 'Our Capabilities'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((cap, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-gray-50 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-100 dark:border-transparent">
                <div className="w-14 h-14 bg-[#F5841F] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <cap.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#2D2D2D] dark:text-white">{cap.title}</h3>
                <p className="text-gray-500 dark:text-white/70 text-sm">{cap.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#2D2D2D] mb-12 text-center" style={{ fontFamily: 'var(--font-heading)' }}>{t('values.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v, idx) => (
              <motion.div key={v.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className={`w-16 h-16 ${v.color} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                  <v.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#2D2D2D] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{t(`values.${v.key}.title`)}</h3>
                <p className="text-[#64748B]">{t(`values.${v.key}.text`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2D2D2D] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{t('team.title')}</h2>
            <p className="text-[#64748B] text-lg max-w-3xl mx-auto">{t('team.text')}</p>
          </motion.div>

          {members.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
              {members.map((m, idx) => {
                const name = locale === 'th' ? m.nameTh : m.nameEn;
                const role = locale === 'th' ? m.roleTh : m.roleEn;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="text-center"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mx-auto mb-4 bg-gray-100 relative shadow-sm">
                      <Image
                        src={m.image}
                        alt={name || `Team member ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    {name && (
                      <h3 className="text-base md:text-lg font-semibold text-[#2D2D2D]" style={{ fontFamily: 'var(--font-heading)' }}>
                        {name}
                      </h3>
                    )}
                    {role && (
                      <p className="text-[#F5841F] text-sm font-medium mt-1">{role}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden relative bg-[#1C1C1E]/10 flex items-center justify-center">
                <Factory className="w-12 h-12 text-[#1C1C1E]" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop', alt: 'Spray booth' },
              { src: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=400&h=400&fit=crop', alt: 'Car painting' },
              { src: 'https://images.unsplash.com/photo-1611288875785-d673e3e6547c?w=400&h=400&fit=crop', alt: 'Paint cans' },
              { src: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=400&fit=crop', alt: 'Color samples' },
              { src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop', alt: 'Finished car' },
              { src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=400&fit=crop', alt: 'Workshop team' },
              { src: 'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=400&h=400&fit=crop', alt: 'Paint spray equipment' },
              { src: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=400&fit=crop', alt: 'Auto body polishing' },
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
