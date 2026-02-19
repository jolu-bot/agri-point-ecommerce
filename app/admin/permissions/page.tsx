'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Permission {
  resource: string;
  actions: string[];
}

interface Role {
  name: string;
  displayName: string;
  permissions: Permission[];
  createdAt?: Date;
}

interface UserWithRole {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

export default function PermissionsManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});

  const availableResources = [
    'all', 'products', 'orders', 'users', 'campaigns', 'payments', 
    'analytics', 'settings', 'permissions', 'content'
  ];

  const availableActions = ['view', 'create', 'edit', 'delete', 'manage'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Charger les rôles depuis la config du site
      const configResponse = await fetch('/api/admin/site-config');
      if (configResponse.ok) {
        const config = await configResponse.json();
        setRoles(config?.permissions?.roles || []);
      }

      // Charger tous les utilisateurs
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoles = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/site-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions: { roles, defaultUserRole: 'customer' }
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      
      toast.success('Rôles enregistrés avec succès!');
      setShowNewRoleForm(false);
      setEditingRole(null);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddRole = () => {
    const newRole: Role = {
      name: '',
      displayName: '',
      permissions: [],
      createdAt: new Date(),
    };
    setEditingRole(newRole);
    setShowNewRoleForm(true);
  };

  const handleSaveNewRole = () => {
    if (!editingRole || !editingRole.name || !editingRole.displayName) {
      toast.error('Nom et nom d\'affichage sont requis');
      return;
    }

    if (roles.find(r => r.name === editingRole.name)) {
      toast.error('Un rôle avec ce nom existe déjà');
      return;
    }

    setRoles([...roles, editingRole]);
    setShowNewRoleForm(false);
    setEditingRole(null);
    toast.success('Rôle créé! N\'oubliez pas d\'enregistrer.');
  };

  const handleDeleteRole = (roleName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${roleName}"?`)) {
      setRoles(roles.filter(r => r.name !== roleName));
      toast.success('Rôle supprimé! N\'oubliez pas d\'enregistrer.');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Erreur');
      
      toast.success('Rôle utilisateur mis à jour!');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    }
  };

  const togglePermission = (role: Role, resource: string, action: string) => {
    const roleIndex = roles.findIndex(r => r.name === role.name);
    if (roleIndex === -1) return;

    const updatedRoles = [...roles];
    const updatedRole = { ...updatedRoles[roleIndex] };
    
    const permissionIndex = updatedRole.permissions.findIndex(p => p.resource === resource);
    
    if (permissionIndex === -1) {
      // Créer nouvelle permission
      updatedRole.permissions.push({ resource, actions: [action] });
    } else {
      // Mettre à jour permission existante
      const permission = { ...updatedRole.permissions[permissionIndex] };
      const actionIndex = permission.actions.indexOf(action);
      
      if (actionIndex === -1) {
        permission.actions.push(action);
      } else {
        permission.actions = permission.actions.filter(a => a !== action);
      }
      
      if (permission.actions.length === 0) {
        updatedRole.permissions = updatedRole.permissions.filter((_, i) => i !== permissionIndex);
      } else {
        updatedRole.permissions[permissionIndex] = permission;
      }
    }
    
    updatedRoles[roleIndex] = updatedRole;
    setRoles(updatedRoles);
  };

  const hasPermission = (role: Role, resource: string, action: string): boolean => {
    const permission = role.permissions.find(p => p.resource === resource || p.resource === 'all');
    return permission ? permission.actions.includes(action) || permission.actions.includes('manage') : false;
  };

  const toggleRoleExpanded = (roleName: string) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleName]: !prev[roleName]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-600" />
            Gestion des Permissions & Rôles
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Définissez les rôles et attribuez des permissions aux utilisateurs
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleAddRole}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau Rôle
          </button>
          <button
            onClick={handleSaveRoles}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Roles Management */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rôles & Permissions</h2>
          
          {showNewRoleForm && editingRole && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-emerald-500 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nouveau Rôle</h3>
                <button
                  onClick={() => {
                    setShowNewRoleForm(false);
                    setEditingRole(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom du rôle (technique)
                  </label>
                  <input
                    type="text"
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="ex: content_manager"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom d'affichage
                  </label>
                  <input
                    type="text"
                    value={editingRole.displayName}
                    onChange={(e) => setEditingRole({ ...editingRole, displayName: e.target.value })}
                    placeholder="ex: Gestionnaire de Contenu"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <button
                  onClick={handleSaveNewRole}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Créer le Rôle
                </button>
              </div>
            </motion.div>
          )}

          {roles.map((role, index) => (
            <motion.div
              key={role.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleRoleExpanded(role.name)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {role.displayName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {role.permissions.length} permission(s) configurée(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {role.name !== 'admin' && role.name !== 'customer' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.name);
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {expandedRoles[role.name] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {expandedRoles[role.name] && (
                <div className="p-6 space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Sélectionnez les permissions pour ce rôle:
                  </div>
                  
                  <div className="space-y-3">
                    {availableResources.map(resource => (
                      <div key={resource} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="font-medium text-gray-900 dark:text-white mb-2 capitalize">
                          {resource === 'all' ? '🌟 Tous les modules' : `📦 ${resource}`}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {availableActions.map(action => (
                            <label
                              key={action}
                              className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={hasPermission(role, resource, action)}
                                onChange={() => togglePermission(role, resource, action)}
                                className="rounded text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                {action}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {(role.name === 'admin' || role.name === 'customer') && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          {role.name === 'admin' 
                            ? "Rôle système: L'administrateur a tous les droits par défaut." 
                            : "Rôle système: Le client a des permissions limitées par défaut."
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Users List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Utilisateurs
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {users.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      {roles.map(role => (
                        <option key={role.name} value={role.name}>
                          {role.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              ))}

              {users.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Aucun utilisateur trouvé
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Total: {users.length} utilisateur(s)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Actifs: {users.filter(u => u.isActive).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Inactifs: {users.filter(u => !u.isActive).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
