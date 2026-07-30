import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  obtenerInventarioValorizado, obtenerRotacion, obtenerMermas, obtenerAlertasStock,
  descargarInventarioPdf, descargarInventarioExcel,
} from '../services/reportesService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const TABS = [
  { key: 'valorizado', label: 'Inventario valorizado' },
  { key: 'rotacion', label: 'Rotación de productos' },
  { key: 'mermas', label: 'Mermas' },
  { key: 'alertas', label: 'Alertas de stock' },
];

export default function ReportesPage() {
  const [tab, setTab] = useState('valorizado');

  return (
    <div>
      <PageHeader title="Reportes" subtitle="Inventario valorizado, rotación, mermas y alertas de stock" />

      <div className="flex gap-1 mb-4 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tab-btn ${tab === t.key ? 'tab-btn-active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'valorizado' && <InventarioValorizadoTab />}
      {tab === 'rotacion' && <RotacionTab />}
      {tab === 'mermas' && <MermasTab />}
      {tab === 'alertas' && <AlertasTab />}
    </div>
  );
}

function InventarioValorizadoTab() {
  const { data, isLoading } = useQuery({ queryKey: ['reporte-valorizado'], queryFn: obtenerInventarioValorizado });
  const [exportando, setExportando] = useState('');

  const exportar = async (tipo) => {
    setExportando(tipo);
    try {
      if (tipo === 'pdf') await descargarInventarioPdf();
      else await descargarInventarioExcel();
    } catch {
      toast.error('No se pudo generar el archivo');
    } finally {
      setExportando('');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-ink-400">
          Valor total del inventario: <span className="font-bold text-ink-900">${(data?.total || 0).toFixed(2)}</span>
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportar('pdf')} disabled={exportando === 'pdf'}>
            {exportando === 'pdf' ? 'Generando...' : 'Exportar PDF'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportar('excel')} disabled={exportando === 'excel'}>
            {exportando === 'excel' ? 'Generando...' : 'Exportar Excel'}
          </Button>
        </div>
      </div>

      <div className="panel overflow-hidden">
        {isLoading ? <Spinner /> : !data?.items?.length ? (
          <EmptyState title="Sin datos de inventario" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th className="text-right!">Stock</th>
                <th className="text-right!">Precio</th>
                <th className="text-right!">Valor total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r.codigo}>
                  <td className="text-ink-400">{r.codigo}</td>
                  <td className="font-medium text-ink-900">{r.nombre}</td>
                  <td className="text-ink-600">{r.categoria || '—'}</td>
                  <td className="text-right text-ink-900">{r.stock_total}</td>
                  <td className="text-right text-ink-900">${Number(r.precio_unitario).toFixed(2)}</td>
                  <td className="text-right font-medium text-ink-900">${Number(r.valor_total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function RotacionTab() {
  const [dias, setDias] = useState(30);
  const { data, isLoading } = useQuery({ queryKey: ['reporte-rotacion', dias], queryFn: () => obtenerRotacion(dias) });

  return (
    <div>
      <div className="flex justify-end mb-3">
        <select value={dias} onChange={(e) => setDias(Number(e.target.value))} className="field-input max-w-[180px]">
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
        </select>
      </div>
      <div className="panel overflow-hidden">
        {isLoading ? <Spinner /> : !data?.items?.length ? (
          <EmptyState title="Sin movimientos en el periodo" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th className="text-right!">Unidades salida</th>
                <th className="text-right!">Unidades entrada</th>
                <th className="text-right!">Total movimientos</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r.codigo}>
                  <td>
                    <p className="font-medium text-ink-900">{r.nombre}</p>
                    <p className="text-xs text-ink-400">{r.codigo}</p>
                  </td>
                  <td className="text-right text-state-danger font-medium">{r.unidades_salida}</td>
                  <td className="text-right text-state-ok font-medium">{r.unidades_entrada}</td>
                  <td className="text-right text-ink-600">{r.total_movimientos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MermasTab() {
  const { data, isLoading } = useQuery({ queryKey: ['reporte-mermas'], queryFn: obtenerMermas });

  return (
    <div className="panel overflow-hidden">
      {isLoading ? <Spinner /> : !data?.length ? (
        <EmptyState title="Sin mermas registradas" subtitle="Los ajustes que reducen stock aparecerán aquí" />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Almacén</th>
              <th className="text-right!">Unidades perdidas</th>
              <th>Motivo</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.id}>
                <td className="text-ink-400 whitespace-nowrap">{new Date(m.created_at).toLocaleDateString('es-MX')}</td>
                <td>
                  <p className="font-medium text-ink-900">{m.nombre}</p>
                  <p className="text-xs text-ink-400">{m.codigo}</p>
                </td>
                <td className="text-ink-600">{m.almacen}</td>
                <td className="text-right text-state-danger font-medium">-{m.unidades_perdidas}</td>
                <td className="text-ink-600">{m.motivo || '—'}</td>
                <td className="text-ink-600">{m.usuario_nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AlertasTab() {
  const { data, isLoading } = useQuery({ queryKey: ['reporte-alertas'], queryFn: obtenerAlertasStock });

  return (
    <div className="panel overflow-hidden">
      {isLoading ? <Spinner /> : !data?.length ? (
        <EmptyState title="Todo el stock está en niveles saludables" />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th className="text-right!">Stock actual</th>
              <th className="text-right!">Stock mínimo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id}>
                <td className="font-medium text-ink-900">{p.nombre}</td>
                <td className="text-ink-600">{p.categoria || '—'}</td>
                <td className="text-right text-ink-900">{p.stock_total}</td>
                <td className="text-right text-ink-400">{p.stock_minimo}</td>
                <td>
                  <Badge color={p.stock_total === 0 ? 'red' : 'yellow'}>
                    {p.stock_total === 0 ? 'Agotado' : 'Stock bajo'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
