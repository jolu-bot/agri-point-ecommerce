'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Key,
  Users,
  Ban,
  Eye,
  Edit,
  Send,
  Copy,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  uniqueCode: string;
  accountStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface InvitationCode {
  _id: string;
  code: string;
  email?: string;
  role: string;
  permissions: string[];
  expiresAt: string;
  isActive: boolean;
  usedCount: number;
  maxUses: number;
  createdBy: { name: string; email: string };
  usedBy?: { name: string; email: string };
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<InvitationCode[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'invitations' | 'pending'>('users');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchInvitations();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.users) setUsers(data.users);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    }
  };

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/invitations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.invitations) setInvitations(data.invitations);
    } catch (err) {
      console.error('Erreur chargement invitations:', err);
    }
  };

  const generateInvitation = async (formData: { email?: string; role: string; expiresInDays: number; maxUses: number }) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Code d\'invitation généré !');
        fetchInvitations();
        setShowInviteModal(false);
        return data.invitation;
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch (err) {
      toast.error('Erreur génération invitation');
      console.error('Erreur:', err);
    }
  };

  const approveUser = async (userId: string, status: string, reason?: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, reason }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Utilisateur ${status === 'approved' ? 'approuvé' : 'rejeté'} !`);
        fetchUsers();
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch (err) {
      toast.error('Erreur approbation utilisateur');
      console.error('Erreur:', err);
    }
  };

  const updatePermissions = async (userId: string, permissions: string[]) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Permissions mises à jour !');
        fetchUsers();
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch (err) {
      toast.error('Erreur mise à jour permissions');
      console.error('Erreur:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success('Code copié !');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const pendingUsers = users.filter(u => u.accountStatus === 'pending');
  const activeUsers = users.filter(u => u.accountStatus === 'approved');

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Système avancé de gestion et sécurité
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
          Générer Invitation
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          icon={<Users className="w-6 h-6" />}
          label="Total Utilisateurs"
          value={users.length}
          color="blue"
        />
        <StatsCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="Approuvés"
          value={activeUsers.length}
          color="green"
        />
        <StatsCard
          icon={<Clock className="w-6 h-6" />}
          label="En Attente"
          value={pendingUsers.length}
          color="orange"
        />
        <StatsCard
          icon={<Key className="w-6 h-6" />}
          label="Invitations Actives"
          value={invitations.filter(i => i.isActive && new Date(i.expiresAt) > new Date()).length}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <TabButton
          active={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
          icon={<Users />}
          label="Tous les utilisateurs"
          count={activeUsers.length}
        />
        <TabButton
          active={activeTab === 'pending'}
          onClick={() => setActiveTab('pending')}
          icon={<Clock />}
          label="En attente"
          count={pendingUsers.length}
          badge={pendingUsers.length > 0}
        />
        <TabButton
          active={activeTab === 'invitations'}
          onClick={() => setActiveTab('invitations')}
          icon={<Send />}
          label="Invitations"
          count={invitations.length}
        />
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {activeTab === 'users' && (
          <UsersTable 
            users={activeUsers}
            onApprove={approveUser}
            onUpdatePermissions={updatePermissions}
            onCopyCode={copyToClipboard}
            copiedCode={copiedCode}
          />
        )}

        {activeTab === 'pending' && (
          <PendingUsersTable 
            users={pendingUsers}
            onApprove={approveUser}
            onCopyCode={copyToClipboard}
            copiedCode={copiedCode}
          />
        )}

        {activeTab === 'invitations' && (
          <InvitationsTable 
            invitations={invitations}
            onCopyCode={copyToClipboard}
            copiedCode={copiedCode}
          />
        )}
      </div>

      {/* Modal Invitation */}
      {showInviteModal && (
        <InvitationModal
          onClose={() => setShowInviteModal(false)}
          onGenerate={generateInvitation}
        />
      )}
    </div>
  );
}

// Composants auxiliaires
function StatsCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: 'blue' | 'green' | 'orange' | 'purple' }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colors[color as keyof typeof colors]} text-white`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function TabButton({ active, onClick, icon, label, count, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number; badge?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-3 flex items-center gap-2 border-b-2 transition-colors ${
        active
          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
        {count}
      </span>
      {badge && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
    </button>
  );
}

function UsersTable({ users, onApprove: _onApprove, onUpdatePermissions: _onUpdatePermissions, onCopyCode, copiedCode }: { users: User[]; onApprove: (userId: string, status: string, reason?: string) => void; onUpdatePermissions: (userId: string, permissions: string[]) => void; onCopyCode: (code: string) => void; copiedCode: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code Unique</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sécurité</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user: User) => (
            <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onCopyCode(user.uniqueCode)}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <code className="text-sm font-mono">{user.uniqueCode}</code>
                  {copiedCode === user.uniqueCode ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={user.accountStatus} />
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  {user.emailVerified && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded" title="Email vérifié">
                      <Mail className="w-3 h-3" />
                    </span>
                  )}
                  {user.twoFactorEnabled && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded" title="2FA activé">
                      <Shield className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Voir détails">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Modifier">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PendingUsersTable({ users, onApprove, onCopyCode, copiedCode }: { users: User[]; onApprove: (userId: string, status: string, reason?: string) => void; onCopyCode: (code: string) => void; copiedCode: string }) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingUser, setRejectingUser] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code Unique</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscrit le</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user: User) => (
            <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">Rôle demandé: {user.role}</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onCopyCode(user.uniqueCode)}
                  className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                >
                  <code className="text-sm font-mono font-bold text-orange-800 dark:text-orange-300">
                    {user.uniqueCode}
                  </code>
                  {copiedCode === user.uniqueCode ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  À communiquer à l&apos;utilisateur
                </p>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onApprove(user._id, 'approved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                  <button
                    onClick={() => setRejectingUser(user._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
                
                {rejectingUser === user._id && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Raison du rejet..."
                      className="flex-1 px-3 py-2 border rounded"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <button
                      onClick={() => {
                        onApprove(user._id, 'rejected', rejectionReason);
                        setRejectingUser(null);
                        setRejectionReason('');
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded"
                    >
                      Confirmer
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvitationsTable({ invitations, onCopyCode, copiedCode }: { invitations: InvitationCode[]; onCopyCode: (code: string) => void; copiedCode: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expire</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisation</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {invitations.map((inv: InvitationCode) => (
            <tr key={inv._id}>
              <td className="px-6 py-4">
                <button
                  onClick={() => onCopyCode(inv.code)}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50"
                >
                  <code className="text-sm font-mono font-bold">{inv.code}</code>
                  {copiedCode === inv.code ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </td>
              <td className="px-6 py-4">{inv.email || <span className="text-gray-400">Tous</span>}</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {inv.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm">{new Date(inv.expiresAt).toLocaleDateString('fr-FR')}</p>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm">
                  {inv.usedCount} / {inv.maxUses}
                </span>
              </td>
              <td className="px-6 py-4">
                {inv.isActive && new Date(inv.expiresAt) > new Date() ? (
                  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">Actif</span>
                ) : (
                  <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Expiré</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs = {
    pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'En attente', icon: Clock },
    approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approuvé', icon: CheckCircle },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejeté', icon: XCircle },
    suspended: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Suspendu', icon: Ban },
  };

  const config = configs[status as keyof typeof configs] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 w-fit ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function InvitationModal({ onClose, onGenerate }: { onClose: () => void; onGenerate: (formData: { email?: string; role: string; expiresInDays: number; maxUses: number }) => Promise<InvitationCode | undefined> }) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'client',
    expiresInDays: 7,
    maxUses: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onGenerate(formData);
    if (result) {
      // Optionally show the code in a success message
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Générer une Invitation</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email (optionnel)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="utilisateur@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Laissez vide pour un code utilisable par n&apos;importe qui
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rôle</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              aria-label="Sélectionner le rôle"
            >
              <option value="client">Client</option>
              <option value="redacteur">Rédacteur</option>
              <option value="assistant_ia">Assistant IA</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Expire dans (jours)</label>
            <input
              type="number"
              value={formData.expiresInDays}
              onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
              min="1"
              max="365"
              aria-label="Nombre de jours avant expiration"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Utilisations max</label>
            <input
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
              min="1"
              max="100"
              aria-label="Nombre maximum d'utilisations"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Générer
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
