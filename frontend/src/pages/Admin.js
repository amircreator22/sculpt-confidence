import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LockSimple, Package, SignOut, Stack } from '@phosphor-icons/react';
import { adminLogin, adminGetOrders, adminUpdateFulfillment, adminGetProducts, adminSetStock, formatPrice } from '@/lib/api';

const TOKEN_KEY = 'sculptiva_admin_token';

const inputCls = 'w-full bg-white border border-[#2D2D2D]/15 px-4 py-3 text-sm focus:outline-none focus:border-[#E8B4B8] transition-colors';

const LoginForm = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await adminLogin(password);
      localStorage.setItem(TOKEN_KEY, token);
      onLogin(token);
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-[#2D2D2D]/10 p-8" data-testid="admin-login-form">
        <div className="flex items-center gap-2 mb-6">
          <LockSimple size={20} weight="bold" />
          <p className="font-display uppercase tracking-tight text-xl">Admin Login</p>
        </div>
        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#2D2D2D]/60">Password</label>
        <input
          type="password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`mt-2 ${inputCls}`}
          data-testid="admin-password-input"
        />
        {error && <p className="mt-3 text-sm text-red-600" data-testid="admin-login-error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          data-testid="admin-login-button"
          className="mt-6 w-full rounded-full bg-[#2D2D2D] text-[#F7F3F0] py-3.5 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors disabled:opacity-60"
        >
          {loading ? 'Checking…' : 'Log In'}
        </button>
      </form>
    </div>
  );
};

const FULFILLMENT_OPTIONS = ['unfulfilled', 'processing', 'fulfilled', 'restocked'];

const OrdersTab = ({ token, onAuthError }) => {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await adminGetOrders(token);
      setOrders(data.orders);
    } catch (err) {
      if (err.response?.status === 401) return onAuthError();
      setError(err.response?.data?.detail || 'Could not load orders');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await adminUpdateFulfillment(token, orderId, status);
      toast.success(`Order ${orderId} marked ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    }
  };

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!orders) return <p className="text-sm text-[#2D2D2D]/50">Loading orders…</p>;
  if (orders.length === 0) return <p className="text-sm text-[#2D2D2D]/50">No orders yet.</p>;

  return (
    <div className="overflow-x-auto" data-testid="admin-orders-table">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="border-b border-[#2D2D2D]/10 text-left text-xs uppercase tracking-[0.15em] text-[#2D2D2D]/50">
            <th className="py-3 pr-4">Order</th>
            <th className="py-3 pr-4">Email</th>
            <th className="py-3 pr-4">Items</th>
            <th className="py-3 pr-4">Total</th>
            <th className="py-3 pr-4">Payment</th>
            <th className="py-3 pr-4">Fulfillment</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.order_id} className="border-b border-[#2D2D2D]/5" data-testid={`admin-order-row-${o.order_id}`}>
              <td className="py-3 pr-4 font-semibold">{o.order_id}</td>
              <td className="py-3 pr-4">{o.email}</td>
              <td className="py-3 pr-4">{o.items.map((i) => `${i.title} ×${i.quantity}`).join(', ')}</td>
              <td className="py-3 pr-4">{formatPrice(o.total)}</td>
              <td className="py-3 pr-4">
                <span className={o.payment_status === 'paid' ? 'text-green-600' : 'text-[#2D2D2D]/50'}>{o.payment_status}</span>
              </td>
              <td className="py-3 pr-4">
                <select
                  value={o.fulfillment_status}
                  onChange={(e) => updateStatus(o.order_id, e.target.value)}
                  className="border border-[#2D2D2D]/15 px-2 py-1.5 text-xs uppercase tracking-wider"
                  data-testid={`admin-fulfillment-select-${o.order_id}`}
                >
                  {FULFILLMENT_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StockTab = ({ token, onAuthError }) => {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [savingKey, setSavingKey] = useState(null);

  const load = async () => {
    try {
      const data = await adminGetProducts(token);
      setProducts(data.products);
    } catch (err) {
      if (err.response?.status === 401) return onAuthError();
      setError(err.response?.data?.detail || 'Could not load products');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveStock = async (handle, variantId, value) => {
    const key = `${handle}-${variantId}`;
    setSavingKey(key);
    try {
      await adminSetStock(token, handle, variantId, Number(value));
      toast.success('Stock updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    } finally {
      setSavingKey(null);
    }
  };

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!products) return <p className="text-sm text-[#2D2D2D]/50">Loading products…</p>;

  return (
    <div className="space-y-8" data-testid="admin-stock-list">
      {products.map((p) => (
        <div key={p.handle} className="border border-[#2D2D2D]/10 p-5">
          <p className="font-display uppercase tracking-tight text-lg">{p.title}</p>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {p.variants.map((v) => {
              const key = `${p.handle}-${v.variant_id}`;
              return (
                <div key={v.variant_id} className="flex items-center justify-between gap-3 border border-[#2D2D2D]/10 px-3 py-2">
                  <span className="text-xs text-[#2D2D2D]/70">{v.title}</span>
                  <input
                    type="number"
                    min="0"
                    defaultValue={v.inventory_quantity}
                    onBlur={(e) => saveStock(p.handle, v.variant_id, e.target.value)}
                    disabled={savingKey === key}
                    data-testid={`admin-stock-input-${key}`}
                    className="w-16 border border-[#2D2D2D]/15 px-2 py-1 text-sm text-right focus:outline-none focus:border-[#E8B4B8]"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [tab, setTab] = useState('orders');

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  if (!token) return <LoginForm onLogin={setToken} />;

  return (
    <div data-testid="admin-page" className="min-h-[70vh]">
      <section className="mx-auto max-w-[1200px] px-6 md:px-10 pt-16 md:pt-20 pb-24">
        <div className="flex items-center justify-between mb-10">
          <p className="font-display uppercase tracking-tight text-3xl md:text-4xl">Admin Dashboard</p>
          <button onClick={logout} data-testid="admin-logout-button" className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#2D2D2D]/60 hover:text-[#2D2D2D]">
            <SignOut size={16} weight="bold" /> Log Out
          </button>
        </div>
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab('orders')}
            data-testid="admin-tab-orders"
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] rounded-full transition-colors ${tab === 'orders' ? 'bg-[#2D2D2D] text-[#F7F3F0]' : 'bg-white border border-[#2D2D2D]/15'}`}
          >
            <Package size={14} weight="bold" /> Orders
          </button>
          <button
            onClick={() => setTab('stock')}
            data-testid="admin-tab-stock"
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] rounded-full transition-colors ${tab === 'stock' ? 'bg-[#2D2D2D] text-[#F7F3F0]' : 'bg-white border border-[#2D2D2D]/15'}`}
          >
            <Stack size={14} weight="bold" /> Stock
          </button>
        </div>
        {tab === 'orders' ? <OrdersTab token={token} onAuthError={logout} /> : <StockTab token={token} onAuthError={logout} />}
      </section>
    </div>
  );
}
