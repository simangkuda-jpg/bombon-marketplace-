import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    name: '', username: '', whatsapp_number: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi.';
    if (!/^[a-z0-9_]{3,20}$/.test(form.username)) {
      e.username = 'Username 3-20 karakter, huruf kecil/angka/underscore saja.';
    }
    if (!/^(\+62|62|0)8[0-9]{8,11}$/.test(form.whatsapp_number.replace(/\s/g, ''))) {
      e.whatsapp_number = 'Nomor WhatsApp tidak valid (contoh: 081234567890).';
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Format email tidak valid.';
    if (form.password.length < 6) e.password = 'Password minimal 6 karakter.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Konfirmasi password tidak cocok.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const { error } = await signUp({
      email: form.email,
      password: form.password,
      name: form.name,
      username: form.username,
      whatsapp_number: form.whatsapp_number,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.includes('already registered') ? 'Email/username sudah terdaftar.' : error);
      return;
    }
    toast.success('Akun berhasil dibuat! Silakan cek email untuk verifikasi (jika ada).');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-brand-600">Bombon Marketplace</h1>
        <p className="mb-6 text-sm text-gray-500">Buat akun baru untuk mulai jual beli.</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field label="Nama Lengkap" error={errors.name}>
            <input className="input" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Username" error={errors.username}>
            <input className="input" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })} />
          </Field>
          <Field label="Nomor WhatsApp" error={errors.whatsapp_number}>
            <input className="input" placeholder="081234567890" value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} />
          </Field>
          <Field label="Email (opsional)" error={errors.email}>
            <input className="input" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Password" error={errors.password}>
            <input type="password" className="input" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <Field label="Konfirmasi Password" error={errors.confirmPassword}>
            <input type="password" className="input" value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          </Field>

          <button disabled={submitting} type="submit"
            className="w-full rounded-lg bg-brand-500 py-2.5 font-medium text-white transition hover:bg-brand-600 disabled:opacity-60">
            {submitting ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-brand-600">Masuk</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
