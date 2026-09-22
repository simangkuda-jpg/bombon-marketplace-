import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Header } from '../components/Header';

type LoadState = 'loading' | 'success' | 'error' | 'empty';

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      setState('loading');
      const [{ data: cats }, { data: prods, error }] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase
          .from('products')
          .select('*, product_images(*), seller:profiles(*)')
          .in('status', ['active', 'reserved', 'sold'])
          .order('created_at', { ascending: false })
          .limit(24),
      ]);

      if (!active) return;
      if (error) {
        setState('error');
        return;
      }
      setCategories(cats ?? []);
      setProducts((prods as unknown as Product[]) ?? []);
      setState((prods && prods.length > 0) ? 'success' : 'empty');
    }

    load();
    return () => { active = false; };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/cari?q=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />

      <section className="bg-gradient-to-b from-brand-50 to-transparent px-4 py-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Temukan barang yang kamu cari</h1>
        <form onSubmit={handleSearch} className="mx-auto mt-5 flex max-w-xl items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm ring-1 ring-gray-200">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama barang, kategori, lokasi..."
            className="w-full text-sm outline-none"
          />
        </form>
      </section>

      <section className="scrollbar-hide flex gap-3 overflow-x-auto px-4 py-3">
        {categories.map((cat) => (
          <button key={cat.id}
            onClick={() => navigate(`/kategori/${cat.slug}`)}
            className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-white px-4 py-2 text-xs font-medium text-gray-600 shadow-sm ring-1 ring-gray-100 hover:bg-brand-50 hover:text-brand-600">
            {cat.name}
          </button>
        ))}
      </section>

      <section className="px-4 py-4">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Produk Terbaru</h2>

        {state === 'loading' && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                <div className="skeleton aspect-square w-full" />
                <div className="space-y-2 p-3">
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {state === 'error' && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="font-medium text-gray-800">Gagal memuat produk.</p>
            <p className="mt-1 text-sm text-gray-500">Periksa koneksi internet kamu atau coba lagi.</p>
            <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white">
              Muat Ulang
            </button>
          </div>
        )}

        {state === 'empty' && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="font-medium text-gray-800">Belum ada produk di sini.</p>
            <p className="mt-1 text-sm text-gray-500">Jadilah yang pertama menjual barang di Bombon Marketplace.</p>
            <button onClick={() => navigate('/jual')} className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white">
              Jual Barang
            </button>
          </div>
        )}

        {state === 'success' && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
