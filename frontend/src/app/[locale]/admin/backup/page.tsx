'use client';

import { useLocale } from 'next-intl';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Download,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  HardDrive,
  Clock,
  ImageIcon,
  FolderArchive,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ConfirmDialog';

export default function BackupPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const confirm = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);
  const imgFileRef = useRef<HTMLInputElement>(null);

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [backupHistory, setBackupHistory] = useState<{ name: string; date: string; size: string }[]>([]);

  // Image backup states
  const [exportingImages, setExportingImages] = useState(false);
  const [importingImages, setImportingImages] = useState(false);
  const [selectedImgFile, setSelectedImgFile] = useState<File | null>(null);
  const [imgImportResult, setImgImportResult] = useState<{ success: boolean; message: string } | null>(null);

  /* ── Export / Backup ── */
  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/admin/backup', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Export failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `ppplus-backup-${timestamp}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupHistory((prev) => [
        {
          name: `ppplus-backup-${timestamp}.sql`,
          date: new Date().toLocaleString(th ? 'th-TH' : 'en-US'),
          size: `${(blob.size / 1024).toFixed(1)} KB`,
        },
        ...prev,
      ]);

      toast.success(th ? 'สำรองข้อมูลสำเร็จ' : 'Backup exported successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : th ? 'สำรองข้อมูลล้มเหลว' : 'Backup failed');
    } finally {
      setExporting(false);
    }
  };

  /* ── Import ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.name.endsWith('.sql')) {
      toast.error(th ? 'กรุณาเลือกไฟล์ .sql เท่านั้น' : 'Please select a .sql file only');
      return;
    }
    setSelectedFile(file);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    const ok = await confirm({
      title: th ? 'ยืนยันการนำเข้า' : 'Confirm import',
      message: th
        ? 'การนำเข้า SQL จะเขียนทับข้อมูลเดิม ต้องการดำเนินการต่อหรือไม่?'
        : 'Importing SQL will overwrite existing data. Continue?',
      confirmText: th ? 'นำเข้า' : 'Import',
      cancelText: th ? 'ยกเลิก' : 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;

    setImporting(true);
    setImportResult(null);
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setImportResult({ success: true, message: data.data.message });
        toast.success(th ? 'นำเข้าข้อมูลสำเร็จ' : 'Import successful');
        setSelectedFile(null);
        if (fileRef.current) fileRef.current.value = '';
      } else {
        setImportResult({ success: false, message: data.error });
        toast.error(data.error);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      setImportResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  /* ── Image Export ── */
  const handleExportImages = async () => {
    setExportingImages(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/admin/backup/images', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Image export failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `ppplus-images-${timestamp}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(th ? 'สำรองรูปภาพสำเร็จ' : 'Image backup exported successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : th ? 'สำรองรูปภาพล้มเหลว' : 'Image backup failed');
    } finally {
      setExportingImages(false);
    }
  };

  /* ── Image Import ── */
  const handleImgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.name.endsWith('.zip')) {
      toast.error(th ? 'กรุณาเลือกไฟล์ .zip เท่านั้น' : 'Please select a .zip file only');
      return;
    }
    setSelectedImgFile(file);
    setImgImportResult(null);
  };

  const handleImportImages = async () => {
    if (!selectedImgFile) return;

    const ok = await confirm({
      title: th ? 'ยืนยันการนำเข้า' : 'Confirm import',
      message: th
        ? 'การนำเข้ารูปภาพจากไฟล์ ZIP จะเขียนทับไฟล์ที่มีชื่อซ้ำกัน ต้องการดำเนินการต่อหรือไม่?'
        : 'Importing images will overwrite files with the same name. Continue?',
      confirmText: th ? 'นำเข้า' : 'Import',
      cancelText: th ? 'ยกเลิก' : 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;

    setImportingImages(true);
    setImgImportResult(null);
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', selectedImgFile);

      const res = await fetch('/api/admin/backup/images', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setImgImportResult({ success: true, message: data.data.message });
        toast.success(th ? 'นำเข้ารูปภาพสำเร็จ' : 'Image import successful');
        setSelectedImgFile(null);
        if (imgFileRef.current) imgFileRef.current.value = '';
      } else {
        setImgImportResult({ success: false, message: data.error });
        toast.error(data.error);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      setImgImportResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setImportingImages(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Database className="w-7 h-7 text-[#1C1C1E]" />
          {th ? 'สำรองและนำเข้าข้อมูล' : 'Backup & Import'}
        </h1>
        <p className="text-gray-500 mt-1">
          {th ? 'สำรองข้อมูลฐานข้อมูลเป็นไฟล์ SQL หรือนำเข้าจากไฟล์ SQL' : 'Export database backup as SQL or import from SQL file'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Backup / Export Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Download className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {th ? 'สำรองข้อมูล (Export)' : 'Backup (Export)'}
              </h2>
              <p className="text-sm text-gray-500">
                {th ? 'ดาวน์โหลดฐานข้อมูลทั้งหมดเป็นไฟล์ .sql' : 'Download full database as .sql file'}
              </p>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-2">
              <HardDrive className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">{th ? 'รวมข้อมูลทั้งหมด:' : 'Includes all data:'}</p>
                <ul className="mt-1 space-y-0.5 text-green-700">
                  <li>• {th ? 'ผู้ใช้งาน, สินค้า, หมวดหมู่' : 'Users, Products, Categories'}</li>
                  <li>• {th ? 'บทความ, แกลเลอรี่, สไลด์' : 'Blog posts, Gallery, Slides'}</li>
                  <li>• {th ? 'สูตรสี, ใบเสนอราคา, B2B' : 'Color formulas, Quotes, B2B'}</li>
                  <li>• {th ? 'การตั้งค่าเว็บไซต์ทั้งหมด' : 'All site settings'}</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {th ? 'กำลังสำรอง...' : 'Exporting...'}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {th ? 'ดาวน์โหลด Backup' : 'Download Backup'}
              </>
            )}
          </button>

          {/* Backup History */}
          {backupHistory.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {th ? 'ประวัติการสำรอง' : 'Backup History'}
              </h3>
              <div className="space-y-2">
                {backupHistory.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                      <span>{item.size}</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Import Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {th ? 'นำเข้าข้อมูล (Import)' : 'Import Database'}
              </h2>
              <p className="text-sm text-gray-500">
                {th ? 'นำเข้าจากไฟล์ .sql ที่สำรองไว้' : 'Import from a backed up .sql file'}
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">{th ? 'คำเตือน:' : 'Warning:'}</p>
                <p className="mt-1">
                  {th
                    ? 'การนำเข้าจะเขียนทับข้อมูลเดิม กรุณาสำรองข้อมูลก่อนนำเข้า'
                    : 'Importing will overwrite existing data. Please backup first before importing.'}
                </p>
              </div>
            </div>
          </div>

          {/* File Input */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors mb-4"
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            {selectedFile ? (
              <div>
                <p className="text-sm font-medium text-blue-600">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  {th ? 'คลิกเพื่อเลือกไฟล์ .sql' : 'Click to select .sql file'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {th ? 'รองรับเฉพาะไฟล์ .sql' : 'Only .sql files are supported'}
                </p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".sql"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <button
            onClick={handleImport}
            disabled={importing || !selectedFile}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {th ? 'กำลังนำเข้า...' : 'Importing...'}
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                {th ? 'นำเข้าข้อมูล' : 'Import SQL'}
              </>
            )}
          </button>

          {/* Result */}
          {importResult && (
            <div className={`mt-4 rounded-xl p-4 ${importResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-start gap-2">
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <p className={`text-sm ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {importResult.message}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Image Backup Section ── */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <ImageIcon className="w-6 h-6 text-[#1C1C1E]" />
          {th ? 'สำรองรูปภาพ' : 'Image Backup'}
        </h2>
        <p className="text-gray-500 mb-4">
          {th ? 'สำรองและนำเข้ารูปภาพที่อัพโหลดทั้งหมดเป็นไฟล์ ZIP' : 'Export and import all uploaded images as a ZIP file'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Image Export Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FolderArchive className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {th ? 'สำรองรูปภาพ (Export)' : 'Export Images'}
              </h2>
              <p className="text-sm text-gray-500">
                {th ? 'ดาวน์โหลดรูปภาพทั้งหมดเป็นไฟล์ .zip' : 'Download all images as .zip file'}
              </p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-2">
              <ImageIcon className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="text-sm text-purple-800">
                <p className="font-medium">{th ? 'รวมไฟล์ทั้งหมด:' : 'Includes all files:'}</p>
                <ul className="mt-1 space-y-0.5 text-purple-700">
                  <li>• {th ? 'รูปสินค้า, แกลเลอรี่' : 'Product images, Gallery'}</li>
                  <li>• {th ? 'รูป Hero Slides, บทความ' : 'Hero slides, Blog images'}</li>
                  <li>• {th ? 'ไฟล์ TDS (PDF)' : 'TDS files (PDF)'}</li>
                  <li>• {th ? 'รูปภาพอื่นๆ ที่อัพโหลด' : 'Other uploaded images'}</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportImages}
            disabled={exportingImages}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {exportingImages ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {th ? 'กำลังสำรองรูปภาพ...' : 'Exporting images...'}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {th ? 'ดาวน์โหลด Backup รูปภาพ' : 'Download Image Backup'}
              </>
            )}
          </button>
        </motion.div>

        {/* ── Image Import Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {th ? 'นำเข้ารูปภาพ (Import)' : 'Import Images'}
              </h2>
              <p className="text-sm text-gray-500">
                {th ? 'นำเข้าจากไฟล์ .zip ที่สำรองไว้' : 'Import from a backed up .zip file'}
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">{th ? 'คำเตือน:' : 'Warning:'}</p>
                <p className="mt-1">
                  {th
                    ? 'รูปภาพที่มีชื่อไฟล์ซ้ำกันจะถูกเขียนทับ'
                    : 'Files with the same name will be overwritten.'}
                </p>
              </div>
            </div>
          </div>

          {/* File Input */}
          <div
            onClick={() => imgFileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-colors mb-4"
          >
            <FolderArchive className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            {selectedImgFile ? (
              <div>
                <p className="text-sm font-medium text-orange-600">{selectedImgFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedImgFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  {th ? 'คลิกเพื่อเลือกไฟล์ .zip' : 'Click to select .zip file'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {th ? 'รองรับเฉพาะไฟล์ .zip (สูงสุด 100MB)' : 'Only .zip files supported (max 100MB)'}
                </p>
              </div>
            )}
            <input
              ref={imgFileRef}
              type="file"
              accept=".zip"
              onChange={handleImgFileChange}
              className="hidden"
            />
          </div>

          <button
            onClick={handleImportImages}
            disabled={importingImages || !selectedImgFile}
            className="w-full py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {importingImages ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {th ? 'กำลังนำเข้ารูปภาพ...' : 'Importing images...'}
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                {th ? 'นำเข้ารูปภาพ' : 'Import Images'}
              </>
            )}
          </button>

          {/* Result */}
          {imgImportResult && (
            <div className={`mt-4 rounded-xl p-4 ${imgImportResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-start gap-2">
                {imgImportResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <p className={`text-sm ${imgImportResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {imgImportResult.message}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
