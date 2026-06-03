'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';

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

  const columns: { title: string; status: Order['status']; color: string }[] = [
    { title: 'Por Empacar', status: 'PAID', color: 'border-blue-500/20' },
    { title: 'Por Despachar', status: 'PENDING', color: 'border-orange-500/20' },
    { title: 'Enviado', status: 'SHIPPED', color: 'border-purple-500/20' },
    { title: 'Entregado', status: 'DELIVERED', color: 'border-green-500/20' }
  ];


  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 lg:p-8 font-body">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-[var(--border)] pb-6">
          <div>
            <h1 className="font-display text-4xl lg:text-5xl text-[#FFD400] tracking-wider uppercase">PANEL CRM</h1>
            <p className="text-xs font-mono text-[var(--text-dim)] mt-1 uppercase tracking-widest">CONTROL DE PEDIDOS & INVENTARIO</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none px-6 py-3 bg-[#FFD400] text-black font-display font-bold text-lg tracking-wider hover:bg-[#ffe033] active:scale-98 transition rounded-none uppercase"
            >
              + REGISTRAR VENTA MANUAL
            </button>
            <button
              onClick={loadData}
              className="px-4 py-3 border border-[var(--border)] hover:border-[#FFD400] hover:text-[#FFD400] font-mono text-xs tracking-wider transition rounded-none uppercase"
            >
              ACTUALIZAR DATOS
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Metric 1: Stock Crítico */}
          <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-none">
            <span className="font-mono text-[10px] text-[var(--text-dim)] uppercase tracking-widest block mb-2">STOCK CRÍTICO</span>
            <span className={`text-3xl font-bold font-mono ${stockCriticoCount > 0 ? 'text-red-500' : 'text-[var(--text)]'}`}>
              {stockCriticoCount}
            </span>
            <span className="text-xs text-[var(--text-muted)] block mt-1">Productos con stock &lt; 3</span>
          </div>

          {/* Metric 2: Caja del Mes */}
          <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-none">
            <span className="font-mono text-[10px] text-[var(--text-dim)] uppercase tracking-widest block mb-2">CAJA DEL MES</span>
            <span className="text-3xl font-bold text-[#FFD400] font-mono">
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(cajaDelMes)}
            </span>
            <span className="text-xs text-[var(--text-muted)] block mt-1">Ingresos mes actual</span>
          </div>

          {/* Metric 3: Pedidos Pendientes */}
          <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-none">
            <span className="font-mono text-[10px] text-[var(--text-dim)] uppercase tracking-widest block mb-2">PEDIDOS PENDIENTES</span>
            <span className="text-3xl font-bold text-[var(--text)] font-mono">
              {pedidosPendientesCount}
            </span>
            <span className="text-xs text-[var(--text-muted)] block mt-1">Por empaquetar / enviar</span>
          </div>

          {/* Metric 4: Conversión Web vs WA */}
          <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-none">
            <span className="font-mono text-[10px] text-[var(--text-dim)] uppercase tracking-widest block mb-2">CONVERSIÓN WEB VS WA</span>
            <div className="flex gap-4 items-baseline">
              <span className="text-2xl font-bold text-[var(--text)] font-mono">{webPct}% <span className="text-xs text-[var(--text-muted)] font-sans">Web</span></span>
              <span className="text-xl font-bold text-[#FFD400] font-mono">{waPct}% <span className="text-xs text-[var(--text-muted)] font-sans">WA</span></span>
            </div>
            <span className="text-xs text-[var(--text-muted)] block mt-1">Origen de pedidos</span>
          </div>

        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(col => {
            const columnOrders = orders.filter(o => o.status === col.status);
            return (
              <div
                key={col.status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.status)}
                className={`bg-[#181818] border ${col.color} p-4 rounded-none flex flex-col min-h-[500px]`}
              >
                <div className="flex justify-between items-center mb-4 border-b border-[var(--border)] pb-2">
                  <h3 className="font-display text-2xl tracking-wider text-[var(--text)] uppercase">{col.title}</h3>
                  <span className="bg-[#1c1c1c] text-[var(--text-muted)] border border-[var(--border)] font-mono text-xs px-2 py-0.5 rounded-none">
                    {columnOrders.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                  {loading ? (
                    <div className="text-center py-8 text-[var(--text-dim)] text-xs font-mono">CARGANDO...</div>
                  ) : columnOrders.length === 0 ? (
                    <div className="text-center py-8 text-[var(--text-dim)] text-xs font-mono border border-dashed border-[var(--border)] rounded-none">
                      ARRASTRAR AQUÍ
                    </div>
                  ) : (
                    columnOrders.map(order => (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, order.id)}
                        className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-light)] p-4 rounded-none cursor-grab active:cursor-grabbing transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[9px] font-mono tracking-wider font-bold px-1.5 py-0.5 rounded-none ${order.source === 'WEB' ? 'bg-[#FFD400] text-black' : 'bg-[#25d366] text-white'}`}>
                            {order.source}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--text-dim)]">
                            {new Date(order.created_at).toLocaleDateString('es-CO')}
                          </span>
                        </div>

                        <div className="font-display text-xl text-[var(--text)] tracking-wide mb-1 uppercase">{order.crm_customers?.name || 'Cliente'}</div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono mb-2 uppercase">
                          {order.crm_customers?.city || 'Sin ciudad'} · {order.payment_method || 'Sin método'}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                          <span className="text-sm font-bold font-mono text-[#FFD400]">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(order.total_amount)}
                          </span>
                          
                          <div className="flex items-center gap-1 md:hidden">
                            {col.status !== 'PAID' && (
                              <button
                                onClick={() => {
                                  const idx = columns.findIndex(c => c.status === col.status);
                                  if (idx > 0) updateOrderStatus(order.id, columns[idx - 1].status);
                                }}
                                className="p-1 bg-[#141414] border border-[var(--border)] text-[var(--text-dim)] hover:text-white text-xs rounded-none"
                              >
                                ◀
                              </button>
                            )}
                            {col.status !== 'DELIVERED' && (
                              <button
                                onClick={() => {
                                  const idx = columns.findIndex(c => c.status === col.status);
                                  if (idx < columns.length - 1) updateOrderStatus(order.id, columns[idx + 1].status);
                                }}
                                className="p-1 bg-[#141414] border border-[var(--border)] text-[var(--text-dim)] hover:text-white text-xs rounded-none"
                              >
                                ▶
                              </button>
                            )}
                          </div>
                        </div>

                        {col.status === 'SHIPPED' && (
                          <div className="mt-3 pt-3 border-t border-dashed border-[var(--border)]">
                            {editingTrackingId === order.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={trackingNumberInput}
                                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                                  placeholder="GUÍA DE ENVÍO"
                                  className="w-full bg-[#141414] border border-[var(--border)] p-2 text-xs text-white outline-none rounded-none uppercase font-mono"
                                  autoFocus
                                />
                                <button
                                  onClick={() => updateTrackingNumber(order.id)}
                                  className="px-3 py-1 bg-[#FFD400] text-black text-xs font-bold rounded-none"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => setEditingTrackingId(null)}
                                  className="px-3 py-1 bg-[#141414] border border-[var(--border)] text-[var(--text-dim)] text-xs rounded-none"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingTrackingId(order.id);
                                  setTrackingNumberInput(order.tracking_number || '');
                                }}
                                className="text-xs text-[#FFD400] hover:text-[#ffe033] cursor-pointer hover:underline flex justify-between items-center font-mono"
                              >
                                <span>GUÍA: {order.tracking_number || 'AÑADIR NÚMERO...'}</span>
                                <span className="text-[10px] text-[var(--text-dim)]">✏</span>
                              </div>
                            )}
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
          <div className="bg-[var(--surface)] border border-[var(--border)] w-full max-w-2xl rounded-none shadow-[0_0_50px_rgba(0,0,0,0.9)] p-6 relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--text-dim)] hover:text-white font-mono text-xl"
            >
              ✕
            </button>

            <h2 className="text-3xl font-display text-[#FFD400] uppercase tracking-wider mb-6">
              REGISTRAR VENTA MANUAL (WA)
            </h2>

            <form onSubmit={handleCreateManualOrder} className="space-y-6">
              
              {/* Customer Info Group */}
              <div className="border-b border-[var(--border)] pb-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-dim)] mb-3">Datos del Cliente</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[var(--text-dim)] mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="EJ. JUAN PÉREZ"
                      className="w-full bg-[#141414] border border-[var(--border)] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase placeholder:text-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[var(--text-dim)] mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="EJ. 3001234567"
                      className="w-full bg-[#141414] border border-[var(--border)] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase placeholder:text-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[var(--text-dim)] mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="EJ. CLIENTE@GMAIL.COM"
                      className="w-full bg-[#141414] border border-[var(--border)] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase placeholder:text-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[var(--text-dim)] mb-1">Ciudad</label>
                    <input
                      type="text"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      placeholder="EJ. BOGOTÁ"
                      className="w-full bg-[#141414] border border-[var(--border)] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase placeholder:text-zinc-700"
                    />
                  </div>
                </div>
              </div>

              {/* Product Selector Group */}
              <div className="border-b border-[var(--border)] pb-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-dim)] mb-3">Agregar Productos</h3>
                <div className="flex flex-col sm:flex-row gap-2 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-mono uppercase text-[var(--text-dim)] mb-1">Seleccionar Producto</label>
                    <select
                      value={currentSelectedProductId}
                      onChange={(e) => setCurrentSelectedProductId(e.target.value)}
                      className="w-full bg-[#141414] border border-[var(--border)] p-2.5 text-xs text-white outline-none focus:border-[#FFD400] transition rounded-none uppercase"
                    >
                      <option value="">-- ELIGE UN PRODUCTO --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.inventory <= 0} className="bg-[var(--surface)] text-[var(--text)]">
                          {p.name.toUpperCase()} ({p.inventory} DISPONIBLES) - ${p.price.toLocaleString('es-CO')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-24">
                    <label className="block text-[10px] font-mono uppercase text-[var(--text-dim)] mb-1">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      value={currentQty}
                      onChange={(e) => setCurrentQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-[#141414] border border-[var(--border)] p-2.5 text-xs text-white text-center outline-none focus:border-[#FFD400] transition rounded-none"
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
                  <div className="mt-4 bg-[#141414] border border-[var(--border)] p-2 rounded-none space-y-2">
                    {selectedItems.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-xs p-2 border-b border-[var(--border)] last:border-0">
                        <div>
                          <div className="font-bold text-zinc-300 uppercase">{item.name}</div>
                          <div className="text-[var(--text-muted)] font-mono text-[10px]">
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
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-dim)] mb-3">Método de Pago</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['NEQUI', 'BANCOLOMBIA', 'DAVIPLATA', 'MERCADOPAGO'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 font-mono text-xs font-bold border transition rounded-none ${
                        paymentMethod === method
                          ? 'bg-[#FFD400] text-black border-[#FFD400]'
                          : 'bg-[#141414] text-[var(--text-dim)] border-[var(--border)] hover:border-zinc-500'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total & Submit */}
              <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-dim)] block">Total del Pedido</span>
                  <span className="text-2xl font-black font-mono text-[#FFD400]">
                    ${calculateTotalOrderAmount().toLocaleString('es-CO')}
                  </span>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 sm:w-auto px-6 py-3 border border-[var(--border)] text-[var(--text-dim)] hover:text-white font-mono text-xs transition rounded-none uppercase"
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

