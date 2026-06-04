'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';
import Link from 'next/link';
import BrandLogo from '../components/BrandLogo';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
}

interface Order {
  id: string;
  customer_id: string;
  source: 'WEB' | 'WHATSAPP';
  payment_method: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED';
  tracking_number: string | null;
  total_amount: number;
  created_at: string;
  crm_customers?: Customer;
}

interface Product {
  id: string;
  name: string;
  inventory: number;
  price: number;
}

interface SelectedItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  maxStock: number;
}

export default function CrmDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [password, setPassword] = useState('');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingTrackingId, setEditingTrackingId] = useState<string | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Manual Order Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [currentSelectedProductId, setCurrentSelectedProductId] = useState('');
  const [currentQty, setCurrentQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('NEQUI');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonthKey, setSelectedMonthKey] = useState('ALL');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editCustName, setEditCustName] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editCustEmail, setEditCustEmail] = useState('');
  const [editCustCity, setEditCustCity] = useState('');
  const [editPayMethod, setEditPayMethod] = useState('NEQUI');
  const [editStatus, setEditStatus] = useState<Order['status']>('PENDING');
  const [editTracking, setEditTracking] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch('/api/admin/check')
      .then((r) => {
        if (r.ok) setAuthenticated(true);
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = getSupabase();

      // Fetch products for stock levels
      const { data: prods, error: prodErr } = await supabase
        .from('products')
        .select('id, name, inventory, price');
      if (prodErr) throw prodErr;
      setProducts(prods || []);

      // Fetch CRM orders with customer details
      const { data: ords, error: ordErr } = await supabase
        .from('crm_orders')
        .select(`
          id,
          customer_id,
          source,
          payment_method,
          status,
          tracking_number,
          total_amount,
          created_at,
          crm_customers (
            id,
            name,
            phone,
            email,
            city
          )
        `)
        .order('created_at', { ascending: false });
      
      if (ordErr) throw ordErr;
      setOrders(ords as unknown as Order[] || []);

    } catch (err: any) {
      console.error(err);
      showToast('Error cargando datos del CRM', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        setPassword('');
      } else {
        const d = await res.json();
        showToast(d.error || 'Contraseña incorrecta', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const previousOrders = [...orders];
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('crm_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      showToast('Estado actualizado');
    } catch (err) {
      setOrders(previousOrders);
      showToast('Error al actualizar el estado', 'error');
    }
  };

  const updateTrackingNumber = async (orderId: string) => {
    const previousOrders = [...orders];
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, tracking_number: trackingNumberInput } : o));
    setEditingTrackingId(null);

    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('crm_orders')
        .update({ tracking_number: trackingNumberInput || null })
        .eq('id', orderId);

      if (error) throw error;
      showToast('Guía de envío actualizada');
    } catch (err) {
      setOrders(previousOrders);
      showToast('Error al guardar la guía', 'error');
    }
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Order['status']) => {
    const orderId = e.dataTransfer.getData('orderId');
    if (orderId) {
      updateOrderStatus(orderId, targetStatus);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Manual Order Management
  const addProductToOrder = () => {
    if (!currentSelectedProductId) return;
    const targetProd = products.find(p => p.id === currentSelectedProductId);
    if (!targetProd) return;

    const existingIdx = selectedItems.findIndex(i => i.id === currentSelectedProductId);
    const availableStock = targetProd.inventory ?? 0;

    if (existingIdx > -1) {
      const newQty = selectedItems[existingIdx].qty + currentQty;
      if (newQty > availableStock) {
        showToast(`Stock insuficiente. Solo quedan ${availableStock} disponibles.`, 'error');
        return;
      }
      setSelectedItems(prev => prev.map((item, idx) => idx === existingIdx ? { ...item, qty: newQty } : item));
    } else {
      if (currentQty > availableStock) {
        showToast(`Stock insuficiente. Solo quedan ${availableStock} disponibles.`, 'error');
        return;
      }
      setSelectedItems(prev => [...prev, {
        id: targetProd.id,
        name: targetProd.name,
        price: targetProd.price,
        qty: currentQty,
        maxStock: availableStock
      }]);
    }

    setCurrentSelectedProductId('');
    setCurrentQty(1);
  };

  const removeProductFromOrder = (id: string) => {
    setSelectedItems(prev => prev.filter(i => i.id !== id));
  };

  const calculateTotalOrderAmount = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) {
      showToast('El nombre del cliente es requerido', 'error');
      return;
    }
    if (selectedItems.length === 0) {
      showToast('Debes añadir al menos un producto', 'error');
      return;
    }

    try {
      setSubmittingOrder(true);
      const total = calculateTotalOrderAmount();

      const response = await fetch('/api/crm/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: customerName,
            phone: customerPhone || null,
            email: customerEmail || null,
            city: customerCity || null
          },
          products: selectedItems.map(i => ({
            id: i.id,
            quantity: i.qty
          })),
          total,
          payment_method: paymentMethod,
          status: 'PAID' // Por defecto se registra como pagada para empaquetar
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Fallo al guardar la orden manual');
      }

      showToast('Pedido manual creado exitosamente');
      setIsModalOpen(false);
      // Reset variables
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerCity('');
      setSelectedItems([]);
      setPaymentMethod('NEQUI');
      // Reload Data
      loadData();

    } catch (err: any) {
      showToast(err.message || 'Error guardando pedido manual', 'error');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const startEditingOrder = (order: Order) => {
    setEditingOrder(order);
    setEditCustName(order.crm_customers?.name || '');
    setEditCustPhone(order.crm_customers?.phone || '');
    setEditCustEmail(order.crm_customers?.email || '');
    setEditCustCity(order.crm_customers?.city || '');
    setEditPayMethod(order.payment_method || 'NEQUI');
    setEditStatus(order.status);
    setEditTracking(order.tracking_number || '');
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      const supabase = getSupabase();
      
      if (editingOrder.crm_customers?.id) {
        const { error: custErr } = await supabase
          .from('crm_customers')
          .update({
            name: editCustName,
            phone: editCustPhone || null,
            email: editCustEmail || null,
            city: editCustCity || null
          })
          .eq('id', editingOrder.crm_customers.id);
        if (custErr) throw custErr;
      }

      const { error: orderErr } = await supabase
        .from('crm_orders')
        .update({
          payment_method: editPayMethod,
          status: editStatus,
          tracking_number: editTracking || null
        })
        .eq('id', editingOrder.id);
      if (orderErr) throw orderErr;

      showToast('Pedido actualizado exitosamente');
      setEditingOrder(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar pedido', 'error');
    }
  };

  // Metrics Calculations
  const stockCriticoCount = products.filter(p => (p.inventory ?? 0) < 3).length;
  
  const now = new Date();
  const currentMonthOrders = orders.filter(o => {
    const orderDate = new Date(o.created_at);
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  });
  const cajaDelMes = currentMonthOrders
    .filter(o => o.status !== 'PENDING')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const pedidosPendientesCount = orders.filter(o => o.status === 'PAID' || o.status === 'SHIPPED').length;

  const webOrdersCount = orders.filter(o => o.source === 'WEB').length;
  const waOrdersCount = orders.filter(o => o.source === 'WHATSAPP').length;
  const totalConversionOrders = webOrdersCount + waOrdersCount;
  const webPct = totalConversionOrders > 0 ? Math.round((webOrdersCount / totalConversionOrders) * 100) : 0;
  const waPct = totalConversionOrders > 0 ? Math.round((waOrdersCount / totalConversionOrders) * 100) : 0;

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center font-mono text-[#b0b0b0] tracking-widest text-xs">
        VERIFICANDO SESIÓN...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
        <div className="bg-[#1c1c1c] border border-[#2e2e2e] p-8 max-w-sm w-full rounded-none shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <h1 className="font-display text-4xl mb-6 text-[#FFD400] text-center tracking-wider">CRM LOGIN</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="CONTRASEÑA DE ADMINISTRADOR"
              className="w-full p-3 bg-[#141414] border border-[#2e2e2e] text-[#e8e8e8] font-mono text-xs outline-none focus:border-[#FFD400] transition rounded-none uppercase placeholder:text-zinc-700"
            />
            <button
              type="submit"
              className="p-3 bg-[#FFD400] text-black font-display font-bold text-2xl hover:bg-[#ffe033] active:scale-98 transition rounded-none tracking-wider"
            >
              INGRESAR
            </button>
          </form>
        </div>
      </div>
    );
  }

  const getUniqueMonths = () => {
    const monthsMap = new Map<string, { label: string, year: number, month: number }>();
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const label = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }).toUpperCase();
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthsMap.has(key)) {
        monthsMap.set(key, { label, year: date.getFullYear(), month: date.getMonth() });
      }
    });
    return Array.from(monthsMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  };

  const filteredOrders = orders.filter(order => {
    if (selectedMonthKey !== 'ALL') {
      const date = new Date(order.created_at);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (key !== selectedMonthKey) return false;
    }
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (order.crm_customers?.name || '').toLowerCase().includes(term) ||
      (order.crm_customers?.city || '').toLowerCase().includes(term) ||
      (order.payment_method || '').toLowerCase().includes(term) ||
      (order.tracking_number || '').toLowerCase().includes(term) ||
      (order.id || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#141414] text-[#e8e8e8] font-body relative pb-16">
      
      {/* Brand Header */}
      <header className="border-b border-[#2e2e2e] bg-[#121212]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-85 transition">
            <BrandLogo size={36} />
            <span className="font-display text-2xl text-[#FFD400] tracking-wider uppercase">TattooShop Colombia</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="font-mono text-xs text-[#b0b0b0] hover:text-[#FFD400] transition uppercase tracking-wider">
              Ver Tienda
            </Link>
            <Link href="/admin" className="font-mono text-xs text-[#b0b0b0] hover:text-[#FFD400] transition uppercase tracking-wider">
              Panel Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        
        {/* Title & Control Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-[#2e2e2e] pb-6">
          <div>
            <h1 className="font-display text-4xl lg:text-5xl text-[#FFD400] tracking-wider uppercase">PANEL CRM</h1>
            <p className="text-xs font-mono text-[#9a9a9a] mt-1 uppercase tracking-widest">CONTROL & SEGUIMIENTO DE PEDIDOS</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-none px-6 py-3 bg-[#FFD400] text-black font-display font-bold text-lg tracking-wider hover:bg-[#ffe033] active:scale-95 transition rounded-none uppercase"
            >
              + REGISTRAR VENTA MANUAL
            </button>
            <button
              onClick={loadData}
              className="px-4 py-3 border border-[#2e2e2e] hover:border-[#FFD400] hover:text-[#FFD400] font-mono text-xs tracking-wider transition rounded-none uppercase bg-[#1c1c1c]"
            >
              ACTUALIZAR DATOS
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1c1c1c] border border-[#2e2e2e] p-5 rounded-none">
            <span className="font-mono text-[10px] text-[#9a9a9a] uppercase tracking-widest block mb-2">STOCK CRÍTICO</span>
            <span className={`text-3xl font-bold font-mono ${stockCriticoCount > 0 ? 'text-red-500' : 'text-[#e8e8e8]'}`}>
              {stockCriticoCount}
            </span>
            <span className="text-xs text-[#b0b0b0] block mt-1">Productos con stock &lt; 3</span>
          </div>

          <div className="bg-[#1c1c1c] border border-[#2e2e2e] p-5 rounded-none">
            <span className="font-mono text-[10px] text-[#9a9a9a] uppercase tracking-widest block mb-2">CAJA DEL MES</span>
            <span className="text-3xl font-bold text-[#FFD400] font-mono">
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(cajaDelMes)}
            </span>
            <span className="text-xs text-[#b0b0b0] block mt-1">Ingresos mes actual</span>
          </div>

          <div className="bg-[#1c1c1c] border border-[#2e2e2e] p-5 rounded-none">
            <span className="font-mono text-[10px] text-[#9a9a9a] uppercase tracking-widest block mb-2">PEDIDOS PENDIENTES</span>
            <span className="text-3xl font-bold text-[#e8e8e8] font-mono">
              {pedidosPendientesCount}
            </span>
            <span className="text-xs text-[#b0b0b0] block mt-1">Por empaquetar / enviar</span>
          </div>

          <div className="bg-[#1c1c1c] border border-[#2e2e2e] p-5 rounded-none">
            <span className="font-mono text-[10px] text-[#9a9a9a] uppercase tracking-widest block mb-2">CONVERSIÓN WEB VS WA</span>
            <div className="flex gap-4 items-baseline">
              <span className="text-2xl font-bold text-[#e8e8e8] font-mono">{webPct}% <span className="text-xs text-[#b0b0b0] font-sans">Web</span></span>
              <span className="text-xl font-bold text-[#FFD400] font-mono">{waPct}% <span className="text-xs text-[#b0b0b0] font-sans">WA</span></span>
            </div>
            <span className="text-xs text-[#b0b0b0] block mt-1">Origen de pedidos</span>
          </div>
        </div>

        {/* Month Selector Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-[#2e2e2e] pb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-mono text-xs text-[#9a9a9a] uppercase tracking-wider mr-2">Filtrar por Mes:</span>
            <button
              onClick={() => setSelectedMonthKey('ALL')}
              className={`px-4 py-2 text-xs font-mono tracking-wider transition ${
                selectedMonthKey === 'ALL'
                  ? 'bg-[#FFD400] text-black font-bold'
                  : 'bg-[#1c1c1c] border border-[#2e2e2e] text-[#b0b0b0] hover:border-[#FFD400] hover:text-[#FFD400]'
              }`}
            >
              TODOS LOS MESES
            </button>
            {getUniqueMonths().map(m => {
              const key = `${m.year}-${m.month}`;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedMonthKey(key)}
                  className={`px-4 py-2 text-xs font-mono tracking-wider transition ${
                    selectedMonthKey === key
                      ? 'bg-[#FFD400] text-black font-bold'
                      : 'bg-[#1c1c1c] border border-[#2e2e2e] text-[#b0b0b0] hover:border-[#FFD400] hover:text-[#FFD400]'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente, ciudad, guía..."
              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] text-[#e8e8e8] font-mono text-xs px-4 py-2.5 outline-none focus:border-[#FFD400] transition rounded-none uppercase placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* Kanban Board View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'Por Empacar',
              status: 'PAID' as Order['status'],
              accent: '#3b82f6',
              accentBg: 'rgba(59,130,246,0.08)',
              badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
              headerGlow: '0 2px 20px rgba(59,130,246,0.15)',
            },
            {
              title: 'Por Despachar',
              status: 'PENDING' as Order['status'],
              accent: '#f59e0b',
              accentBg: 'rgba(245,158,11,0.08)',
              badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
              headerGlow: '0 2px 20px rgba(245,158,11,0.15)',
            },
            {
              title: 'Enviado',
              status: 'SHIPPED' as Order['status'],
              accent: '#a855f7',
              accentBg: 'rgba(168,85,247,0.08)',
              badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
              headerGlow: '0 2px 20px rgba(168,85,247,0.15)',
            },
            {
              title: 'Entregado',
              status: 'DELIVERED' as Order['status'],
              accent: '#22c55e',
              accentBg: 'rgba(34,197,94,0.08)',
              badge: 'bg-green-500/20 text-green-400 border-green-500/30',
              headerGlow: '0 2px 20px rgba(34,197,94,0.15)',
            },
          ].map(col => {
            const columnOrders = filteredOrders.filter(o => o.status === col.status);
            return (
              <div
                key={col.status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.status)}
                style={{ background: col.accentBg, borderTop: `2px solid ${col.accent}` }}
                className="border border-[#2a2a2a] p-4 flex flex-col min-h-[520px] transition-all"
              >
                {/* Column Header */}
                <div className="flex justify-between items-center mb-5 pb-3" style={{ borderBottom: `1px solid ${col.accent}33` }}>
                  <div>
                    <h3
                      className="font-display text-lg tracking-widest uppercase"
                      style={{ color: col.accent, textShadow: `0 0 14px ${col.accent}66` }}
                    >
                      {col.title}
                    </h3>
                  </div>
                  <span className={`border font-mono text-xs font-bold px-2 py-0.5 ${col.badge}`}>
                    {columnOrders.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                  {loading ? (
                    <div className="text-center py-10 text-[#555] text-[10px] font-mono tracking-widest animate-pulse">
                      CARGANDO...
                    </div>
                  ) : columnOrders.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center py-10 border border-dashed text-[10px] font-mono tracking-widest text-[#444] gap-2"
                      style={{ borderColor: `${col.accent}33` }}
                    >
                      <span style={{ color: col.accent, opacity: 0.4, fontSize: '1.5rem' }}>⬇</span>
                      ARRASTRAR AQUÍ
                    </div>
                  ) : (
                    columnOrders.map(order => (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, order.id)}
                        className="group bg-[#141414] border border-[#2a2a2a] p-4 cursor-grab active:cursor-grabbing transition-all duration-150"
                        style={{
                          boxShadow: '0 1px 8px rgba(0,0,0,0.4)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = col.accent + '66')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                      >
                        {/* Top row: source badge + date */}
                        <div className="flex justify-between items-center mb-3">
                          <span
                            className={`text-[9px] font-mono tracking-wider font-bold px-2 py-0.5 ${order.source === 'WEB' ? 'bg-[#FFD400] text-black' : 'bg-[#25d366]/20 text-[#25d366] border border-[#25d366]/40'}`}
                          >
                            {order.source}
                          </span>
                          <span className="text-[9px] font-mono text-[#555]">
                            {new Date(order.created_at).toLocaleDateString('es-CO')}
                          </span>
                        </div>

                        {/* Customer name */}
                        <div className="font-display text-base text-[#e8e8e8] tracking-wide uppercase leading-tight mb-1">
                          {order.crm_customers?.name || 'Cliente'}
                        </div>

                        {/* Meta */}
                        <div className="text-[10px] text-[#666] font-mono uppercase tracking-wider mb-3">
                          {order.crm_customers?.city || '—'} · {order.payment_method || '—'}
                        </div>

                        {/* Bottom row: total + edit */}
                        <div className="flex justify-between items-center pt-2.5 border-t border-[#2a2a2a]">
                          <span className="text-sm font-black font-mono" style={{ color: col.accent }}>
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(order.total_amount)}
                          </span>
                          <button
                            onClick={() => startEditingOrder(order)}
                            className="px-2.5 py-1 text-[9px] font-mono tracking-widest border border-[#2e2e2e] text-[#888] hover:text-[#FFD400] hover:border-[#FFD400]/50 transition bg-[#1a1a1a]"
                          >
                            EDITAR
                          </button>
                        </div>

                        {/* Tracking */}
                        {order.tracking_number && (
                          <div className="mt-2.5 pt-2 border-t border-dashed border-[#2a2a2a] text-[9px] font-mono text-[#555] tracking-wider">
                            📦 GUÍA: <span className="text-[#888]">{order.tracking_number}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Manual Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-[#1c1c1c] border border-[#2e2e2e] w-full max-w-2xl rounded-none shadow-[0_0_50px_rgba(0,0,0,0.9)] p-6 relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#9a9a9a] hover:text-white font-mono text-xl"
            >
              ✕
            </button>

            <h2 className="text-3xl font-display text-[#FFD400] uppercase tracking-wider mb-6">
              REGISTRAR VENTA MANUAL (WA)
            </h2>

            <form onSubmit={handleCreateManualOrder} className="space-y-6">
              
              {/* Customer Info Group */}
              <div className="border-b border-[#2e2e2e] pb-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#9a9a9a] mb-3">Datos del Cliente</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#9a9a9a] mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="EJ. JUAN PÉREZ"
                      className="w-full bg-[#141414] border border-[#2e2e2e] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase placeholder:text-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#9a9a9a] mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="EJ. 3001234567"
                      className="w-full bg-[#141414] border border-[#2e2e2e] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase placeholder:text-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#9a9a9a] mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="EJ. CLIENTE@GMAIL.COM"
                      className="w-full bg-[#141414] border border-[#2e2e2e] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase placeholder:text-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#9a9a9a] mb-1">Ciudad</label>
                    <input
                      type="text"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      placeholder="EJ. BOGOTÁ"
                      className="w-full bg-[#141414] border border-[#2e2e2e] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase placeholder:text-zinc-700"
                    />
                  </div>
                </div>
              </div>

              {/* Product Selector Group */}
              <div className="border-b border-[#2e2e2e] pb-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#9a9a9a] mb-3">Agregar Productos</h3>
                <div className="flex flex-col sm:flex-row gap-2 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-mono uppercase text-[#9a9a9a] mb-1">Seleccionar Producto</label>
                    <select
                      value={currentSelectedProductId}
                      onChange={(e) => setCurrentSelectedProductId(e.target.value)}
                      className="w-full bg-[#141414] border border-[#2e2e2e] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase"
                    >
                      <option value="">-- ELIGE UN PRODUCTO --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.inventory <= 0} className="bg-[#1c1c1c] text-[#e8e8e8]">
                          {p.name.toUpperCase()} ({p.inventory} DISPONIBLES) - ${p.price.toLocaleString('es-CO')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-24">
                    <label className="block text-[10px] font-mono uppercase text-[#9a9a9a] mb-1">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      value={currentQty}
                      onChange={(e) => setCurrentQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#141414] border border-[#2e2e2e] p-2.5 text-xs text-white text-center outline-none focus:border-[#FFD400] transition rounded-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={addProductToOrder}
                    className="w-full sm:w-auto px-6 py-2.5 bg-zinc-800 border border-zinc-700 font-bold hover:bg-zinc-750 text-xs tracking-wider transition rounded-none uppercase"
                  >
                    AÑADIR
                  </button>
                </div>

                {/* Selected Products Table */}
                {selectedItems.length > 0 && (
                  <div className="mt-4 bg-[#141414] border border-[#2e2e2e] p-2 rounded-none space-y-2">
                    {selectedItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-xs p-2 border-b border-[#2e2e2e] last:border-0">
                        <div>
                          <div className="font-bold text-zinc-300 uppercase">{item.name}</div>
                          <div className="text-[#b0b0b0] font-mono text-[10px]">
                            {item.qty} UDS X ${item.price.toLocaleString('es-CO')}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold font-mono text-[#FFD400]">
                            ${(item.price * item.qty).toLocaleString('es-CO')}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeProductFromOrder(item.id)}
                            className="text-red-500 hover:text-red-400 font-mono text-[11px] uppercase tracking-wider"
                          >
                            ELIMINAR
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method Group */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#9a9a9a] mb-3">Método de Pago</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['NEQUI', 'BANCOLOMBIA', 'DAVIPLATA', 'MERCADOPAGO'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 font-mono text-xs font-bold border transition rounded-none ${
                        paymentMethod === method
                          ? 'bg-[#FFD400] text-black border-[#FFD400]'
                          : 'bg-[#141414] text-[#9a9a9a] border-[#2e2e2e] hover:border-zinc-500'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total & Submit */}
              <div className="pt-4 border-t border-[#2e2e2e] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] font-mono uppercase text-[#9a9a9a] block">Total del Pedido</span>
                  <span className="text-2xl font-black font-mono text-[#FFD400]">
                    ${calculateTotalOrderAmount().toLocaleString('es-CO')}
                  </span>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 sm:w-auto px-6 py-3 border border-[#2e2e2e] text-[#9a9a9a] hover:text-white font-mono text-xs transition rounded-none uppercase"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOrder || selectedItems.length === 0}
                    className="w-1/2 sm:w-auto px-8 py-3 bg-[#FFD400] text-black font-display font-bold text-xl tracking-wider transition hover:bg-[#ffe033] disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
                  >
                    {submittingOrder ? 'REGISTRANDO...' : 'REGISTRAR PEDIDO'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-[#1c1c1c] border border-[#2e2e2e] w-full max-w-2xl rounded-none shadow-[0_0_50px_rgba(0,0,0,0.9)] p-6 relative my-8">
            <button
              onClick={() => setEditingOrder(null)}
              className="absolute top-4 right-4 text-[#9a9a9a] hover:text-white font-mono text-xl"
            >
              ✕
            </button>

            <h2 className="text-3xl font-display text-[#FFD400] uppercase tracking-wider mb-6">
              EDITAR PEDIDO #{editingOrder.id.slice(0, 5).toUpperCase()}
            </h2>

            <form onSubmit={handleUpdateOrder} className="space-y-6">
              
              {/* Customer Info Group */}
              <div className="border-b border-[#2e2e2e] pb-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#9a9a9a] mb-3">Datos del Cliente</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#9a9a9a] mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={editCustName}
                      onChange={(e) => setEditCustName(e.target.value)}
                      className="w-full bg-[#141414] border border-[#2e2e2e] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#9a9a9a] mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={editCustPhone}
                      onChange={(e) => setEditCustPhone(e.target.value)}
                      className="w-full bg-[#141414] border border-[#2e2e2e] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#9a9a9a] mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={editCustEmail}
                      onChange={(e) => setEditCustEmail(e.target.value)}
                      className="w-full bg-[#141414] border border-[#2e2e2e] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#9a9a9a] mb-1">Ciudad</label>
                    <input
                      type="text"
                      value={editCustCity}
                      onChange={(e) => setEditCustCity(e.target.value)}
                      className="w-full bg-[#141414] border border-[#2e2e2e] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Order Status & Tracking & Payment Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[#2e2e2e] pb-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#9a9a9a] mb-1">Estado de Pedido</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Order['status'])}
                    className="w-full bg-[#141414] border border-[#2e2e2e] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase"
                  >
                    <option value="PAID">Por Empacar (Pagado)</option>
                    <option value="PENDING">Por Despachar</option>
                    <option value="SHIPPED">Enviado</option>
                    <option value="DELIVERED">Entregado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#9a9a9a] mb-1">Guía de Envío</label>
                  <input
                    type="text"
                    value={editTracking}
                    onChange={(e) => setEditTracking(e.target.value)}
                    placeholder="NÚMERO DE GUÍA"
                    className="w-full bg-[#141414] border border-[#2e2e2e] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#9a9a9a] mb-1">Método de Pago</label>
                  <select
                    value={editPayMethod}
                    onChange={(e) => setEditPayMethod(e.target.value)}
                    className="w-full bg-[#141414] border border-[#2e2e2e] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase"
                  >
                    <option value="NEQUI">NEQUI</option>
                    <option value="BANCOLOMBIA">BANCOLOMBIA</option>
                    <option value="DAVIPLATA">DAVIPLATA</option>
                    <option value="MERCADOPAGO">MERCADOPAGO</option>
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-6 py-3 border border-[#2e2e2e] text-[#9a9a9a] hover:text-white font-mono text-xs transition rounded-none uppercase"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#FFD400] text-black font-display font-bold text-xl tracking-wider transition hover:bg-[#ffe033] rounded-none"
                >
                  GUARDAR CAMBIOS
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 font-mono text-xs shadow-xl flex items-center gap-2 animate-bounce rounded-none border ${
          toast.type === 'success' ? 'bg-[#1a2e1a] border-green-500 text-green-400' : 'bg-[#2e1a1a] border-red-500 text-red-400'
        }`}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          <span className="uppercase tracking-wider">{toast.message}</span>
        </div>
      )}

    </div>
  );
}

