'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Key, 
  CheckCircle, 
  XCircle, 
  Clock,
  Copy,
  Check,
  AlertTriangle,
  User,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountSecurity() {
  const [user, setUser] = useState<{
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    permissions: string[];
    uniqueCode: string;
    accountStatus: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    isActive: boolean;
    createdAt: string;
    lastLoginAt?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.user) setUser(data.user);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (user?.uniqueCode) {
      navigator.clipboard.writeText(user.uniqueCode);
      setCopiedCode(true);
      toast.success('Code copié dans le presse-papier !');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        icon: Clock,
        color: 'orange',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        text: 'text-orange-800 dark:text-orange-200',
        border: 'border-orange-200 dark:border-orange-800',
        title: 'Compte en attente de validation',
        message: 'Votre compte est en cours de vérification par notre équipe. Vous recevrez un email dès que votre compte sera validé.',
      },
      approved: {
        icon: CheckCircle,
        color: 'green',
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-200',
        border: 'border-green-200 dark:border-green-800',
        title: 'Compte approuvé',
        message: 'Votre compte a été approuvé ! Vous avez accès à toutes les fonctionnalités.',
      },
      rejected: {
        icon: XCircle,
        color: 'red',
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-200',
        border: 'border-red-200 dark:border-red-800',
        title: 'Compte refusé',
        message: 'Votre demande de compte a été refusée. Contactez le support pour plus d\'informations.',
      },
      suspended: {
        icon: AlertTriangle,
        color: 'gray',
        bg: 'bg-gray-100 dark:bg-gray-900/30',
        text: 'text-gray-800 dark:text-gray-200',
        border: 'border-gray-200 dark:border-gray-800',
        title: 'Compte suspendu',
        message: 'Votre compte a été temporairement suspendu. Contactez l\'administrateur.',
      },
    };

    return configs[status as keyof typeof configs] || configs.pending;
  };

  const statusConfig = getStatusConfig(user?.accountStatus || 'pending');
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Sécurité du Compte</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez la sécurité et les paramètres de votre compte
        </p>
      </div>

      {/* Code Unique - Card principale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${statusConfig.bg} ${statusConfig.border} border-2 rounded-2xl p-8 shadow-lg`}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-4 rounded-xl ${statusConfig.text} bg-white/50 dark:bg-black/20`}>
            <StatusIcon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h2 className={`text-2xl font-bold mb-2 ${statusConfig.text}`}>
              {statusConfig.title}
            </h2>
            <p className={`${statusConfig.text} opacity-90`}>
              {statusConfig.message}
            </p>
          </div>
        </div>

        {/* Code Unique Display */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Key className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Votre Code Unique</h3>
            </div>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full">
              ID Personnel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <code className="text-3xl font-bold font-mono tracking-wider text-blue-900 dark:text-blue-100">
                {user?.uniqueCode || 'AGP-XXXXXXX-XXXX'}
              </code>
            </div>
            <button
              onClick={copyCode}
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all hover:scale-105"
              title="Copier le code"
            >
              {copiedCode ? (
                <Check className="w-6 h-6" />
              ) : (
                <Copy className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>💡 Important :</strong> Ce code unique vous identifie dans notre système. 
              Communiquez-le à l&apos;administrateur si vous avez besoin de privilèges supplémentaires.
            </p>
          </div>
        </div>

        {/* Instructions si en attente */}
        {user?.accountStatus === 'pending' && (
          <div className="mt-6 p-4 bg-white/50 dark:bg-black/20 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Prochaines étapes
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm opacity-90">
              <li>Copiez votre code unique ci-dessus</li>
              <li>Envoyez-le à l&apos;administrateur par email ou WhatsApp</li>
              <li>Attendez la validation (généralement sous 24-48h)</li>
              <li>Vous recevrez un email de confirmation</li>
            </ol>
          </div>
        )}
      </motion.div>

      {/* Informations du compte */}
      <div className="grid md:grid-cols-2 gap-6">
        <SecurityFeature
          icon={<User className="w-6 h-6" />}
          title="Informations personnelles"
          items={[
            { label: 'Nom', value: user?.name || 'Non renseigné' },
            { label: 'Email', value: user?.email || 'Non renseigné' },
            { label: 'Téléphone', value: user?.phone || 'Non renseigné' },
          ]}
        />

        <SecurityFeature
          icon={<Shield className="w-6 h-6" />}
          title="Sécurité"
          items={[
            { 
              label: 'Authentification 2FA', 
              value: user?.twoFactorEnabled ? 'Activée' : 'Désactivée',
              status: user?.twoFactorEnabled ? 'success' : 'warning'
            },
            { 
              label: 'Email vérifié', 
              value: user?.emailVerified ? 'Oui' : 'Non',
              status: user?.emailVerified ? 'success' : 'warning'
            },
            { 
              label: 'Compte actif', 
              value: user?.isActive ? 'Oui' : 'Non',
              status: user?.isActive ? 'success' : 'error'
            },
          ]}
        />
      </div>

      {/* Rôle et Permissions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold">Rôle et Permissions</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Rôle actuel</label>
            <p className="text-lg font-semibold mt-1 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-lg inline-block">
              {user?.role || 'Client'}
            </p>
          </div>

          {user?.permissions && user.permissions.length > 0 && (
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                Permissions accordées
              </label>
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((perm: string) => (
                  <span
                    key={perm}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm rounded-full"
                  >
                    {perm.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Historique */}
      {user?.lastLoginAt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold mb-4">Activité récente</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Dernière connexion</span>
              <span className="font-medium">{new Date(user.lastLoginAt).toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Compte créé le</span>
              <span className="font-medium">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SecurityFeature({ icon, title, items }: { icon: React.ReactNode; title: string; items: Array<{ label: string; value: string; status?: 'success' | 'warning' | 'error' }> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.map((item: { label: string; value: string; status?: 'success' | 'warning' | 'error' }, index: number) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
            <span className={`text-sm font-medium ${
              item.status === 'success' ? 'text-green-600 dark:text-green-400' :
              item.status === 'warning' ? 'text-orange-600 dark:text-orange-400' :
              item.status === 'error' ? 'text-red-600 dark:text-red-400' :
              ''
            }`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
