import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listarUsuarios, actualizarEstadoUsuario } from '../services/usuariosService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const ROLE_COLORS = { Admin: 'red', Gerente: 'yellow', Almacenista: 'green' };

export default function UsuariosPage() {
  const queryClient = useQueryClient();
  const { data: usuarios, isLoading } = useQuery({ queryKey: ['usuarios'], queryFn: listarUsuarios });

  const toggleMutation = useMutation({
    mutationFn: ({ id, activo }) => actualizarEstadoUsuario(id, activo),
    onSuccess: () => {
      toast.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error al actualizar usuario'),
  });

  return (
    <div>
      <PageHeader title="Usuarios" subtitle="Gestión de acceso y roles del sistema" />

      <div className="panel overflow-hidden">
        {isLoading ? <Spinner /> : !usuarios?.length ? (
          <EmptyState title="No hay usuarios" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th className="text-right!">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium text-ink-900">{u.nombre}</td>
                  <td className="text-ink-600">{u.email}</td>
                  <td><Badge color={ROLE_COLORS[u.rol]}>{u.rol}</Badge></td>
                  <td>
                    <Badge color={u.activo ? 'green' : 'slate'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </td>
                  <td className="text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleMutation.mutate({ id: u.id, activo: !u.activo })}
                      disabled={toggleMutation.isPending}
                    >
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
