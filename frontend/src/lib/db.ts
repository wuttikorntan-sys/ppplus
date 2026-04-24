/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql from 'mysql2/promise';

/* ───── connection pool ───── */
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? 'localhost',
  user: process.env.MYSQL_USER ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE ?? 'ppplus',
  waitForConnections: true,
  connectionLimit: 10,
  timezone: '+00:00',
});

/* ───── helpers ───── */
function toBool(v: unknown): boolean {
  return v === 1 || v === true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): any {
  const out: any = {};
  for (const [k, v] of Object.entries(row)) {
    if (v instanceof Date) out[k] = v.toISOString();
    else out[k] = v;
  }
  // boolean columns stored as TINYINT(1)
  for (const boolKey of [
    'isAvailable', 'isActive', 'isPublished', 'isApproved',
  ]) {
    if (boolKey in out) out[boolKey] = toBool(out[boolKey]);
  }
  // DECIMAL columns come as strings from mysql2 — convert to number
  for (const numKey of ['price', 'deltaE', 'amount', 'total', 'rating']) {
    if (numKey in out && typeof out[numKey] === 'string') {
      out[numKey] = Number(out[numKey]);
    }
  }
  return out;
}

function now(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

/* ───── interfaces (unchanged) ───── */
export interface UserRecord {
  id: number;
  email: string;
  password: string;
  name: string;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRecord {
  id: number;
  nameTh: string;
  nameEn: string;
  sortOrder: number;
  createdAt: string;
}

export interface MenuItemRecord {
  id: number;
  categoryId: number;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  price: number;
  image: string | null;
  isAvailable: boolean;
  sortOrder: number;
  brand: string | null;
  colorCode: string | null;
  colorName: string | null;
  finishType: string | null;
  coverageArea: number | null;
  size: string | null;
  unit: string | null;
  mixingRatio: string | null;
  applicationMethodTh: string | null;
  applicationMethodEn: string | null;
  featuresTh: string | null;
  featuresEn: string | null;
  tdsFile: string | null;
  sdsFile: string | null;
  videoUrl: string | null;
  specColor: string | null;
  specDensity: string | null;
  specFlashPoint: string | null;
  specPotLife: string | null;
  relatedProductIds: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostRecord {
  id: number;
  titleTh: string;
  titleEn: string;
  contentTh: string;
  contentEn: string;
  excerptTh: string;
  excerptEn: string;
  image: string | null;
  slug: string;
  tags: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRecord {
  id: number;
  userId: number;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PopupRecord {
  id: number;
  title: string;
  titleTh: string;
  description: string;
  descriptionTh: string;
  imageUrl: string | null;
  badge: string;
  tags: string;
  tagsTh: string;
  features: string;
  featuresTh: string;
  buttonText: string;
  buttonTextTh: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlideRecord {
  id: number;
  type: string;
  image: string | null;
  videoUrl: string | null;
  titleTh: string | null;
  titleEn: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImageRecord {
  id: number;
  image: string;
  category: string;
  labelTh: string | null;
  labelEn: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteContentRecord {
  id: number;
  key: string;
  valueTh: string;
  valueEn: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface ColorFormulaRecord {
  id: number;
  carBrand: string;
  colorCode: string;
  colorNameTh: string | null;
  colorNameEn: string | null;
  yearRange: string | null;
  formulaType: 'solid' | 'metallic' | 'pearl';
  deltaE: number | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface B2bApplicationRecord {
  id: number;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessType: string;
  province: string | null;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface QuoteRequestRecord {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  productId: number | null;
  productName: string | null;
  quantity: string | null;
  message: string | null;
  cartItems: string | null;
  status: 'pending' | 'quoted' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface OrderRecord {
  id: number;
  userId: number | null;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: string;
  orderType: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemRecord {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  price: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: number;
  orderId: number;
  method: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
}

export interface ReservationRecord {
  id: number;
  userId: number | null;
  name: string;
  email: string | null;
  phone: string;
  date: string;
  time: string;
  guests: number;
  notes: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface B2bDocumentRecord {
  id: number;
  nameTh: string;
  nameEn: string;
  filePath: string;
  fileSize: string;
  fileType: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ====================================================================
   db – MySQL implementation (same method signatures, now async)
   ==================================================================== */
export const db = {
  /* ── users ── */
  users: {
    async findMany(opts?: { orderBy?: string }): Promise<UserRecord[]> {
      const order = opts?.orderBy === 'createdAt:desc' ? 'ORDER BY createdAt DESC' : 'ORDER BY id ASC';
      const [rows] = await pool.query(`SELECT * FROM users ${order}`);
      return (rows as any[]).map(mapRow) as UserRecord[];
    },
    async findById(id: number): Promise<UserRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as UserRecord) : undefined;
    },
    async findByEmail(email: string): Promise<UserRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as UserRecord) : undefined;
    },
    async create(data: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRecord> {
      const ts = now();
      const [res] = await pool.query(
        `INSERT INTO users (email, password, name, phone, role, locale, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.email, data.password, data.name, data.phone, data.role, data.locale, ts, ts],
      );
      const id = (res as mysql.ResultSetHeader).insertId;
      return (await this.findById(id))!;
    },
    async update(id: number, data: Partial<UserRecord>): Promise<UserRecord | undefined> {
      const existing = await this.findById(id);
      if (!existing) return undefined;
      const fields: string[] = [];
      const vals: unknown[] = [];
      const allowed = ['email', 'password', 'name', 'phone', 'role', 'locale'] as const;
      for (const k of allowed) {
        if (k in data) { fields.push(`${k} = ?`); vals.push(data[k]); }
      }
      if (fields.length === 0) return existing;
      fields.push('updatedAt = ?'); vals.push(now());
      vals.push(id);
      await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, vals);
      return (await this.findById(id))!;
    },
    async count(): Promise<number> {
      const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM users');
      return (rows as any[])[0].cnt;
    },
  },

  /* ── categories ── */
  categories: {
    async findMany(): Promise<CategoryRecord[]> {
      const [rows] = await pool.query('SELECT * FROM categories ORDER BY sortOrder ASC');
      return (rows as any[]).map(mapRow) as CategoryRecord[];
    },
    async findById(id: number): Promise<CategoryRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as CategoryRecord) : undefined;
    },
    async create(data: Omit<CategoryRecord, 'id' | 'createdAt'>): Promise<CategoryRecord> {
      const ts = now();
      const [res] = await pool.query(
        'INSERT INTO categories (nameTh, nameEn, sortOrder, createdAt) VALUES (?, ?, ?, ?)',
        [data.nameTh, data.nameEn, data.sortOrder, ts],
      );
      const id = (res as mysql.ResultSetHeader).insertId;
      return (await this.findById(id))!;
    },
    async update(id: number, data: Partial<CategoryRecord>): Promise<CategoryRecord | undefined> {
      const existing = await this.findById(id);
      if (!existing) return undefined;
      const fields: string[] = [];
      const vals: unknown[] = [];
      for (const k of ['nameTh', 'nameEn', 'sortOrder'] as const) {
        if (k in data) { fields.push(`${k} = ?`); vals.push(data[k]); }
      }
      if (fields.length === 0) return existing;
      vals.push(id);
      await pool.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, vals);
      return (await this.findById(id))!;
    },
    async delete(id: number): Promise<boolean> {
      const [res] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
      return (res as mysql.ResultSetHeader).affectedRows > 0;
    },
    async count(): Promise<number> {
      const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM categories');
      return (rows as any[])[0].cnt;
    },
  },

  /* ── menuItems ── */
  menuItems: {
    async findMany(opts?: { where?: Partial<MenuItemRecord>; includeCategory?: boolean }): Promise<(MenuItemRecord & { category?: CategoryRecord })[]> {
      let sql = 'SELECT m.*, c.nameTh as catNameTh, c.nameEn as catNameEn, c.sortOrder as catSortOrder, c.createdAt as catCreatedAt FROM menu_items m LEFT JOIN categories c ON m.categoryId = c.id';
      const conditions: string[] = [];
      const vals: unknown[] = [];
      if (opts?.where) {
        for (const [k, v] of Object.entries(opts.where)) {
          conditions.push(`m.${k} = ?`);
          vals.push(v);
        }
      }
      if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
      sql += ' ORDER BY c.sortOrder ASC, m.sortOrder ASC';
      const [rows] = await pool.query(sql, vals);
      return (rows as any[]).map((row) => {
        const mapped = mapRow(row) as MenuItemRecord & { category?: CategoryRecord; catNameTh?: string; catNameEn?: string; catSortOrder?: number; catCreatedAt?: string };
        if (opts?.includeCategory && mapped.catNameTh != null) {
          mapped.category = {
            id: mapped.categoryId,
            nameTh: mapped.catNameTh!,
            nameEn: mapped.catNameEn!,
            sortOrder: mapped.catSortOrder!,
            createdAt: mapped.catCreatedAt!,
          };
        }
        delete mapped.catNameTh; delete mapped.catNameEn; delete mapped.catSortOrder; delete mapped.catCreatedAt;
        return mapped;
      });
    },
    async findById(id: number, includeCategory = false): Promise<(MenuItemRecord & { category?: CategoryRecord }) | undefined> {
      const [rows] = await pool.query('SELECT * FROM menu_items WHERE id = ? LIMIT 1', [id]);
      const arr = rows as any[];
      if (!arr.length) return undefined;
      const item = mapRow(arr[0]) as MenuItemRecord & { category?: CategoryRecord };
      if (includeCategory) {
        const [catRows] = await pool.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [item.categoryId]);
        const cats = catRows as unknown[];
        if (cats.length) item.category = mapRow(cats[0]) as CategoryRecord;
      }
      return item;
    },
    async create(data: Omit<MenuItemRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItemRecord> {
      const ts = now();
      const [res] = await pool.query(
        `INSERT INTO menu_items (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, image, isAvailable, sortOrder, brand, colorCode, colorName, finishType, coverageArea, size, unit, mixingRatio, applicationMethodTh, applicationMethodEn, featuresTh, featuresEn, tdsFile, sdsFile, videoUrl, specColor, specDensity, specFlashPoint, specPotLife, relatedProductIds, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.categoryId, data.nameTh, data.nameEn, data.descriptionTh, data.descriptionEn, data.price, data.image, data.isAvailable ? 1 : 0, data.sortOrder, data.brand, data.colorCode, data.colorName, data.finishType, data.coverageArea, data.size, data.unit, data.mixingRatio, data.applicationMethodTh, data.applicationMethodEn, data.featuresTh, data.featuresEn, data.tdsFile, data.sdsFile, data.videoUrl, data.specColor, data.specDensity, data.specFlashPoint, data.specPotLife, data.relatedProductIds, ts, ts],
      );
      const id = (res as mysql.ResultSetHeader).insertId;
      return (await this.findById(id)) as MenuItemRecord;
    },
    async update(id: number, data: Partial<MenuItemRecord>): Promise<MenuItemRecord | undefined> {
      const existing = await this.findById(id);
      if (!existing) return undefined;
      const fields: string[] = [];
      const vals: unknown[] = [];
      const allowed = ['categoryId', 'nameTh', 'nameEn', 'descriptionTh', 'descriptionEn', 'price', 'image', 'isAvailable', 'sortOrder', 'brand', 'colorCode', 'colorName', 'finishType', 'coverageArea', 'size', 'unit', 'mixingRatio', 'applicationMethodTh', 'applicationMethodEn', 'featuresTh', 'featuresEn', 'tdsFile', 'sdsFile', 'videoUrl', 'specColor', 'specDensity', 'specFlashPoint', 'specPotLife', 'relatedProductIds'] as const;
      for (const k of allowed) {
        if (k in data) {
          const v = data[k];
          fields.push(`${k} = ?`);
          vals.push(k === 'isAvailable' ? (v ? 1 : 0) : v);
        }
      }
      if (fields.length === 0) return existing;
      fields.push('updatedAt = ?'); vals.push(now()); vals.push(id);
      await pool.query(`UPDATE menu_items SET ${fields.join(', ')} WHERE id = ?`, vals);
      return (await this.findById(id)) as MenuItemRecord;
    },
    async delete(id: number): Promise<boolean> {
      const [res] = await pool.query('DELETE FROM menu_items WHERE id = ?', [id]);
      return (res as mysql.ResultSetHeader).affectedRows > 0;
    },
    async count(): Promise<number> {
      const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM menu_items');
      return (rows as any[])[0].cnt;
    },
  },

  /* ── popups ── */
  popups: {
    async findById(id: number): Promise<PopupRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM popups WHERE id = ? LIMIT 1', [id]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as PopupRecord) : undefined;
    },
    async findMany(opts?: { where?: Partial<PopupRecord> }): Promise<PopupRecord[]> {
      let sql = 'SELECT * FROM popups';
      const conditions: string[] = [];
      const vals: unknown[] = [];
      if (opts?.where) {
        for (const [k, v] of Object.entries(opts.where)) {
          conditions.push(`${k} = ?`);
          vals.push(v);
        }
      }
      if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
      sql += ' ORDER BY createdAt DESC';
      const [rows] = await pool.query(sql, vals);
      return (rows as any[]).map(mapRow) as PopupRecord[];
    },
    async create(data: Omit<PopupRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PopupRecord> {
      const ts = now();
      const [res] = await pool.query(
        `INSERT INTO popups (title, titleTh, description, descriptionTh, imageUrl, badge, tags, tagsTh, features, featuresTh, buttonText, buttonTextTh, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.title, data.titleTh, data.description, data.descriptionTh, data.imageUrl, data.badge, data.tags, data.tagsTh, data.features, data.featuresTh, data.buttonText, data.buttonTextTh, data.isActive ? 1 : 0, ts, ts],
      );
      const id = (res as mysql.ResultSetHeader).insertId;
      const [rows] = await pool.query('SELECT * FROM popups WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as any[])[0]) as PopupRecord;
    },
    async update(id: number, data: Partial<PopupRecord>): Promise<PopupRecord | undefined> {
      const [check] = await pool.query('SELECT id FROM popups WHERE id = ?', [id]);
      if (!(check as any[]).length) return undefined;
      const fields: string[] = [];
      const vals: unknown[] = [];
      const allowed = ['title', 'titleTh', 'description', 'descriptionTh', 'imageUrl', 'badge', 'tags', 'tagsTh', 'features', 'featuresTh', 'buttonText', 'buttonTextTh', 'isActive'] as const;
      for (const k of allowed) {
        if (k in data) {
          const v = data[k];
          fields.push(`${k} = ?`);
          vals.push(k === 'isActive' ? (v ? 1 : 0) : v);
        }
      }
      if (fields.length === 0) {
        const [rows] = await pool.query('SELECT * FROM popups WHERE id = ? LIMIT 1', [id]);
        return mapRow((rows as any[])[0]) as PopupRecord;
      }
      fields.push('updatedAt = ?'); vals.push(now()); vals.push(id);
      await pool.query(`UPDATE popups SET ${fields.join(', ')} WHERE id = ?`, vals);
      const [rows] = await pool.query('SELECT * FROM popups WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as any[])[0]) as PopupRecord;
    },
    async delete(id: number): Promise<boolean> {
      const [res] = await pool.query('DELETE FROM popups WHERE id = ?', [id]);
      return (res as mysql.ResultSetHeader).affectedRows > 0;
    },
  },

  /* ── heroSlides ── */
  heroSlides: {
    async findById(id: number): Promise<HeroSlideRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM hero_slides WHERE id = ? LIMIT 1', [id]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as HeroSlideRecord) : undefined;
    },
    async findMany(opts?: { where?: Partial<HeroSlideRecord> }): Promise<HeroSlideRecord[]> {
      let sql = 'SELECT * FROM hero_slides';
      const conditions: string[] = [];
      const vals: unknown[] = [];
      if (opts?.where) {
        for (const [k, v] of Object.entries(opts.where)) {
          conditions.push(`${k} = ?`);
          vals.push(v);
        }
      }
      if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
      sql += ' ORDER BY sortOrder ASC';
      const [rows] = await pool.query(sql, vals);
      return (rows as any[]).map(mapRow) as HeroSlideRecord[];
    },
    async create(data: Omit<HeroSlideRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<HeroSlideRecord> {
      const ts = now();
      const [res] = await pool.query(
        `INSERT INTO hero_slides (type, image, videoUrl, titleTh, titleEn, isActive, sortOrder, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.type, data.image, data.videoUrl, data.titleTh, data.titleEn, data.isActive ? 1 : 0, data.sortOrder, ts, ts],
      );
      const id = (res as mysql.ResultSetHeader).insertId;
      const [rows] = await pool.query('SELECT * FROM hero_slides WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as any[])[0]) as HeroSlideRecord;
    },
    async update(id: number, data: Partial<HeroSlideRecord>): Promise<HeroSlideRecord | undefined> {
      const [check] = await pool.query('SELECT id FROM hero_slides WHERE id = ?', [id]);
      if (!(check as any[]).length) return undefined;
      const fields: string[] = [];
      const vals: unknown[] = [];
      const allowed = ['type', 'image', 'videoUrl', 'titleTh', 'titleEn', 'isActive', 'sortOrder'] as const;
      for (const k of allowed) {
        if (k in data) {
          const v = data[k];
          fields.push(`${k} = ?`);
          vals.push(k === 'isActive' ? (v ? 1 : 0) : v);
        }
      }
      if (fields.length === 0) {
        const [rows] = await pool.query('SELECT * FROM hero_slides WHERE id = ? LIMIT 1', [id]);
        return mapRow((rows as any[])[0]) as HeroSlideRecord;
      }
      fields.push('updatedAt = ?'); vals.push(now()); vals.push(id);
      await pool.query(`UPDATE hero_slides SET ${fields.join(', ')} WHERE id = ?`, vals);
      const [rows] = await pool.query('SELECT * FROM hero_slides WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as any[])[0]) as HeroSlideRecord;
    },
    async delete(id: number): Promise<boolean> {
      const [res] = await pool.query('DELETE FROM hero_slides WHERE id = ?', [id]);
      return (res as mysql.ResultSetHeader).affectedRows > 0;
    },
  },

  /* ── galleryImages ── */
  galleryImages: {
    async findById(id: number): Promise<GalleryImageRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM gallery_images WHERE id = ? LIMIT 1', [id]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as GalleryImageRecord) : undefined;
    },
    async findMany(opts?: { where?: Partial<GalleryImageRecord> }): Promise<GalleryImageRecord[]> {
      let sql = 'SELECT * FROM gallery_images';
      const conditions: string[] = [];
      const vals: unknown[] = [];
      if (opts?.where) {
        for (const [k, v] of Object.entries(opts.where)) {
          conditions.push(`${k} = ?`);
          vals.push(v);
        }
      }
      if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
      sql += ' ORDER BY sortOrder ASC';
      const [rows] = await pool.query(sql, vals);
      return (rows as any[]).map(mapRow) as GalleryImageRecord[];
    },
    async create(data: Omit<GalleryImageRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<GalleryImageRecord> {
      const ts = now();
      const [res] = await pool.query(
        `INSERT INTO gallery_images (image, category, labelTh, labelEn, sortOrder, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.image, data.category, data.labelTh, data.labelEn, data.sortOrder, data.isActive ? 1 : 0, ts, ts],
      );
      const id = (res as mysql.ResultSetHeader).insertId;
      const [rows] = await pool.query('SELECT * FROM gallery_images WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as any[])[0]) as GalleryImageRecord;
    },
    async update(id: number, data: Partial<GalleryImageRecord>): Promise<GalleryImageRecord | undefined> {
      const [check] = await pool.query('SELECT id FROM gallery_images WHERE id = ?', [id]);
      if (!(check as any[]).length) return undefined;
      const fields: string[] = [];
      const vals: unknown[] = [];
      const allowed = ['image', 'category', 'labelTh', 'labelEn', 'sortOrder', 'isActive'] as const;
      for (const k of allowed) {
        if (k in data) {
          const v = data[k];
          fields.push(`${k} = ?`);
          vals.push(k === 'isActive' ? (v ? 1 : 0) : v);
        }
      }
      if (fields.length === 0) {
        const [rows] = await pool.query('SELECT * FROM gallery_images WHERE id = ? LIMIT 1', [id]);
        return mapRow((rows as any[])[0]) as GalleryImageRecord;
      }
      fields.push('updatedAt = ?'); vals.push(now()); vals.push(id);
      await pool.query(`UPDATE gallery_images SET ${fields.join(', ')} WHERE id = ?`, vals);
      const [rows] = await pool.query('SELECT * FROM gallery_images WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as any[])[0]) as GalleryImageRecord;
    },
    async delete(id: number): Promise<boolean> {
      const [res] = await pool.query('DELETE FROM gallery_images WHERE id = ?', [id]);
      return (res as mysql.ResultSetHeader).affectedRows > 0;
    },
  },

  /* ── siteContents ── */
  siteContents: {
    async findMany(): Promise<SiteContentRecord[]> {
      const [rows] = await pool.query('SELECT * FROM site_contents ORDER BY `key` ASC');
      return (rows as any[]).map(mapRow) as SiteContentRecord[];
    },
    async findByKey(key: string): Promise<SiteContentRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM site_contents WHERE `key` = ? LIMIT 1', [key]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as SiteContentRecord) : undefined;
    },
    async upsert(data: { key: string; valueTh: string; valueEn: string; type?: string }): Promise<SiteContentRecord> {
      const ts = now();
      await pool.query(
        `INSERT INTO site_contents (\`key\`, valueTh, valueEn, type, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE valueTh = VALUES(valueTh), valueEn = VALUES(valueEn), type = VALUES(type), updatedAt = VALUES(updatedAt)`,
        [data.key, data.valueTh, data.valueEn, data.type || 'text', ts, ts],
      );
      return (await this.findByKey(data.key))!;
    },
  },

  /* ── reviews ── */
  reviews: {
    async findMany(opts?: { where?: Partial<ReviewRecord> }): Promise<(ReviewRecord & { user?: { id: number; name: string; email: string } })[]> {
      let sql = 'SELECT r.*, u.id as uid, u.name as uname, u.email as uemail FROM reviews r LEFT JOIN users u ON r.userId = u.id';
      const conditions: string[] = [];
      const vals: unknown[] = [];
      if (opts?.where) {
        for (const [k, v] of Object.entries(opts.where)) {
          conditions.push(`r.${k} = ?`);
          vals.push(v);
        }
      }
      if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
      sql += ' ORDER BY r.createdAt DESC';
      const [rows] = await pool.query(sql, vals);
      return (rows as any[]).map((row) => {
        const mapped = mapRow(row) as ReviewRecord & { user?: { id: number; name: string; email: string }; uid?: number; uname?: string; uemail?: string };
        if (mapped.uid) {
          mapped.user = { id: mapped.uid, name: mapped.uname!, email: mapped.uemail! };
        }
        delete mapped.uid; delete mapped.uname; delete mapped.uemail;
        return mapped;
      });
    },
    async create(data: Omit<ReviewRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReviewRecord> {
      const ts = now();
      const [res] = await pool.query(
        'INSERT INTO reviews (userId, rating, comment, isApproved, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [data.userId, data.rating, data.comment, data.isApproved ? 1 : 0, ts, ts],
      );
      const id = (res as mysql.ResultSetHeader).insertId;
      const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as any[])[0]) as ReviewRecord;
    },
    async update(id: number, data: Partial<ReviewRecord>): Promise<ReviewRecord | undefined> {
      const [check] = await pool.query('SELECT id FROM reviews WHERE id = ?', [id]);
      if (!(check as any[]).length) return undefined;
      const fields: string[] = [];
      const vals: unknown[] = [];
      for (const k of ['userId', 'rating', 'comment', 'isApproved'] as const) {
        if (k in data) {
          const v = data[k];
          fields.push(`${k} = ?`);
          vals.push(k === 'isApproved' ? (v ? 1 : 0) : v);
        }
      }
      if (fields.length === 0) {
        const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ? LIMIT 1', [id]);
        return mapRow((rows as any[])[0]) as ReviewRecord;
      }
      fields.push('updatedAt = ?'); vals.push(now()); vals.push(id);
      await pool.query(`UPDATE reviews SET ${fields.join(', ')} WHERE id = ?`, vals);
      const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as any[])[0]) as ReviewRecord;
    },
    async delete(id: number): Promise<boolean> {
      const [res] = await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
      return (res as mysql.ResultSetHeader).affectedRows > 0;
    },
  },

  /* ── blogPosts ── */
  blogPosts: {
    async findMany(opts?: { where?: Partial<BlogPostRecord> }): Promise<BlogPostRecord[]> {
      let sql = 'SELECT * FROM blog_posts';
      const conditions: string[] = [];
      const vals: unknown[] = [];
      if (opts?.where) {
        for (const [k, v] of Object.entries(opts.where)) {
          conditions.push(`${k} = ?`);
          vals.push(v);
        }
      }
      if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
      sql += ' ORDER BY createdAt DESC';
      const [rows] = await pool.query(sql, vals);
      return (rows as any[]).map(mapRow) as BlogPostRecord[];
    },
    async findById(id: number): Promise<BlogPostRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM blog_posts WHERE id = ? LIMIT 1', [id]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as BlogPostRecord) : undefined;
    },
    async findBySlug(slug: string): Promise<BlogPostRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM blog_posts WHERE slug = ? LIMIT 1', [slug]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as BlogPostRecord) : undefined;
    },
    async create(data: Omit<BlogPostRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPostRecord> {
      const ts = now();
      const [res] = await pool.query(
        `INSERT INTO blog_posts (titleTh, titleEn, contentTh, contentEn, excerptTh, excerptEn, image, slug, tags, isPublished, publishedAt, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.titleTh, data.titleEn, data.contentTh, data.contentEn, data.excerptTh, data.excerptEn, data.image, data.slug, data.tags, data.isPublished ? 1 : 0, data.publishedAt, ts, ts],
      );
      const id = (res as mysql.ResultSetHeader).insertId;
      return (await this.findById(id))!;
    },
    async update(id: number, data: Partial<BlogPostRecord>): Promise<BlogPostRecord | undefined> {
      const existing = await this.findById(id);
      if (!existing) return undefined;
      const fields: string[] = [];
      const vals: unknown[] = [];
      const allowed = ['titleTh', 'titleEn', 'contentTh', 'contentEn', 'excerptTh', 'excerptEn', 'image', 'slug', 'tags', 'isPublished', 'publishedAt'] as const;
      for (const k of allowed) {
        if (k in data) {
          const v = data[k];
          fields.push(`${k} = ?`);
          vals.push(k === 'isPublished' ? (v ? 1 : 0) : v);
        }
      }
      if (fields.length === 0) return existing;
      fields.push('updatedAt = ?'); vals.push(now()); vals.push(id);
      await pool.query(`UPDATE blog_posts SET ${fields.join(', ')} WHERE id = ?`, vals);
      return (await this.findById(id))!;
    },
    async delete(id: number): Promise<boolean> {
      const [res] = await pool.query('DELETE FROM blog_posts WHERE id = ?', [id]);
      return (res as mysql.ResultSetHeader).affectedRows > 0;
    },
    async count(): Promise<number> {
      const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM blog_posts');
      return (rows as any[])[0].cnt;
    },
  },

  /* ── colorFormulas ── */
  colorFormulas: {
    async findMany(opts?: { where?: Record<string, unknown> }): Promise<ColorFormulaRecord[]> {
      let sql = 'SELECT * FROM color_formulas';
      const conditions: string[] = [];
      const vals: unknown[] = [];
      if (opts?.where) {
        for (const [k, v] of Object.entries(opts.where)) {
          if (k === 'search' && typeof v === 'string' && v) {
            conditions.push('(carBrand LIKE ? OR colorCode LIKE ? OR colorNameTh LIKE ? OR colorNameEn LIKE ?)');
            const sv = `%${v}%`;
            vals.push(sv, sv, sv, sv);
          } else {
            conditions.push(`${k} = ?`);
            vals.push(v);
          }
        }
      }
      if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
      sql += ' ORDER BY carBrand ASC, colorCode ASC';
      const [rows] = await pool.query(sql, vals);
      return (rows as any[]).map(mapRow) as ColorFormulaRecord[];
    },
    async findById(id: number): Promise<ColorFormulaRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM color_formulas WHERE id = ? LIMIT 1', [id]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as ColorFormulaRecord) : undefined;
    },
    async create(data: Omit<ColorFormulaRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ColorFormulaRecord> {
      const ts = now();
      const [res] = await pool.query(
        'INSERT INTO color_formulas (carBrand, colorCode, colorNameTh, colorNameEn, yearRange, formulaType, deltaE, image, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.carBrand, data.colorCode, data.colorNameTh, data.colorNameEn, data.yearRange, data.formulaType, data.deltaE, data.image, data.isActive ? 1 : 0, ts, ts],
      );
      const id = (res as mysql.ResultSetHeader).insertId;
      return (await this.findById(id))!;
    },
    async update(id: number, data: Partial<ColorFormulaRecord>): Promise<ColorFormulaRecord | undefined> {
      const existing = await this.findById(id);
      if (!existing) return undefined;
      const fields: string[] = [];
      const vals: unknown[] = [];
      const allowed = ['carBrand', 'colorCode', 'colorNameTh', 'colorNameEn', 'yearRange', 'formulaType', 'deltaE', 'image', 'isActive'] as const;
      for (const k of allowed) {
        if (k in data) {
          const v = data[k];
          fields.push(`${k} = ?`);
          vals.push(k === 'isActive' ? (v ? 1 : 0) : v);
        }
      }
      if (fields.length === 0) return existing;
      fields.push('updatedAt = ?'); vals.push(now()); vals.push(id);
      await pool.query(`UPDATE color_formulas SET ${fields.join(', ')} WHERE id = ?`, vals);
      return (await this.findById(id))!;
    },
    async delete(id: number): Promise<boolean> {
      const [res] = await pool.query('DELETE FROM color_formulas WHERE id = ?', [id]);
      return (res as mysql.ResultSetHeader).affectedRows > 0;
    },
    async getBrands(): Promise<string[]> {
      const [rows] = await pool.query('SELECT DISTINCT carBrand FROM color_formulas WHERE isActive = 1 ORDER BY carBrand ASC');
      return (rows as any[]).map((r: any) => r.carBrand);
    },
  },

  /* ── b2bApplications ── */
  b2bApplications: {
    async findById(id: number): Promise<B2bApplicationRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM b2b_applications WHERE id = ? LIMIT 1', [id]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as B2bApplicationRecord) : undefined;
    },
    async findMany(): Promise<B2bApplicationRecord[]> {
      const [rows] = await pool.query('SELECT * FROM b2b_applications ORDER BY createdAt DESC');
      return (rows as any[]).map(mapRow) as B2bApplicationRecord[];
    },
    async create(data: Omit<B2bApplicationRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<B2bApplicationRecord> {
      const ts = now();
      const [res] = await pool.query(
        'INSERT INTO b2b_applications (companyName, contactPerson, phone, email, businessType, province, message, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.companyName, data.contactPerson, data.phone, data.email, data.businessType, data.province, data.message, ts, ts],
      );
      const id = (res as mysql.ResultSetHeader).insertId;
      const [rows] = await pool.query('SELECT * FROM b2b_applications WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as any[])[0]) as B2bApplicationRecord;
    },
    async update(id: number, data: Partial<B2bApplicationRecord>): Promise<B2bApplicationRecord | undefined> {
      const [check] = await pool.query('SELECT id FROM b2b_applications WHERE id = ?', [id]);
      if (!(check as any[]).length) return undefined;
      const fields: string[] = [];
      const vals: unknown[] = [];
      if ('status' in data) { fields.push('status = ?'); vals.push(data.status); }
      if (fields.length === 0) {
        const [rows] = await pool.query('SELECT * FROM b2b_applications WHERE id = ? LIMIT 1', [id]);
        return mapRow((rows as any[])[0]) as B2bApplicationRecord;
      }
      fields.push('updatedAt = ?'); vals.push(now()); vals.push(id);
      await pool.query(`UPDATE b2b_applications SET ${fields.join(', ')} WHERE id = ?`, vals);
      const [rows] = await pool.query('SELECT * FROM b2b_applications WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as any[])[0]) as B2bApplicationRecord;
    },
  },

  /* ── quoteRequests ── */
  quoteRequests: {
    async findById(id: number): Promise<QuoteRequestRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM quote_requests WHERE id = ? LIMIT 1', [id]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as QuoteRequestRecord) : undefined;
    },
    async findMany(): Promise<QuoteRequestRecord[]> {
      const [rows] = await pool.query('SELECT * FROM quote_requests ORDER BY createdAt DESC');
      return (rows as any[]).map(mapRow) as QuoteRequestRecord[];
    },
    async create(data: Omit<QuoteRequestRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<QuoteRequestRecord> {
      const ts = now();
      const [res] = await pool.query(
        'INSERT INTO quote_requests (name, phone, email, company, productId, productName, quantity, message, cartItems, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.name, data.phone, data.email, data.company, data.productId, data.productName, data.quantity, data.message, data.cartItems, ts, ts],
      );
      const id = (res as mysql.ResultSetHeader).insertId;
      const [rows] = await pool.query('SELECT * FROM quote_requests WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as any[])[0]) as QuoteRequestRecord;
    },
    async update(id: number, data: Partial<QuoteRequestRecord>): Promise<QuoteRequestRecord | undefined> {
      const [check] = await pool.query('SELECT id FROM quote_requests WHERE id = ?', [id]);
      if (!(check as any[]).length) return undefined;
      const fields: string[] = [];
      const vals: unknown[] = [];
      if ('status' in data) { fields.push('status = ?'); vals.push(data.status); }
      if (fields.length === 0) {
        const [rows] = await pool.query('SELECT * FROM quote_requests WHERE id = ? LIMIT 1', [id]);
        return mapRow((rows as any[])[0]) as QuoteRequestRecord;
      }
      fields.push('updatedAt = ?'); vals.push(now()); vals.push(id);
      await pool.query(`UPDATE quote_requests SET ${fields.join(', ')} WHERE id = ?`, vals);
      const [rows] = await pool.query('SELECT * FROM quote_requests WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as any[])[0]) as QuoteRequestRecord;
    },
  },

  /* ── orders ── */
  orders: {
    async findMany(opts?: { where?: { status?: string } }): Promise<any[]> {
      let sql = `SELECT o.*, u.name as userName, u.email as userEmail FROM orders o LEFT JOIN users u ON o.userId = u.id`;
      const conditions: string[] = [];
      const vals: unknown[] = [];
      if (opts?.where?.status) {
        conditions.push('o.status = ?');
        vals.push(opts.where.status);
      }
      if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
      sql += ' ORDER BY o.createdAt DESC';
      const [rows] = await pool.query(sql, vals);
      const orders = (rows as any[]).map(mapRow);

      // attach items and payment for each order
      for (const order of orders) {
        const [itemRows] = await pool.query(
          `SELECT oi.*, mi.nameTh, mi.nameEn FROM order_items oi LEFT JOIN menu_items mi ON oi.menuItemId = mi.id WHERE oi.orderId = ?`,
          [order.id],
        );
        order.items = (itemRows as any[]).map((r: any) => ({
          id: r.id,
          quantity: r.quantity,
          price: r.price?.toString() ?? '0',
          menuItem: { nameTh: r.nameTh || '', nameEn: r.nameEn || '' },
        }));

        const [payRows] = await pool.query('SELECT * FROM payments WHERE orderId = ? LIMIT 1', [order.id]);
        const pays = payRows as any[];
        order.payment = pays.length ? { method: pays[0].method, status: pays[0].status } : null;
        order.user = order.userName ? { name: order.userName, email: order.userEmail } : null;
        order.totalAmount = order.totalAmount?.toString() ?? '0';
        delete order.userName;
        delete order.userEmail;
      }
      return orders;
    },
    async findById(id: number): Promise<OrderRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as OrderRecord) : undefined;
    },
    async create(data: { userId?: number | null; totalAmount: number; orderType?: string; items: { menuItemId: number; quantity: number; price: number }[]; paymentMethod?: string }): Promise<OrderRecord> {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const ts = now();
        const [res] = await conn.query(
          'INSERT INTO orders (userId, totalAmount, orderType, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
          [data.userId ?? null, data.totalAmount, data.orderType || 'ONLINE', ts, ts],
        );
        const orderId = (res as mysql.ResultSetHeader).insertId;
        for (const item of data.items) {
          await conn.query(
            'INSERT INTO order_items (orderId, menuItemId, quantity, price, createdAt) VALUES (?, ?, ?, ?, ?)',
            [orderId, item.menuItemId, item.quantity, item.price, ts],
          );
        }
        if (data.paymentMethod) {
          await conn.query(
            'INSERT INTO payments (orderId, method, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
            [orderId, data.paymentMethod, ts, ts],
          );
        }
        await conn.commit();
        return (await this.findById(orderId))!;
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    },
    async updateStatus(id: number, status: string): Promise<OrderRecord | undefined> {
      const [check] = await pool.query('SELECT id FROM orders WHERE id = ?', [id]);
      if (!(check as any[]).length) return undefined;
      await pool.query('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?', [status, now(), id]);
      return (await this.findById(id))!;
    },
    async count(): Promise<number> {
      const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM orders');
      return (rows as any[])[0].cnt;
    },
  },

  /* ── reservations ── */
  reservations: {
    async findMany(opts?: { where?: { status?: string } }): Promise<any[]> {
      let sql = `SELECT r.*, u.name as userName, u.email as userEmail FROM reservations r LEFT JOIN users u ON r.userId = u.id`;
      const conditions: string[] = [];
      const vals: unknown[] = [];
      if (opts?.where?.status) {
        conditions.push('r.status = ?');
        vals.push(opts.where.status);
      }
      if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
      sql += ' ORDER BY r.date DESC, r.time DESC';
      const [rows] = await pool.query(sql, vals);
      return (rows as any[]).map((row: any) => {
        const mapped = mapRow(row);
        mapped.user = mapped.userName ? { name: mapped.userName, email: mapped.userEmail } : null;
        delete mapped.userName;
        delete mapped.userEmail;
        return mapped;
      });
    },
    async findById(id: number): Promise<ReservationRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM reservations WHERE id = ? LIMIT 1', [id]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as ReservationRecord) : undefined;
    },
    async create(data: Omit<ReservationRecord, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<ReservationRecord> {
      const ts = now();
      const [res] = await pool.query(
        'INSERT INTO reservations (userId, name, email, phone, date, time, guests, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.userId, data.name, data.email, data.phone, data.date, data.time, data.guests, data.notes, ts, ts],
      );
      const id = (res as mysql.ResultSetHeader).insertId;
      return (await this.findById(id))!;
    },
    async updateStatus(id: number, status: string): Promise<ReservationRecord | undefined> {
      const [check] = await pool.query('SELECT id FROM reservations WHERE id = ?', [id]);
      if (!(check as any[]).length) return undefined;
      await pool.query('UPDATE reservations SET status = ?, updatedAt = ? WHERE id = ?', [status, now(), id]);
      return (await this.findById(id))!;
    },
    async count(): Promise<number> {
      const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM reservations');
      return (rows as any[])[0].cnt;
    },
  },

  /* ── B2B documents ── */
  b2bDocuments: {
    async findMany(activeOnly = false): Promise<B2bDocumentRecord[]> {
      const where = activeOnly ? 'WHERE isActive = 1' : '';
      const [rows] = await pool.query(`SELECT * FROM b2b_documents ${where} ORDER BY sortOrder ASC, createdAt DESC`);
      return (rows as any[]).map(mapRow) as B2bDocumentRecord[];
    },
    async findById(id: number): Promise<B2bDocumentRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM b2b_documents WHERE id = ? LIMIT 1', [id]);
      const arr = rows as any[];
      return arr.length ? (mapRow(arr[0]) as B2bDocumentRecord) : undefined;
    },
    async create(data: Omit<B2bDocumentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<B2bDocumentRecord> {
      const ts = now();
      const [res] = await pool.query(
        'INSERT INTO b2b_documents (nameTh, nameEn, filePath, fileSize, fileType, sortOrder, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.nameTh, data.nameEn, data.filePath, data.fileSize, data.fileType, data.sortOrder, data.isActive ? 1 : 0, ts, ts],
      );
      const id = (res as mysql.ResultSetHeader).insertId;
      return (await this.findById(id))!;
    },
    async update(id: number, data: Partial<B2bDocumentRecord>): Promise<B2bDocumentRecord | undefined> {
      const existing = await this.findById(id);
      if (!existing) return undefined;
      const fields: string[] = [];
      const vals: unknown[] = [];
      if ('nameTh' in data) { fields.push('nameTh = ?'); vals.push(data.nameTh); }
      if ('nameEn' in data) { fields.push('nameEn = ?'); vals.push(data.nameEn); }
      if ('filePath' in data) { fields.push('filePath = ?'); vals.push(data.filePath); }
      if ('fileSize' in data) { fields.push('fileSize = ?'); vals.push(data.fileSize); }
      if ('fileType' in data) { fields.push('fileType = ?'); vals.push(data.fileType); }
      if ('sortOrder' in data) { fields.push('sortOrder = ?'); vals.push(data.sortOrder); }
      if ('isActive' in data) { fields.push('isActive = ?'); vals.push(data.isActive ? 1 : 0); }
      if (fields.length === 0) return existing;
      fields.push('updatedAt = ?'); vals.push(now()); vals.push(id);
      await pool.query(`UPDATE b2b_documents SET ${fields.join(', ')} WHERE id = ?`, vals);
      return (await this.findById(id))!;
    },
    async delete(id: number): Promise<boolean> {
      const [res] = await pool.query('DELETE FROM b2b_documents WHERE id = ?', [id]);
      return (res as mysql.ResultSetHeader).affectedRows > 0;
    },
  },
};
