import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { buscarPorCodigoBarras } from '../services/productosService';
import { listarAlmacenes } from '../services/almacenesService';
import { registrarMovimiento, actualizarUbicacion } from '../services/movimientosService';
import Spinner from '../components/ui/Spinner';

function ProductPhoto({ src }) {
  const [errorImg, setErrorImg] = useState(false);
  if (!src || errorImg) {
    return (
      <div className="w-full aspect-square bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      onError={() => setErrorImg(true)}
      className="w-full aspect-square object-cover rounded-2xl border border-slate-200 bg-slate-50"
    />
  );
}

function UbicacionRow({ fila, productoId, onGuardado }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(fila.ubicacion || '');

  const mutation = useMutation({
    mutationFn: () => actualizarUbicacion(productoId, fila.almacen_id, valor.trim() || null),
    onSuccess: () => {
      toast.success('Ubicación actualizada');
      setEditando(false);
      onGuardado();
    },
    onError: () => toast.error('No se pudo actualizar la ubicación'),
  });

  return (
    <div className="flex items-center justify-between py-2.5 px-3.5 bg-slate-50 rounded-xl border border-slate-200">
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-800 truncate">{fila.almacen_nombre}</p>
        {editando ? (
          <div className="flex items-center gap-1.5 mt-1">
            <input
              autoFocus
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ej. Rack A-3"
              className="px-2 py-1 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/30 w-32"
            />
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="text-emerald-600 hover:text-emerald-700 cursor-pointer"
              aria-label="Guardar ubicación"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button onClick={() => setEditando(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer" aria-label="Cancelar">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button onClick={() => setEditando(true)} className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 cursor-pointer hover:text-orange-600">
            <span>{fila.ubicacion || 'Sin ubicación asignada'}</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
      </div>
      <span className="text-sm font-extrabold text-slate-900 shrink-0 ml-3">{fila.cantidad}</span>
    </div>
  );
}

function AccionRapidaSheet({ tipo, producto, almacenes, onClose }) {
  const queryClient = useQueryClient();
  const [almacenId, setAlmacenId] = useState('');
  const [cantidad, setCantidad] = useState('');

  const mutation = useMutation({
    mutationFn: registrarMovimiento,
    onSuccess: () => {
      toast.success(tipo === 'entrada' ? 'Entrada registrada' : 'Salida registrada');
      queryClient.invalidateQueries({ queryKey: ['producto-escaneado'] });
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'No se pudo registrar el movimiento'),
  });

  const confirmar = () => {
    if (!almacenId || !cantidad || Number(cantidad) < 1) {
      toast.error('Selecciona almacén e ingresa una cantidad válida');
      return;
    }
    mutation.mutate({
      producto_id: producto.id,
      almacen_id: Number(almacenId),
      tipo,
      cantidad: Number(cantidad),
      motivo: 'Registrado desde escaneo móvil',
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl p-5 pb-7 sm:pb-5 animate-in fade-in slide-in-from-bottom-4 duration-150">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />
        <h3 className="font-bold text-slate-900 text-base mb-4">
          {tipo === 'entrada' ? 'Registrar entrada' : 'Registrar salida'}
        </h3>

        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Almacén</label>
            <select
              value={almacenId}
              onChange={(e) => setAlmacenId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="">Seleccionar almacén...</option>
              {almacenes?.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Cantidad</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        <div className="flex gap-2.5 mt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={mutation.isPending}
            className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 ${
              tipo === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {mutation.isPending ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductoEscaneadoPage() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [accion, setAccion] = useState(null);

  const { data: producto, isLoading, isError, refetch } = useQuery({
    queryKey: ['producto-escaneado', codigo],
    queryFn: () => buscarPorCodigoBarras(codigo),
    retry: false,
  });
  const { data: almacenes } = useQuery({ queryKey: ['almacenes'], queryFn: listarAlmacenes });

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col font-sans overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-10 shrink-0">
        <button
          onClick={() => navigate('/escanear')}
          className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Volver a escanear"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-slate-900 font-bold text-sm tracking-tight">Ficha de producto</h1>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center"><Spinner /></div>
      ) : isError || !producto ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-slate-700 font-semibold text-sm">Ningún producto encontrado con código "{codigo}"</p>
          <button
            onClick={() => navigate('/escanear')}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl text-xs cursor-pointer"
          >
            Volver a escanear
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-4 pb-8">
          <ProductPhoto src={producto.foto_url} />

          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{producto.nombre}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {producto.codigo}</p>
            {producto.categoria_nombre && (
              <span className="inline-flex items-center mt-2 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/70">
                {producto.categoria_nombre}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Precio</p>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                ${Number(producto.precio_unitario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stock total</p>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                {producto.stock_total} <span className="text-xs font-semibold text-slate-400">{producto.unidad_medida}</span>
              </p>
            </div>
          </div>

          {/* Stock por almacén + ubicación */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Stock por almacén</h3>
            <div className="space-y-2">
              {(producto.stockPorAlmacen || []).length === 0 ? (
                <p className="text-xs text-slate-400">Sin stock registrado en almacenes.</p>
              ) : (
                producto.stockPorAlmacen.map((fila) => (
                  <UbicacionRow key={fila.almacen_id} fila={fila} productoId={producto.id} onGuardado={refetch} />
                ))
              )}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setAccion('entrada')}
              className="py-3.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Entrada
            </button>
            <button
              onClick={() => setAccion('salida')}
              className="py-3.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
              </svg>
              Salida
            </button>
          </div>
        </div>
      )}

      {accion && (
        <AccionRapidaSheet
          tipo={accion}
          producto={producto}
          almacenes={almacenes}
          onClose={() => setAccion(null)}
        />
      )}
    </div>
  );
}
