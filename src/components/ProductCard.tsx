import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { Product } from '../types';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.product_images?.find((i) => i.is_primary) ?? product.product_images?.[0];
  const isSold = product.status === 'sold';

  return (
    <Link to={`/produk/${product.id}`} className="group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {primaryImage ? (
          <img src={primaryImage.image_url} alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">Tanpa foto</div>
        )}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded bg-white px-3 py-1 text-xs font-bold text-gray-900">TERJUAL</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium text-gray-800">{product.name}</p>
        <p className="mt-1 font-bold text-brand-600">{formatPrice(product.price)}</p>
        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} /> {product.city}
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            {product.seller?.rating_avg?.toFixed(1) ?? '0.0'}
          </span>
          <span>{timeAgo(product.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
