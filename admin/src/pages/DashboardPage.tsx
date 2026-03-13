import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, generateAccessCode, daysRemaining, type User, type Device } from '../lib/supabase';

interface DashboardProps {
  onLogout: () => void;
}

interface UserWithDevices extends User {
  devices: Device[];
}

export function DashboardPage({ onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithDevices[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newMaxDevices, setNewMaxDevices] = useState(1);
  const [newCode, setNewCode] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersData) {
      const usersWithDevices: UserWithDevices[] = [];
      for (const user of usersData) {
        const { data: devicesData } = await supabase
          .from('devices')
          .select('*')
          .eq('user_id', user.id)
          .order('registered_at', { ascending: false });
        usersWithDevices.push({ ...user, devices: devicesData || [] });
      }
      setUsers(usersWithDevices);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!newLabel.trim()) return;
    setCreating(true);
    const code = newCode || generateAccessCode();
    const { error } = await supabase.from('users').insert({
      access_code: code,
      label: newLabel.trim(),
      max_devices: newMaxDevices,
    });
    if (error) {
      alert('Error: ' + error.message);
    } else {
      setShowCreateModal(false);
      setNewLabel('');
      setNewMaxDevices(1);
      setNewCode('');
      fetchUsers();
    }
    setCreating(false);
  };

  const handleToggleActive = async (user: User) => {
    await supabase.from('users').update({ is_active: !user.is_active }).eq('id', user.id);
    fetchUsers();
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`¿Eliminar a "${user.label}" y todos sus dispositivos?`)) return;
    await supabase.from('users').delete().eq('id', user.id);
    fetchUsers();
  };

  const getActiveDevices = (devices: Device[]) =>
    devices.filter(d => d.is_active && new Date(d.expires_at) > new Date());

  const getExpiringDevices = (devices: Device[]) =>
    devices.filter(d => d.is_active && daysRemaining(d.expires_at) <= 5 && daysRemaining(d.expires_at) > 0);

  const getExpiredDevices = (devices: Device[]) =>
    devices.filter(d => d.is_active && new Date(d.expires_at) <= new Date());

  // Alerts: users with devices about to expire
  const expiringAlerts = users.flatMap(u =>
    getExpiringDevices(u.devices).map(d => ({
      user: u,
      device: d,
      days: daysRemaining(d.expires_at),
    }))
  );

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Hornero TV - Admin</h1>
          <span style={styles.count}>{users.length} usuarios</span>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.btnPrimary} onClick={() => { setNewCode(generateAccessCode()); setShowCreateModal(true); }}>
            + Nuevo Usuario
          </button>
          <button style={styles.btnSecondary} onClick={onLogout}>Salir</button>
        </div>
      </header>

      {/* Expiring alerts */}
      {expiringAlerts.length > 0 && (
        <div style={styles.alertBox}>
          <strong>Dispositivos por vencer:</strong>
          {expiringAlerts.map((a, i) => (
            <div key={i} style={styles.alertItem}>
              {a.user.label} - {a.device.device_name || a.device.device_id.slice(0, 12)} - {a.days} días restantes
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p style={styles.loading}>Cargando...</p>
      ) : (
        <div style={styles.grid}>
          {users.map(user => {
            const active = getActiveDevices(user.devices);
            const expired = getExpiredDevices(user.devices);
            return (
              <div key={user.id} style={{
                ...styles.card,
                borderLeft: user.is_active ? '4px solid #27ae60' : '4px solid #e74c3c',
              }}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.userName}>{user.label}</h3>
                    <div style={styles.code}>{user.access_code}</div>
                  </div>
                  <div style={styles.cardActions}>
                    <button
                      style={user.is_active ? styles.btnSmallDanger : styles.btnSmallSuccess}
                      onClick={() => handleToggleActive(user)}
                    >
                      {user.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button style={styles.btnSmallDanger} onClick={() => handleDelete(user)}>
                      Eliminar
                    </button>
                  </div>
                </div>
                <div style={styles.deviceInfo}>
                  <span>Dispositivos: {active.length}/{user.max_devices}</span>
                  {expired.length > 0 && (
                    <span style={styles.expiredBadge}>{expired.length} expirado(s)</span>
                  )}
                </div>
                <button style={styles.btnLink} onClick={() => navigate(`/user/${user.id}`)}>
                  Ver detalles →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create user modal */}
      {showCreateModal && (
        <div style={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Nuevo Usuario</h2>
            <label style={styles.label}>Nombre / Etiqueta</label>
            <input
              style={styles.input}
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="Ej: Juan Pérez"
              autoFocus
            />
            <label style={styles.label}>Código de acceso (6 dígitos)</label>
            <input
              style={styles.input}
              value={newCode}
              onChange={e => setNewCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Se genera automáticamente"
            />
            <label style={styles.label}>Máximo de dispositivos</label>
            <input
              style={styles.input}
              type="number"
              min={1}
              max={10}
              value={newMaxDevices}
              onChange={e => setNewMaxDevices(Number(e.target.value))}
            />
            <div style={styles.modalActions}>
              <button style={styles.btnSecondary} onClick={() => setShowCreateModal(false)}>Cancelar</button>
              <button
                style={styles.btnPrimary}
                onClick={handleCreate}
                disabled={creating || !newLabel.trim() || newCode.length !== 6}
              >
                {creating ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#1a1210', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { color: '#D4A574', margin: 0, fontSize: '24px' },
  count: { color: '#888', fontSize: '14px' },
  headerActions: { display: 'flex', gap: '12px' },
  btnPrimary: { padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#8B5E3C', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnSecondary: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #555', background: 'transparent', color: '#ccc', fontSize: '14px', cursor: 'pointer' },
  alertBox: { background: '#3d2e0f', border: '1px solid #f39c12', borderRadius: '8px', padding: '16px', marginBottom: '24px' },
  alertItem: { color: '#f39c12', fontSize: '14px', marginTop: '4px' },
  loading: { color: '#888', textAlign: 'center', marginTop: '60px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' },
  card: { background: '#2a2018', borderRadius: '12px', padding: '20px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  userName: { margin: '0 0 4px 0', fontSize: '18px', color: '#fff' },
  code: { fontFamily: 'monospace', fontSize: '20px', color: '#D4A574', fontWeight: 'bold', letterSpacing: '2px' },
  cardActions: { display: 'flex', gap: '8px' },
  btnSmallDanger: { padding: '6px 12px', borderRadius: '6px', border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', fontSize: '12px', cursor: 'pointer' },
  btnSmallSuccess: { padding: '6px 12px', borderRadius: '6px', border: '1px solid #27ae60', background: 'transparent', color: '#27ae60', fontSize: '12px', cursor: 'pointer' },
  deviceInfo: { margin: '12px 0 8px', fontSize: '14px', color: '#aaa', display: 'flex', justifyContent: 'space-between' },
  expiredBadge: { color: '#e74c3c', fontSize: '12px', fontWeight: '600' },
  btnLink: { background: 'none', border: 'none', color: '#D4A574', cursor: 'pointer', fontSize: '14px', padding: 0 },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalContent: { background: '#2a2018', borderRadius: '16px', padding: '32px', minWidth: '380px', maxWidth: '90vw' },
  modalTitle: { color: '#D4A574', margin: '0 0 20px 0' },
  label: { color: '#aaa', fontSize: '13px', display: 'block', marginBottom: '4px', marginTop: '12px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #444', background: '#1a1210', color: '#fff', fontSize: '15px', boxSizing: 'border-box' as const },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' },
};
