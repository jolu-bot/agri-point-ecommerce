'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import {
  Search, Filter, RefreshCw, ChevronDown, CheckCircle, Clock, Mail,
  AlertTriangle, XCircle, Shield, User, Phone, MapPin, Calendar,
  MoreVertical, UserCheck, UserX, Ban, Trash2, Eye, X, Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// -- Types ----------------------------------------------------------------------
type AccountStatus = 'pending_email' | 'pending_admin' | 'approved' | 'rejected' | 'suspended';
type Role = 'user' | 'admin' | 'superadmin' | 'moderator' | 'distributor';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: boolean;
  role: Role;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  uniqueCode?: string;
  address?: { city?: string; region?: string; quartier?: string };
  createdAt: string;
  lastLoginAt?: string;
  loginAttempts?: number;
}

// -- Config --------------------------------------------------------------------
const STATUS_CFG: Record<AccountStatus, { label: string; color: string; dot: string }> = {
  approved:      { label: 'Actif',      color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800/40',  dot: 'bg-emerald-500' },
  pending_admin: { label: 'En attente', color: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800/40',              dot: 'bg-amber-500' },
  pending_email: { label: 'Email N/V',  color: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800/40',                    dot: 'bg-blue-500' },
  suspended:     { label: 'Suspendu',   color: 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800/40',       dot: 'bg-orange-500' },
  rejected:      { label: 'Rejeté',     color: 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800/40',                         dot: 'bg-red-500' },
};

const ROLE_CFG: Record<Role, { label: string; color: string }> = {
  superadmin:  { label: 'Super Admin',   color: 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800/40' },
  admin:       { label: 'Admin',         color: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/20 dark:border-rose-800/40' },
  moderator:   { label: 'Modérateur',    color: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-900/20 dark:border-indigo-800/40' },
  distributor: { label: 'Distributeur',  color: 'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-900/20 dark:border-teal-800/40' },
  user:        { label: 'Client',        color: 'text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700' },
};

const ROLES: Role[] = ['user', 'distributor', 'moderator', 'admin', 'superadmin'];

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
}

// -- Modal détail utilisateur ---------------------------------------------------
function UserDetailModal({ user, onClose, onAction }: { user: AdminUser; onClose: () => void; onAction: (id: string, type: string, value: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06] w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-black text-gray-900 dark:text-white">{user.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} title="Fermer" aria-label="Fermer" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Rôle',       value: ROLE_CFG[user.role]?.label ?? user.role },
              { label: 'Statut',     value: STATUS_CFG[user.accountStatus]?.label ?? user.accountStatus },
              { label: 'Téléphone',  value: user.phone ? `+237 ${user.phone}` : '—' },
              { label: 'WhatsApp',   value: user.whatsapp ? 'Oui' : 'Non' },
              { label: 'Région',     value: user.address?.region  || '—' },
              { label: 'Ville',      value: user.address?.city    || '—' },
              { label: 'Email vérifié', value: user.emailVerified ? 'Oui ✓' : 'Non' },
              { label: 'Inscrit le', value: fmtDate(user.createdAt) },
              { label: 'Dernière connexion', value: fmtDate(user.lastLoginAt) },
              { label: 'Tentatives échouées', value: String(user.loginAttempts ?? 0) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{value}</p>
              </div>
            ))}
          </div>

          {user.uniqueCode && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{user.uniqueCode}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button onClick={() => { onAction(user._id, 'status', 'approved'); onClose(); }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition">
              <UserCheck className="w-4 h-4" /> Approuver
            </button>
            <button onClick={() => { onAction(user._id, 'status', 'suspended'); onClose(); }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition">
              <Ban className="w-4 h-4" /> Suspendre
            </button>
            <button onClick={() => { onAction(user._id, 'status', 'rejected'); onClose(); }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-semibold transition">
              <UserX className="w-4 h-4" /> Rejeter
            </button>
            <button onClick={() => { onAction(user._id, 'status', 'pending_admin'); onClose(); }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-semibold transition">
              <Clock className="w-4 h-4" /> En attente
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Changer le rôle</p>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(r => (
                <button key={r} onClick={() => { onAction(user._id, 'role', r); onClose(); }}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition ${user.role === r ? 'ring-2 ring-emerald-500' : 'hover:opacity-80'} ${ROLE_CFG[r].color}`}>
                  {ROLE_CFG[r].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// -- Page principale ------------------------------------------------------------
export default function AdminUsersPage() {
  const [users,     setUsers]     = useState<AdminUser[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRole,   setFilterRole]   = useState<string>('all');
  const [selected,  setSelected]  = useState<AdminUser | null>(null);
  const [openMenu,  setOpenMenu]  = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/users', {
        headers:     { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();
      setUsers(data.users || data || []);
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // -- Actions ----------------------------------------------------------------
  const handleAction = async (userId: string, type: 'status' | 'role', value: string) => {
    const endpoint = type === 'status'
      ? `/api/admin/users/${userId}/status`
      : `/api/admin/users/${userId}/role`;
    const body = type === 'status' ? { accountStatus: value } : { role: value };

    try {
      const res = await fetch(endpoint, {
        method:      'PATCH',
        headers:     { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body:        JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(type === 'status' ? `Statut → ${STATUS_CFG[value as AccountStatus]?.label}` : `Rôle → ${ROLE_CFG[value as Role]?.label}`);
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...data.user } : u));
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch {
      toast.error('Erreur de connexion');
    }
    setOpenMenu(null);
  };

  // -- Filtrage ---------------------------------------------------------------
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone || '').includes(q) || (u.uniqueCode || '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || u.accountStatus === filterStatus;
    const matchRole   = filterRole   === 'all' || u.role === filterRole;
    return matchSearch && matchStatus && matchRole;
  });

  // -- Compteurs --------------------------------------------------------------
  const counts: Record<string, number> = { all: users.length };
  users.forEach(u => { counts[u.accountStatus] = (counts[u.accountStatus] || 0) + 1; });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Gestion des utilisateurs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{users.length} utilisateur{users.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/[0.08] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>

      {/* Filtres rapides par statut */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all',          label: `Tous (${counts.all || 0})` },
          { key: 'pending_admin', label: `En attente (${counts.pending_admin || 0})`, urgent: (counts.pending_admin || 0) > 0 },
          { key: 'pending_email', label: `Email N/V (${counts.pending_email || 0})` },
          { key: 'approved',      label: `Actifs (${counts.approved || 0})` },
          { key: 'suspended',     label: `Suspendus (${counts.suspended || 0})` },
          { key: 'rejected',      label: `Rejetés (${counts.rejected || 0})` },
        ].map(({ key, label, urgent }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
              filterStatus === key
                ? 'bg-emerald-600 text-white border-emerald-600'
                : urgent
                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Barre de recherche + filtre rôle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone, code..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          title="Filtrer par rôle"
          aria-label="Filtrer par rôle"
          className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        >
          <option value="all">Tous les rôles</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_CFG[r].label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <User className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun utilisateur trouvé</p>
            {search && <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Essayez un autre terme de recherche</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                  {['Utilisateur', 'Téléphone / Localisation', 'Rôle', 'Statut', 'Inscrit le', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                {filtered.map(user => {
                  const sc = STATUS_CFG[user.accountStatus];
                  const rc = ROLE_CFG[user.role] ?? ROLE_CFG.user;
                  return (
                    <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                            {user.uniqueCode && (
                              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />{user.uniqueCode}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          {user.phone && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-gray-400" />+237 {user.phone}
                              {user.whatsapp && <span className="text-green-500 text-xs">WA</span>}
                            </p>
                          )}
                          {(user.address?.city || user.address?.region) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {[user.address.city, user.address.region].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${rc.color}`}>
                          {rc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                        {!user.emailVerified && (
                          <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5 flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" /> Email non vérifié
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{fmtDate(user.createdAt)}</p>
                        {user.lastLoginAt && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">Vu {fmtDate(user.lastLoginAt)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          {/* Bouton détail */}
                          <button
                            onClick={() => setSelected(user)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition"
                            title="Voir détail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Approve rapide */}
                          {user.accountStatus !== 'approved' && (
                            <button
                              onClick={() => handleAction(user._id, 'status', 'approved')}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition"
                              title="Approuver"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}

                          {/* Menu contextuel */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === user._id ? null : user._id)}
                              aria-label="Options"
                              title="Options"
                              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {openMenu === user._id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-white/[0.08] z-20 py-1 overflow-hidden"
                                >
                                  <p className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Statut</p>
                                  {(['approved', 'suspended', 'rejected', 'pending_admin'] as AccountStatus[]).map(s => (
                                    <button key={s} onClick={() => handleAction(user._id, 'status', s)}
                                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 ${user.accountStatus === s ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                      <span className={`w-2 h-2 rounded-full ${STATUS_CFG[s].dot}`} />
                                      {STATUS_CFG[s].label}
                                    </button>
                                  ))}
                                  <div className="border-t border-gray-100 dark:border-white/[0.06] my-1" />
                                  <p className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Rôle</p>
                                  {ROLES.map(r => (
                                    <button key={r} onClick={() => handleAction(user._id, 'role', r)}
                                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 ${user.role === r ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                      <Shield className="w-3 h-3 opacity-50" />
                                      {ROLE_CFG[r].label}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.06] flex justify-between items-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      {/* Modal détail */}
      <AnimatePresence>
        {selected && (
          <UserDetailModal
            user={selected}
            onClose={() => setSelected(null)}
            onAction={(id, type, value) => handleAction(id, type as 'status' | 'role', value)}
          />
        )}
      </AnimatePresence>

      {/* Fermer menu au clic extérieur */}
      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
