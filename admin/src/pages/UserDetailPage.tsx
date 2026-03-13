import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, daysRemaining, expiryStatus, type User, type Device } from '../lib/supabase';

interface UserDetailProps {
  onLogout: () => void;
}

export function UserDetailPage({ onLogout }: UserDetailProps) {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMaxDevices, setEditMaxDevices] = useState(false);
  const [newMaxDevices, setNewMaxDevices] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userData) {
      setUser(userData);
      setNewMaxDevices(userData.max_devices);
    }

    const { data: devicesData } = await supabase
      .from('devices')
      .select('*')
      .eq('user_id', userId)
      .order('registered_at', { ascending: false });

    setDevices(devicesData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [userId]);

  const handleRevokeDevice = async (deviceId: string) => {
    await supabase.from('devices').update({ is_active: false }).eq('id', deviceId);
    fetchData();
  };

  const handleReactivateDevice = async (deviceId: string) => {
    await supabase.from('devices').update({
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).eq('id', deviceId);
    fetchData();
  };

  const handleRenewDevice = async (deviceId: string) => {
    await supabase.from('devices').update({
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).eq('id', deviceId);
    fetchData();
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm('¿Eliminar este dispositivo?')) return;
    await supabase.from('devices').delete().eq('id', deviceId);
    fetchData();
  };

  const handleUpdateMaxDevices = async () => {
    await supabase.from('users').update({ max_devices: newMaxDevices }).eq('id', userId);
    setEditMaxDevices(false);
    fetchData();
  };

  const statusColors: Record<string, string> = {
    ok: '#27ae60',
    warning: '#f39c12',
    expired: '#e74c3c',
    revoked: '#888',
  };

  const statusLabels: Record<string, string> = {
    ok: 'Activo',
    warning: 'Por vencer',
    expired: 'Expirado',
    revoked: 'Revocado',
  };

  if (loading) return <div style={styles.page}><p style={styles.loading}>Cargando...</p></div>;
  if (!user) return <div style={styles.page}><p style={styles.loading}>Usuario no encontrado</p></div>;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <button style={styles.backBtn} onClick={() => navigate('/')}>← Volver</button>
          <h1 style={styles.title}>{user.label}</h1>
          <div style={styles.codeDisplay}>{user.access_code}</div>
        </div>
        <div>
          <span style={{ color: user.is_active ? '#27ae60' : '#e74c3c', fontWeight: 'bold', fontSize: '14px' }}>
            {user.is_active ? 'ACTIVO' : 'DESACTIVADO'}
          </span>
        </div>
      </header>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            Dispositivos ({devices.filter(d => d.is_active && new Date(d.expires_at) > new Date()).length}/{user.max_devices})
          </h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {editMaxDevices ? (
              <>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newMaxDevices}
                  onChange={e => setNewMaxDevices(Number(e.target.value))}
                  style={{ ...styles.inputSmall }}
                />
                <button style={styles.btnSmall} onClick={handleUpdateMaxDevices}>Guardar</button>
                <button style={styles.btnSmallGhost} onClick={() => setEditMaxDevices(false)}>Cancelar</button>
              </>
            ) : (
              <button style={styles.btnSmall} onClick={() => setEditMaxDevices(true)}>
                Cambiar máximo
              </button>
            )}
          </div>
        </div>

        {devices.length === 0 ? (
          <p style={styles.empty}>No hay dispositivos registrados.</p>
        ) : (
          <div style={styles.deviceList}>
            {devices.map(device => {
              const status = expiryStatus(device.expires_at, device.is_active);
              const days = daysRemaining(device.expires_at);
              return (
                <div key={device.id} style={styles.deviceCard}>
                  <div style={styles.deviceHeader}>
                    <div>
                      <h4 style={styles.deviceName}>{device.device_name || 'Dispositivo sin nombre'}</h4>
                      <code style={styles.deviceId}>{device.device_id.length > 20 ? device.device_id.slice(0, 20) + '...' : device.device_id}</code>
                    </div>
                    <span style={{
                      ...styles.statusBadge,
                      background: statusColors[status] + '22',
                      color: statusColors[status],
                      borderColor: statusColors[status],
                    }}>
                      {statusLabels[status]}
                    </span>
                  </div>

                  <div style={styles.deviceMeta}>
                    <div>
                      <span style={styles.metaLabel}>Registrado:</span>{' '}
                      {new Date(device.registered_at).toLocaleDateString('es-AR')}
                    </div>
                    <div>
                      <span style={styles.metaLabel}>Expira:</span>{' '}
                      {new Date(device.expires_at).toLocaleDateString('es-AR')}
                      {status === 'ok' && <span style={{ color: '#27ae60' }}> ({days} días)</span>}
                      {status === 'warning' && <span style={{ color: '#f39c12' }}> ({days} días!)</span>}
                      {status === 'expired' && <span style={{ color: '#e74c3c' }}> (vencido)</span>}
                    </div>
                    {device.last_seen_at && (
                      <div>
                        <span style={styles.metaLabel}>Último uso:</span>{' '}
                        {new Date(device.last_seen_at).toLocaleDateString('es-AR')}
                      </div>
                    )}
                  </div>

                  <div style={styles.deviceActions}>
                    {device.is_active && status !== 'expired' && (
                      <button style={styles.btnActionDanger} onClick={() => handleRevokeDevice(device.id)}>
                        Revocar
                      </button>
                    )}
                    {(status === 'expired' || status === 'warning') && device.is_active && (
                      <button style={styles.btnActionSuccess} onClick={() => handleRenewDevice(device.id)}>
                        Renovar 30 días
                      </button>
                    )}
                    {!device.is_active && (
                      <button style={styles.btnActionSuccess} onClick={() => handleReactivateDevice(device.id)}>
                        Reactivar
                      </button>
                    )}
                    <button style={styles.btnActionDanger} onClick={() => handleDeleteDevice(device.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#1a1210', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '24px', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  backBtn: { background: 'none', border: 'none', color: '#D4A574', cursor: 'pointer', fontSize: '14px', padding: 0, marginBottom: '8px', display: 'block' },
  title: { color: '#fff', margin: '0 0 4px 0', fontSize: '28px' },
  codeDisplay: { fontFamily: 'monospace', fontSize: '28px', color: '#D4A574', fontWeight: 'bold', letterSpacing: '4px' },
  loading: { color: '#888', textAlign: 'center', marginTop: '60px' },
  section: { background: '#2a2018', borderRadius: '12px', padding: '24px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { color: '#D4A574', margin: 0, fontSize: '18px' },
  btnSmall: { padding: '6px 14px', borderRadius: '6px', border: '1px solid #D4A574', background: 'transparent', color: '#D4A574', fontSize: '13px', cursor: 'pointer' },
  btnSmallGhost: { padding: '6px 14px', borderRadius: '6px', border: '1px solid #555', background: 'transparent', color: '#888', fontSize: '13px', cursor: 'pointer' },
  inputSmall: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #444', background: '#1a1210', color: '#fff', fontSize: '14px', width: '60px' },
  empty: { color: '#666', textAlign: 'center', padding: '32px' },
  deviceList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  deviceCard: { background: '#1a1210', borderRadius: '10px', padding: '16px' },
  deviceHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  deviceName: { margin: '0 0 4px 0', fontSize: '16px', color: '#fff' },
  deviceId: { fontSize: '12px', color: '#666' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', border: '1px solid' },
  deviceMeta: { display: 'flex', gap: '24px', flexWrap: 'wrap' as const, fontSize: '13px', color: '#aaa', marginBottom: '12px' },
  metaLabel: { color: '#666' },
  deviceActions: { display: 'flex', gap: '8px' },
  btnActionDanger: { padding: '6px 14px', borderRadius: '6px', border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', fontSize: '12px', cursor: 'pointer' },
  btnActionSuccess: { padding: '6px 14px', borderRadius: '6px', border: '1px solid #27ae60', background: 'transparent', color: '#27ae60', fontSize: '12px', cursor: 'pointer' },
};
