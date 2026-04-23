'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { Star, Check, X as XIcon } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Review {
  id: number;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  user: { name: string; email: string };
}

export default function AdminReviewsPage() {
  const locale = useLocale();
  const th = locale === 'th';
  const [reviews, setReviews] = useState<Review[]>([]);

  const fetchReviews = () => {
    api.get<{ success: boolean; data: Review[] }>('/admin/reviews')
      .then((r) => setReviews(r.data))
      .catch(() => toast.error(th ? 'โหลดข้อมูลไม่สำเร็จ' : 'Failed to load'));
  };

  useEffect(() => { fetchReviews(); }, []);

  const toggleApproval = async (id: number, isApproved: boolean) => {
    try {
      await api.patch(`/admin/reviews/${id}`, { isApproved });
      toast.success(th ? 'อัปเดตเรียบร้อย' : 'Updated');
      fetchReviews();
    } catch {
      toast.error('Error');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
          {th ? 'จัดการรีวิว' : 'Review Management'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{reviews.length} {th ? 'รีวิว' : 'reviews'}</p>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900 text-sm">{review.user.name}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${review.isApproved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {review.isApproved ? (th ? 'อนุมัติ' : 'Approved') : (th ? 'รออนุมัติ' : 'Pending')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleString(locale)}</p>
              </div>
              <div className="flex gap-1 ml-4">
                {!review.isApproved && (
                  <button onClick={() => toggleApproval(review.id, true)} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition" title={th ? 'อนุมัติ' : 'Approve'}>
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {review.isApproved && (
                  <button onClick={() => toggleApproval(review.id, false)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition" title={th ? 'ไม่อนุมัติ' : 'Unapprove'}>
                    <XIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">{th ? 'ยังไม่มีรีวิว' : 'No reviews'}</div>
        )}
      </div>
    </div>
  );
}
