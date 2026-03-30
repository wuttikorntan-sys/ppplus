'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Clock, Paintbrush, Palette, ShieldCheck, Truck, Navigation } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Popup from '@/components/Popup';
import GoogleReviews from '@/components/GoogleReviews';
import { api } from '@/lib/api';

interface ContentMap {
  [key: string]: { th: string; en: string };
}

const featuredItems = [
  { id: 1, nameTh: 'TOA 4 Seasons ภายนอก', nameEn: 'TOA 4 Seasons Exterior', price: 1850, image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop' },
  { id: 2, nameTh: 'Beger Cool All Plus', nameEn: 'Beger Cool All Plus', price: 2200, image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop' },
  { id: 3, nameTh: 'Jotun Essence สีภายใน', nameEn: 'Jotun Essence Interior', price: 1650, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop' },
  { id: 4, nameTh: 'Dulux Weathershield', nameEn: 'Dulux Weathershield', price: 2400, image: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=400&h=300&fit=crop' },
];

const defaultSlides: { type: 'video' | 'image'; src: string; poster?: string }[] = [
  { type: 'image', src: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1920&h=1080&fit=crop' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1920&h=1080&fit=crop' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=1080&fit=crop' },
  { type: 'image', src: 'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=1920&h=1080&fit=crop' },
];

interface HeroSlideData {
  id: number;
  type: 'image' | 'video';
  image: string | null;
  videoUrl: string | null;
  titleTh: string | null;
  titleEn: string | null;
  isActive: boolean;
  sortOrder: number;
}

const defaultContent: ContentMap = {
  'hero.title': { th: 'PP+', en: 'PP+' },
  'hero.subtitle': { th: 'ร้านขายสีครบวงจร', en: 'Complete Paint Solutions' },
  'hero.description': { th: 'ศูนย์รวมสีทาบ้านคุณภาพ จากแบรนด์ชั้นนำ TOA, Beger, Jotun, Dulux, Nippon พร้อมอุปกรณ์ทาสีครบครัน บริการผสมสีตามสั่ง', en: 'Premium paint center with top brands: TOA, Beger, Jotun, Dulux, Nippon. Full range of painting supplies with custom color mixing service.' },
  'hero.cta_menu': { th: 'ดูสินค้า', en: 'View Products' },
  'hero.cta_contact': { th: 'ติดต่อเรา', en: 'Contact Us' },
  'featured.title': { th: 'สินค้าขายดี', en: 'Best Sellers' },
  'featured.subtitle': { th: 'สีคุณภาพจากแบรนด์ชั้นนำที่ลูกค้าไว้วางใจ', en: 'Quality paints from trusted leading brands' },
  'welcome.tagline': { th: 'เกี่ยวกับเรา', en: 'About Us' },
  'welcome.title': { th: 'ผู้เชี่ยวชาญด้านสีครบวงจร', en: 'Your Complete Paint Expert' },
  'welcome.text': { th: 'PP+ เป็นศูนย์รวมสีทาบ้านและอุปกรณ์ทาสีครบวงจร ด้วยประสบการณ์กว่า 10 ปีในวงการสี เรามีทีมผู้เชี่ยวชาญพร้อมให้คำปรึกษาเรื่องสีและการทาสีอย่างมืออาชีพ', en: 'PP+ is a complete paint and painting supplies center. With over 10 years of experience, our team of experts provides professional paint consultation.' },
  'welcome.cta': { th: 'เรื่องราวของเรา', en: 'Our Story' },
  'welcome.years': { th: '10+', en: '10+' },
  'welcome.years_label': { th: 'ปี', en: 'Years' },
  'brands.tagline': { th: 'แบรนด์ชั้นนำ', en: 'Leading Brands' },
  'brands.title': { th: 'สีจากแบรนด์ที่คุณไว้วางใจ', en: 'Paint From Brands You Trust' },
  'brands.text1': { th: 'เราเป็นตัวแทนจำหน่ายอย่างเป็นทางการของแบรนด์สีชั้นนำ ทั้ง TOA, Beger, Jotun, Dulux และ Nippon Paint', en: 'We are an authorized dealer of leading paint brands including TOA, Beger, Jotun, Dulux, and Nippon Paint.' },
  'brands.text2': { th: 'สีทุกรุ่นพร้อมส่งทันที มีสต็อกอยู่ตลอด', en: 'All paint models ready for immediate delivery.' },
  'brands.cta': { th: 'ดูสินค้า', en: 'Browse Products' },
  'brands.badge': { th: '100%', en: '100%' },
  'brands.badge_label': { th: 'ของแท้', en: 'Genuine' },
  'services.tagline': { th: 'บริการของเรา', en: 'Our Services' },
  'services.title': { th: 'บริการครบวงจร', en: 'Complete Service Center' },
  'services.text1': { th: 'บริการผสมสีด้วยเครื่องผสมสีอัตโนมัติที่ทันสมัย สามารถผสมสีได้ตรงตามโทนที่ต้องการ', en: 'Color mixing with modern automatic machines, ensuring exact color matching.' },
  'services.text2': { th: 'พร้อมบริการจัดส่งถึงหน้างาน', en: 'Delivery service available.' },
  'services.cta': { th: 'ดูแกลเลอรี่', en: 'View Gallery' },
  'services.badge': { th: '5,000+', en: '5,000+' },
  'services.badge_label': { th: 'เฉดสี', en: 'Colors' },
  'experience.tagline': { th: 'ทำไมต้อง PP+', en: 'Why PP+' },
  'experience.title': { th: 'สิ่งที่ทำให้เราแตกต่าง', en: 'What Sets Us Apart' },
  'experience.card1_title': { th: 'สีคุณภาพ', en: 'Quality Paints' },
  'experience.card1_desc': { th: 'สีจากแบรนด์ชั้นนำ การันตีของแท้ คุณภาพมาตรฐาน', en: 'Paints from leading brands, guaranteed authentic' },
  'experience.card2_title': { th: 'ผสมสีตามสั่ง', en: 'Custom Mixing' },
  'experience.card2_desc': { th: 'บริการผสมสีด้วยเครื่องอัตโนมัติ ได้สีตรงตามต้องการ', en: 'Automatic color mixing for exact matching' },
  'experience.card3_title': { th: 'รับประกันคุณภาพ', en: 'Quality Guarantee' },
  'experience.card3_desc': { th: 'สินค้าทุกชิ้นรับประกันของแท้ เคลมได้หากมีปัญหา', en: 'All products guaranteed authentic with warranty' },
  'experience.card4_title': { th: 'จัดส่งรวดเร็ว', en: 'Fast Delivery' },
  'experience.card4_desc': { th: 'บริการจัดส่งถึงหน้างาน รวดเร็วทันใจ', en: 'Fast delivery right to your site' },
  'contact.title': { th: 'มาเยี่ยมเรา', en: 'Visit Us' },
  'contact.subtitle': { th: 'เรายินดีให้บริการคุณ', en: 'We are ready to serve you' },
  'location.address': { th: 'กรุงเทพมหานคร', en: 'Bangkok, Thailand' },
  'location.phone': { th: '02-XXX-XXXX', en: '02-XXX-XXXX' },
  'location.email': { th: 'info@PP+.co.th', en: 'info@PP+.co.th' },
  'location.hours_title': { th: 'เวลาทำการ', en: 'Opening Hours' },
  'location.hours1': { th: 'จันทร์ - เสาร์: 08:00 - 18:00', en: 'Mon - Sat: 8:00 AM - 6:00 PM' },
  'location.hours2': { th: 'อาทิตย์: 09:00 - 16:00', en: 'Sun: 9:00 AM - 4:00 PM' },
  'location.map_embed': { th: 'https://maps.google.com/maps?q=13.7563,100.5018&z=15&output=embed', en: 'https://maps.google.com/maps?q=13.7563,100.5018&z=15&output=embed' },
  'location.lat': { th: '13.7563', en: '13.7563' },
  'location.lng': { th: '100.5018', en: '100.5018' },
};

export default function HomePage() {
  const t = useTranslations('home');
  const params = useParams();
  const locale = (params.locale as string) || 'th';

  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState(defaultSlides);
  const [sc, setSc] = useState<ContentMap>(defaultContent);

  const c = (key: string) => {
    const val = sc[key];
    if (!val) return defaultContent[key]?.[locale === 'th' ? 'th' : 'en'] || '';
    const result = locale === 'th' ? val.th : val.en;
    if (!result) return defaultContent[key]?.[locale === 'th' ? 'th' : 'en'] || '';
    return result;
  };

  useEffect(() => {
    api.get<{ success: boolean; data: ContentMap }>('/site-content')
      .then((r) => {
        if (r.data) {
          const merged = { ...defaultContent };
          Object.entries(r.data).forEach(([key, val]) => {
            if (val.th || val.en) merged[key] = val;
          });
          setSc(merged);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get<{ success: boolean; data: HeroSlideData[] }>('/hero-slides')
      .then((r) => {
        if (r.data && r.data.length > 0) {
          const mapped = r.data.map((s) => ({
            type: s.type as 'image' | 'video',
            src: s.type === 'video' ? (s.videoUrl || '') : (s.image || ''),
            poster: s.type === 'video' && s.image ? s.image : undefined,
          }));
          setHeroSlides(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="overflow-x-hidden">
      <Popup locale={locale} />

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {heroSlides.map((slide, idx) => (
          <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 z-[1]' : 'opacity-0 z-0'}`}>
            {slide.type === 'video' ? (
              <video autoPlay loop muted playsInline poster={slide.poster} className="w-full h-full object-cover"><source src={slide.src} type="video/mp4" /></video>
            ) : (
              <Image src={slide.src} alt="PP+" fill className="object-cover" sizes="100vw" priority={idx === 0} />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F]/85 via-[#1E3A5F]/50 to-[#2EC4B6]/30 z-[2]" />
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all" aria-label="Previous"><ChevronLeft className="w-6 h-6" /></button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all" aria-label="Next"><ChevronRight className="w-6 h-6" /></button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-[#2EC4B6] w-8' : 'bg-white/50 hover:bg-white/80'}`} aria-label={`Slide ${idx + 1}`} />
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{c('hero.title')}</h1>
            <p className="text-xl md:text-2xl text-[#2EC4B6] font-medium mb-4 tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>{c('hero.subtitle')}</p>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">{c('hero.description')}</p>
            <div className="flex flex-row gap-3 justify-center px-4">
              <Link href="/menu" className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-[#2EC4B6] text-white font-semibold rounded-lg hover:bg-[#26a89c] transition-all transform hover:scale-105 text-sm sm:text-base">{c('hero.cta_menu')}</Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#1E3A5F] transition-all text-sm sm:text-base">{c('hero.cta_contact')}</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[#FAFAFA] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{c('featured.title')}</h2>
            <p className="text-[#64748B] text-lg">{c('featured.subtitle')}</p>
          </motion.div>
        </div>
        <div className="relative">
          <div className="flex animate-marquee">
            {[...featuredItems, ...featuredItems, ...featuredItems, ...featuredItems].map((item, idx) => (
              <div key={idx} className="flex-shrink-0 w-44 sm:w-72 mx-1.5 sm:mx-3">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="relative h-32 sm:h-48 w-full overflow-hidden">
                    <Image src={item.image} alt={item.nameEn} fill className="object-cover hover:scale-110 transition-transform duration-500" sizes="(max-width: 640px) 176px, 300px" />
                  </div>
                  <div className="p-3 sm:p-5">
                    <h3 className="font-semibold text-[#1E293B] text-center mb-1 text-sm sm:text-base" style={{ fontFamily: 'var(--font-heading)' }}>{locale === 'th' ? item.nameTh : item.nameEn}</h3>
                    <p className="text-[#2EC4B6] font-bold text-center text-base sm:text-lg">฿{item.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-10">
          <Link href="/menu" className="inline-flex items-center gap-2 text-[#1E3A5F] hover:text-[#2EC4B6] font-medium transition-colors">
            {locale === 'th' ? 'ดูสินค้าทั้งหมด' : 'View All Products'} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p className="text-[#2EC4B6] uppercase tracking-[0.3em] text-sm font-medium mb-3">{c('welcome.tagline')}</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{c('welcome.title')}</h2>
              <p className="text-[#64748B] leading-relaxed mb-8">{c('welcome.text')}</p>
              <Link href="/about" className="inline-flex items-center gap-2 text-[#1E3A5F] hover:text-[#2EC4B6] font-medium transition-colors">{c('welcome.cta')} <ArrowRight className="w-4 h-4" /></Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
              <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                <Image src="https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop" alt="Paint shop" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#1E3A5F] rounded-2xl flex items-center justify-center shadow-lg">
                <div className="text-center text-white">
                  <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{c('welcome.years')}</p>
                  <p className="text-xs uppercase tracking-wider">{c('welcome.years_label')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative order-1">
              <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                <Image src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop" alt="Paint brands" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#2EC4B6] rounded-2xl flex items-center justify-center shadow-lg">
                <div className="text-center text-white">
                  <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{c('brands.badge')}</p>
                  <p className="text-xs uppercase tracking-wider">{c('brands.badge_label')}</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="order-2">
              <p className="text-[#2EC4B6] uppercase tracking-[0.3em] text-sm font-medium mb-3">{c('brands.tagline')}</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{c('brands.title')}</h2>
              <p className="text-[#64748B] leading-relaxed mb-4">{c('brands.text1')}</p>
              <p className="text-[#64748B] leading-relaxed mb-8">{c('brands.text2')}</p>
              <Link href="/menu" className="inline-flex items-center gap-2 text-[#1E3A5F] hover:text-[#2EC4B6] font-medium transition-colors">{c('brands.cta')} <ArrowRight className="w-4 h-4" /></Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p className="text-[#2EC4B6] uppercase tracking-[0.3em] text-sm font-medium mb-3">{c('services.tagline')}</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>{c('services.title')}</h2>
              <p className="text-[#64748B] leading-relaxed mb-4">{c('services.text1')}</p>
              <p className="text-[#64748B] leading-relaxed mb-8">{c('services.text2')}</p>
              <Link href="/gallery" className="inline-flex items-center gap-2 text-[#1E3A5F] hover:text-[#2EC4B6] font-medium transition-colors">{c('services.cta')} <ArrowRight className="w-4 h-4" /></Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
              <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
                <Image src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop" alt="Paint service" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#1E3A5F] rounded-2xl flex items-center justify-center shadow-lg">
                <div className="text-center text-white">
                  <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{c('services.badge')}</p>
                  <p className="text-xs uppercase tracking-wider">{c('services.badge_label')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why PP+ */}
      <section className="py-20 bg-[#FAFAFA] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-[#1E3A5F] uppercase tracking-[0.3em] text-sm font-medium mb-3">{c('experience.tagline')}</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[#1E293B]" style={{ fontFamily: 'var(--font-heading)' }}>{c('experience.title')}</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Paintbrush, titleKey: 'experience.card1_title', descKey: 'experience.card1_desc' },
              { icon: Palette, titleKey: 'experience.card2_title', descKey: 'experience.card2_desc' },
              { icon: ShieldCheck, titleKey: 'experience.card3_title', descKey: 'experience.card3_desc' },
              { icon: Truck, titleKey: 'experience.card4_title', descKey: 'experience.card4_desc' },
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="text-center group bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-all">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-5 rounded-2xl bg-[#1E3A5F]/10 border border-[#1E3A5F]/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-5 h-5 sm:w-7 sm:h-7 text-[#1E3A5F]" />
                </div>
                <h3 className="text-sm sm:text-lg font-semibold text-[#1E293B] mb-1 sm:mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{c(item.titleKey)}</h3>
                <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed line-clamp-3">{c(item.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <GoogleReviews locale={locale} />

      {/* Contact / Map */}
      <section className="bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>{c('contact.title')}</h2>
            <p className="text-[#64748B] text-lg">{c('contact.subtitle')}</p>
          </motion.div>
          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="h-[350px] md:h-[400px]">
                <iframe src={c('location.map_embed')} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="PP+" />
              </div>
              <div className="p-3 border-t border-gray-100 flex justify-end">
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${c('location.lat')},${c('location.lng')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#2a4d75] transition-all text-sm">
                  <Navigation className="w-4 h-4" />{locale === 'th' ? 'นำทางไปร้าน' : 'Get Directions'}
                </a>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1E3A5F]/10 rounded-xl flex items-center justify-center shrink-0"><MapPin className="w-6 h-6 text-[#1E3A5F]" /></div>
                <div><h3 className="font-semibold text-[#1E293B] text-sm">{locale === 'th' ? 'ที่อยู่' : 'Address'}</h3><p className="text-[#64748B] text-sm">{c('location.address')}</p></div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-[#2EC4B6]/10 rounded-xl flex items-center justify-center shrink-0"><Phone className="w-6 h-6 text-[#2EC4B6]" /></div>
                <div><h3 className="font-semibold text-[#1E293B] text-sm">{locale === 'th' ? 'โทรศัพท์' : 'Phone'}</h3><p className="text-[#64748B] text-sm">{c('location.phone')}</p></div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1E3A5F]/10 rounded-xl flex items-center justify-center shrink-0"><Mail className="w-6 h-6 text-[#1E3A5F]" /></div>
                <div><h3 className="font-semibold text-[#1E293B] text-sm">{locale === 'th' ? 'อีเมล' : 'Email'}</h3><p className="text-[#64748B] text-sm">{c('location.email')}</p></div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-[#2EC4B6]/10 rounded-xl flex items-center justify-center shrink-0"><Clock className="w-6 h-6 text-[#2EC4B6]" /></div>
                <div>
                  <h3 className="font-semibold text-[#1E293B] text-sm">{c('location.hours_title')}</h3>
                  <p className="text-[#64748B] text-sm">{c('location.hours1')}</p>
                  <p className="text-[#64748B] text-sm">{c('location.hours2')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
