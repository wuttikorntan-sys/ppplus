import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handleError, ApiError } from '@/lib/api-server';

const orderSchema = z.object({
  customerName: z.string().min(1, 'Name required').max(200),
  customerPhone: z.string().min(1, 'Phone required').max(50),
  customerEmail: z.string().email().nullable().optional(),
  customerAddress: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  paymentMethod: z.enum(['transfer', 'cod', 'pickup']).optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, 'At least one item required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = orderSchema.parse(body);

    // Look up real prices server-side — never trust client-provided prices
    const priced: { menuItemId: number; quantity: number; price: number }[] = [];
    let total = 0;
    for (const item of data.items) {
      const product = await db.menuItems.findById(item.menuItemId);
      if (!product) {
        throw new ApiError(`Product #${item.menuItemId} not found`, 400);
      }
      if (!product.isAvailable) {
        throw new ApiError(`Product "${product.nameTh || product.nameEn}" is no longer available`, 400);
      }
      const price = Number(product.price);
      if (!isFinite(price) || price <= 0) {
        throw new ApiError(`Invalid price for product #${item.menuItemId}`, 400);
      }
      priced.push({ menuItemId: item.menuItemId, quantity: item.quantity, price });
      total += price * item.quantity;
    }

    const order = await db.orders.create({
      userId: null, // guest checkout (auth wiring is a separate concern)
      totalAmount: total,
      orderType: 'ONLINE',
      items: priced,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || null,
      customerAddress: data.customerAddress || null,
      notes: data.notes || null,
      paymentMethod: data.paymentMethod || 'transfer',
    });

    return NextResponse.json({ success: true, data: { id: order.id, totalAmount: order.totalAmount } }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
