'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, RotateCcw } from 'lucide-react';
import { useLocale } from 'next-intl';
import { api } from '@/lib/api';

interface Product {
  id: number;
  nameTh: string;
  nameEn: string;
  brand: string | null;
  price: number;
  coverageArea: number | null;
  size: number | null;
}

interface CategoryData {
  id: number;
  nameTh: string;
  nameEn: string;
}

const DOOR_AREA = 1.8; // m² per door
const WINDOW_AREA = 1.2; // m² per window
const DEFAULT_COVERAGE = 10; // m² per liter

export default function CalculatorPage() {
  const t = useTranslations('calculator');
  const locale = useLocale();
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [doors, setDoors] = useState('1');
  const [windows, setWindows] = useState('2');
  const [coats, setCoats] = useState('2');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [calculated, setCalculated] = useState(false);

  useEffect(() => {
    api.get<{ success: boolean; data: { menuItems: Product[]; categories: CategoryData[] } }>('/menu')
      .then((res) => {
        if (res.data?.menuItems) setProducts(res.data.menuItems);
      })
      .catch(() => {});
  }, []);

  const result = useMemo(() => {
    if (!calculated) return null;
    const w = parseFloat(width) || 0;
    const l = parseFloat(length) || 0;
    const h = parseFloat(height) || 0;
    const d = parseInt(doors) || 0;
    const win = parseInt(windows) || 0;
    const c = parseInt(coats) || 1;

    if (w <= 0 || l <= 0 || h <= 0) return null;

    const perimeter = 2 * (w + l);
    const wallArea = perimeter * h;
    const openings = d * DOOR_AREA + win * WINDOW_AREA;
    const netArea = Math.max(wallArea - openings, 0);
    const totalArea = netArea * c;

    const coverage = selectedProduct?.coverageArea || DEFAULT_COVERAGE;
    const paintNeeded = totalArea / coverage;
    const canSize = selectedProduct?.size || 5;
    const cansNeeded = Math.ceil(paintNeeded / canSize);
    const estimatedCost = selectedProduct ? cansNeeded * selectedProduct.price : null;

    return { wallArea: netArea, totalArea, paintNeeded, cansNeeded, canSize, estimatedCost };
  }, [calculated, width, length, height, doors, windows, coats, selectedProduct]);

  const handleCalculate = () => setCalculated(true);
  const handleReset = () => {
    setWidth('');
    setLength('');
    setHeight('');
    setDoors('1');
    setWindows('2');
    setCoats('2');
    setSelectedProduct(null);
    setCalculated(false);
  };

  const getName = (p: Product) => locale === 'th' ? p.nameTh : p.nameEn;

  const formatNumber = (n: number, decimals = 1) => n.toFixed(decimals);
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US').format(n);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F] to-[#2EC4B6]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Calculator className="w-12 h-12 mx-auto mb-4 text-[#2EC4B6]" />
            <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              {t('title')}
            </h1>
            <p className="text-gray-200 text-lg">{t('subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6 md:p-8"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1.5">{t('room_width')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={width}
                    onChange={(e) => { setWidth(e.target.value); setCalculated(false); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20 outline-none transition text-[#1E293B]"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1.5">{t('room_length')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={length}
                    onChange={(e) => { setLength(e.target.value); setCalculated(false); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20 outline-none transition text-[#1E293B]"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1.5">{t('room_height')}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={height}
                    onChange={(e) => { setHeight(e.target.value); setCalculated(false); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20 outline-none transition text-[#1E293B]"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1.5">{t('coats')}</label>
                  <select
                    value={coats}
                    onChange={(e) => { setCoats(e.target.value); setCalculated(false); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20 outline-none transition text-[#1E293B]"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1.5">{t('doors')}</label>
                  <input
                    type="number"
                    min="0"
                    value={doors}
                    onChange={(e) => { setDoors(e.target.value); setCalculated(false); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20 outline-none transition text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-1.5">{t('windows')}</label>
                  <input
                    type="number"
                    min="0"
                    value={windows}
                    onChange={(e) => { setWindows(e.target.value); setCalculated(false); }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20 outline-none transition text-[#1E293B]"
                  />
                </div>
              </div>

              {/* Product Selector */}
              {products.length > 0 && (
                <div className="mt-5">
                  <label className="block text-sm font-medium text-[#1E293B] mb-1.5">
                    {t('result.select_product')}
                  </label>
                  <select
                    value={selectedProduct?.id || ''}
                    onChange={(e) => {
                      const p = products.find((pr) => pr.id === Number(e.target.value));
                      setSelectedProduct(p || null);
                      setCalculated(false);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/20 outline-none transition text-[#1E293B]"
                  >
                    <option value="">--</option>
                    {products.filter((p) => p.coverageArea).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.brand ? `[${p.brand}] ` : ''}{getName(p)} — {p.size || '?'}L — ฿{p.price}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCalculate}
                  className="flex-1 bg-[#1E3A5F] text-white py-3 rounded-xl font-medium hover:bg-[#1E3A5F]/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" /> {t('calculate')}
                </button>
                <button
                  onClick={handleReset}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> {t('reset')}
                </button>
              </div>
            </motion.div>

            {/* Result */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-[#1E293B] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
                {t('result.title')}
              </h2>

              {result ? (
                <div className="space-y-4">
                  <ResultRow label={t('result.wall_area')} value={`${formatNumber(result.wallArea)} ${t('result.sqm')}`} />
                  <ResultRow label={t('result.paint_needed')} value={`${formatNumber(result.paintNeeded)} ${t('result.liters')}`} highlight />
                  <ResultRow label={t('result.cans_needed')} value={`${result.cansNeeded} × ${result.canSize}L`} highlight />
                  {result.estimatedCost !== null && (
                    <ResultRow
                      label={t('result.estimated_cost')}
                      value={`฿${formatCurrency(result.estimatedCost)}`}
                      highlight
                      accent
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <Calculator className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-sm">{t('subtitle')}</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ResultRow({ label, value, highlight, accent }: { label: string; value: string; highlight?: boolean; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl ${highlight ? 'bg-[#1E3A5F]/5' : 'bg-gray-50'}`}>
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-lg font-bold ${accent ? 'text-[#2EC4B6]' : 'text-[#1E293B]'}`}>{value}</span>
    </div>
  );
}
