import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Nomor WhatsApp/email dan password wajib diisi.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await signIn(identifier.trim(), password);
    setSubmitting(false);

    if (err) {
      setError(err);
      return;
    }
    toast.success('Berhasil masuk!');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-brand-600">Bombon Marketplace</h1>
        <p className="mb-6 text-sm text-gray-500">Masuk ke akunmu.</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nomor WhatsApp / Email</label>
            <input className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end">
            <Link to="/lupa-password" className="text-sm text-brand-600">Lupa password?</Link>
          </div>

          <button disabled={submitting} type="submit"
            className="w-full rounded-lg bg-brand-500 py-2.5 font-medium text-white transition hover:bg-brand-600 disabled:opacity-60">
            {submitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Belum punya akun?{' '}
          <Link to="/register" className="font-medium text-brand-600">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
