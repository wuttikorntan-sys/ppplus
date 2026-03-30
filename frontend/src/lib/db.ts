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
function mapRow(row: any) {
  const out: Record<string, unknown> = {};
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

/* ====================================================================
   db – MySQL implementation (same method signatures, now async)
   ==================================================================== */
export const db = {
  /* ── users ── */
  users: {
    async findMany(opts?: { orderBy?: string }): Promise<UserRecord[]> {
      const order = opts?.orderBy === 'createdAt:desc' ? 'ORDER BY createdAt DESC' : 'ORDER BY id ASC';
      const [rows] = await pool.query(`SELECT * FROM users ${order}`);
      return (rows as unknown[]).map(mapRow) as UserRecord[];
    },
    async findById(id: number): Promise<UserRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      const arr = rows as unknown[];
      return arr.length ? (mapRow(arr[0]) as UserRecord) : undefined;
    },
    async findByEmail(email: string): Promise<UserRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
      const arr = rows as unknown[];
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
      return (rows as Record<string, number>[])[0].cnt;
    },
  },

  /* ── categories ── */
  categories: {
    async findMany(): Promise<CategoryRecord[]> {
      const [rows] = await pool.query('SELECT * FROM categories ORDER BY sortOrder ASC');
      return (rows as unknown[]).map(mapRow) as CategoryRecord[];
    },
    async findById(id: number): Promise<CategoryRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
      const arr = rows as unknown[];
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
      return (rows as Record<string, number>[])[0].cnt;
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
      return (rows as Record<string, unknown>[]).map((row) => {
        const mapped = mapRow(row) as MenuItemRecord & { category?: CategoryRecord; catNameTh?: string; catNameEn?: string; catSortOrder?: number; catCreatedAt?: string };
        if (opts?.includeCategory && mapped.catNameTh != null) {
          mapped.category = {
            id: mapped.categoryId,
            nameTh: mapped.catNameTh!,
            nameEn: mapped.catNameEn!,
            sortOrder: mapped.catSortOrder!,
            createdAt: mapped.catCreatedAt instanceof Date ? (mapped.catCreatedAt as unknown as Date).toISOString() : mapped.catCreatedAt!,
          };
        }
        delete mapped.catNameTh; delete mapped.catNameEn; delete mapped.catSortOrder; delete mapped.catCreatedAt;
        return mapped;
      });
    },
    async findById(id: number, includeCategory = false): Promise<(MenuItemRecord & { category?: CategoryRecord }) | undefined> {
      const [rows] = await pool.query('SELECT * FROM menu_items WHERE id = ? LIMIT 1', [id]);
      const arr = rows as unknown[];
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
        `INSERT INTO menu_items (categoryId, nameTh, nameEn, descriptionTh, descriptionEn, price, image, isAvailable, sortOrder, brand, colorCode, colorName, finishType, coverageArea, size, unit, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.categoryId, data.nameTh, data.nameEn, data.descriptionTh, data.descriptionEn, data.price, data.image, data.isAvailable ? 1 : 0, data.sortOrder, data.brand, data.colorCode, data.colorName, data.finishType, data.coverageArea, data.size, data.unit, ts, ts],
      );
      const id = (res as mysql.ResultSetHeader).insertId;
      return (await this.findById(id)) as MenuItemRecord;
    },
    async update(id: number, data: Partial<MenuItemRecord>): Promise<MenuItemRecord | undefined> {
      const existing = await this.findById(id);
      if (!existing) return undefined;
      const fields: string[] = [];
      const vals: unknown[] = [];
      const allowed = ['categoryId', 'nameTh', 'nameEn', 'descriptionTh', 'descriptionEn', 'price', 'image', 'isAvailable', 'sortOrder', 'brand', 'colorCode', 'colorName', 'finishType', 'coverageArea', 'size', 'unit'] as const;
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
      return (rows as Record<string, number>[])[0].cnt;
    },
  },

  /* ── popups ── */
  popups: {
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
      return (rows as unknown[]).map(mapRow) as PopupRecord[];
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
      return mapRow((rows as unknown[])[0]) as PopupRecord;
    },
    async update(id: number, data: Partial<PopupRecord>): Promise<PopupRecord | undefined> {
      const [check] = await pool.query('SELECT id FROM popups WHERE id = ?', [id]);
      if (!(check as unknown[]).length) return undefined;
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
        return mapRow((rows as unknown[])[0]) as PopupRecord;
      }
      fields.push('updatedAt = ?'); vals.push(now()); vals.push(id);
      await pool.query(`UPDATE popups SET ${fields.join(', ')} WHERE id = ?`, vals);
      const [rows] = await pool.query('SELECT * FROM popups WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as unknown[])[0]) as PopupRecord;
    },
    async delete(id: number): Promise<boolean> {
      const [res] = await pool.query('DELETE FROM popups WHERE id = ?', [id]);
      return (res as mysql.ResultSetHeader).affectedRows > 0;
    },
  },

  /* ── heroSlides ── */
  heroSlides: {
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
      return (rows as unknown[]).map(mapRow) as HeroSlideRecord[];
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
      return mapRow((rows as unknown[])[0]) as HeroSlideRecord;
    },
    async update(id: number, data: Partial<HeroSlideRecord>): Promise<HeroSlideRecord | undefined> {
      const [check] = await pool.query('SELECT id FROM hero_slides WHERE id = ?', [id]);
      if (!(check as unknown[]).length) return undefined;
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
        return mapRow((rows as unknown[])[0]) as HeroSlideRecord;
      }
      fields.push('updatedAt = ?'); vals.push(now()); vals.push(id);
      await pool.query(`UPDATE hero_slides SET ${fields.join(', ')} WHERE id = ?`, vals);
      const [rows] = await pool.query('SELECT * FROM hero_slides WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as unknown[])[0]) as HeroSlideRecord;
    },
    async delete(id: number): Promise<boolean> {
      const [res] = await pool.query('DELETE FROM hero_slides WHERE id = ?', [id]);
      return (res as mysql.ResultSetHeader).affectedRows > 0;
    },
  },

  /* ── galleryImages ── */
  galleryImages: {
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
      return (rows as unknown[]).map(mapRow) as GalleryImageRecord[];
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
      return mapRow((rows as unknown[])[0]) as GalleryImageRecord;
    },
    async update(id: number, data: Partial<GalleryImageRecord>): Promise<GalleryImageRecord | undefined> {
      const [check] = await pool.query('SELECT id FROM gallery_images WHERE id = ?', [id]);
      if (!(check as unknown[]).length) return undefined;
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
        return mapRow((rows as unknown[])[0]) as GalleryImageRecord;
      }
      fields.push('updatedAt = ?'); vals.push(now()); vals.push(id);
      await pool.query(`UPDATE gallery_images SET ${fields.join(', ')} WHERE id = ?`, vals);
      const [rows] = await pool.query('SELECT * FROM gallery_images WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as unknown[])[0]) as GalleryImageRecord;
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
      return (rows as unknown[]).map(mapRow) as SiteContentRecord[];
    },
    async findByKey(key: string): Promise<SiteContentRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM site_contents WHERE `key` = ? LIMIT 1', [key]);
      const arr = rows as unknown[];
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
      return (rows as Record<string, unknown>[]).map((row) => {
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
      return mapRow((rows as unknown[])[0]) as ReviewRecord;
    },
    async update(id: number, data: Partial<ReviewRecord>): Promise<ReviewRecord | undefined> {
      const [check] = await pool.query('SELECT id FROM reviews WHERE id = ?', [id]);
      if (!(check as unknown[]).length) return undefined;
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
        return mapRow((rows as unknown[])[0]) as ReviewRecord;
      }
      fields.push('updatedAt = ?'); vals.push(now()); vals.push(id);
      await pool.query(`UPDATE reviews SET ${fields.join(', ')} WHERE id = ?`, vals);
      const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ? LIMIT 1', [id]);
      return mapRow((rows as unknown[])[0]) as ReviewRecord;
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
      return (rows as unknown[]).map(mapRow) as BlogPostRecord[];
    },
    async findById(id: number): Promise<BlogPostRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM blog_posts WHERE id = ? LIMIT 1', [id]);
      const arr = rows as unknown[];
      return arr.length ? (mapRow(arr[0]) as BlogPostRecord) : undefined;
    },
    async findBySlug(slug: string): Promise<BlogPostRecord | undefined> {
      const [rows] = await pool.query('SELECT * FROM blog_posts WHERE slug = ? LIMIT 1', [slug]);
      const arr = rows as unknown[];
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
      return (rows as Record<string, number>[])[0].cnt;
    },
  },
};
