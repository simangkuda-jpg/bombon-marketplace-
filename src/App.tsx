import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';

// Halaman di bawah ini akan diimplementasikan penuh di Fase 2-5
// (detail produk, jual barang, order, dashboard penjual, chat, dll).
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <p className="text-sm text-gray-500">Halaman ini akan dibangun di fase berikutnya.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/lupa-password" element={<ComingSoon title="Lupa Password" />} />
      <Route path="/produk/:id" element={<ComingSoon title="Detail Produk" />} />
      <Route path="/cari" element={<ComingSoon title="Hasil Pencarian" />} />
      <Route path="/kategori/:slug" element={<ComingSoon title="Kategori" />} />
      <Route path="/jual" element={<ProtectedRoute><ComingSoon title="Jual Barang" /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ComingSoon title="Chat" /></ProtectedRoute>} />
      <Route path="/notifikasi" element={<ProtectedRoute><ComingSoon title="Notifikasi" /></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute><ComingSoon title="Profil Saya" /></ProtectedRoute>} />
      <Route path="/pesanan-saya" element={<ProtectedRoute><ComingSoon title="Pesanan Saya" /></ProtectedRoute>} />
      <Route path="/dashboard-penjual" element={<ProtectedRoute><ComingSoon title="Dashboard Penjual" /></ProtectedRoute>} />
      <Route path="*" element={<ComingSoon title="Halaman tidak ditemukan" />} />
    </Routes>
  );
}
