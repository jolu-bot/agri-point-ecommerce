'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Upload,
  Camera,
  FileText,
  Building2,
  CreditCard,
  AlertCircle,
  Download,
  Share2,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  items: Array<{
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    region: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  campostPayment?: {
    accountNumber: string;
    accountName: string;
    receiptImage?: string;
    receiptUploadedAt?: Date;
  };
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Informations Campost (à configurer)
  const CAMPOST_INFO = {
    accountNumber: '1234-5678-9012-3456',
    accountName: 'Agri Point Services SARL',
    agencyCode: 'CAMPOST CENTRAL YAOUNDE',
    instructions: [
      'Rendez-vous dans le bureau Campost le plus proche de chez vous',
      `Demandez un versement sur le compte : ${order?.campostPayment?.accountNumber || '1234-5678-9012-3456'}`,
      `Bénéficiaire : ${order?.campostPayment?.accountName || 'Agri Point Services SARL'}`,
      `Montant exact : ${order?.total.toLocaleString('fr-FR')} FCFA`,
      `Référence : ${order?.orderNumber}`,
      'Conservez précieusement votre reçu de paiement',
      'Photographiez ou filmez votre reçu',
      'Uploadez votre reçu sur cette page pour validation'
    ]
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error('Commande non trouvée');
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger la commande');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Veuillez sélectionner une image ou vidéo');
      return;
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 10MB)');
      return;
    }

    setSelectedFile(file);
    
    // Créer preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadReceipt = async () => {
    if (!selectedFile || !order) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('receipt', selectedFile);
    formData.append('orderId', order._id);

    try {
      const res = await fetch('/api/orders/upload-receipt', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Erreur upload');

      const data = await res.json();
      toast.success('Reçu uploadé avec succès!');
      setOrder(data.order);
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const downloadOrderSummary = () => {
    // Générer PDF ou partager par WhatsApp
    const message = encodeURIComponent(
      `🛒 COMMANDE AGRI POINT SERVICES\n\n` +
      `N° Commande: ${order?.orderNumber}\n` +
      `Montant: ${order?.total.toLocaleString('fr-FR')} FCFA\n\n` +
      `📍 PAIEMENT CAMPOST\n` +
      `Compte: ${CAMPOST_INFO.accountNumber}\n` +
      `Bénéficiaire: ${CAMPOST_INFO.accountName}\n\n` +
      `Référence à mentionner: ${order?.orderNumber}\n\n` +
      `✅ Après paiement, uploadez votre reçu sur:\n` +
      `https://agri-ps.com/commande/confirmation/${orderId}`
    );
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Commande introuvable</h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const hasUploadedReceipt = order.campostPayment?.receiptImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Success */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commande Enregistrée !
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Numéro de commande:
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 rounded-lg">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span className="text-2xl font-mono font-bold text-emerald-600">
              {order.orderNumber}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Conservez ce numéro précieusement
          </p>
        </motion.div>

        {/* Instructions Campost */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 mb-6 text-white"
        >
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Comment Payer via Campost</h2>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Informations de Paiement
            </h3>
            <div className="space-y-3 text-white/90">
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="font-medium">Compte Campost:</span>
                <span className="font-mono font-bold">{CAMPOST_INFO.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="font-medium">Bénéficiaire:</span>
                <span className="font-bold">{CAMPOST_INFO.accountName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/20">
                <span className="font-medium">Montant à payer:</span>
                <span className="text-2xl font-bold text-yellow-300">
                  {order.total.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Référence:</span>
                <span className="font-mono font-bold">{order.orderNumber}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-lg mb-3">📋 Étapes à Suivre:</h3>
            {CAMPOST_INFO.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <p className="text-white/90 pt-1">{instruction}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={downloadOrderSummary}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Partager sur WhatsApp
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              aria-label="Imprimer le bon de commande"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Upload Reçu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Camera className="w-7 h-7 text-emerald-600" />
            Uploader votre Reçu de Paiement
          </h2>

          {hasUploadedReceipt ? (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-emerald-900 mb-2">Reçu Uploadé !</h3>
                  <p className="text-emerald-700 mb-4">
                    Votre reçu a été envoyé avec succès. Notre équipe le vérifiera dans les plus brefs délais.
                  </p>
                  {order.campostPayment?.receiptUploadedAt && (
                    <p className="text-sm text-emerald-600">
                      Uploadé le {new Date(order.campostPayment.receiptUploadedAt).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Important:</p>
                    <p>Après avoir effectué le versement à Campost, photographiez ou filmez votre reçu et uploadez-le ici pour que nous puissions valider votre commande.</p>
                  </div>
                </div>
              </div>

              {!selectedFile ? (
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    aria-label="Uploader le reçu Campost (photo ou vidéo)"
                    onChange={handleFileSelect}
                    className="hidden"
                    capture="environment" // Active la caméra sur mobile (progressive enhancement)
                  />
                  <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition-all">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      Cliquez pour uploader
                    </p>
                    <p className="text-sm text-gray-500">
                      Photo ou vidéo du reçu Campost (max 10MB)
                    </p>
                  </div>
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-gray-100">
                    {selectedFile.type.startsWith('image/') ? (
                      <Image
                        src={previewUrl}
                        alt="Preview reçu"
                        width={800}
                        height={600}
                        className="w-full h-auto"
                      />
                    ) : (
                      <video src={previewUrl} controls className="w-full h-auto" />
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleUploadReceipt}
                      disabled={uploading}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Upload en cours...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Confirmer l'Upload
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Récapitulatif Commande */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Récapitulatif de la Commande</h2>

          {/* Produits */}
          <div className="space-y-4 mb-6">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={item.productImage || '/images/placeholder.jpg'}
                    alt={item.productName}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                  <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                  <p className="font-semibold text-emerald-600">
                    {item.total.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Adresse Livraison */}
          <div className="border-t pt-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Adresse de Livraison
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1">
              <p className="font-semibold">{order.shippingAddress.name}</p>
              <p className="text-gray-600">{order.shippingAddress.street}</p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.region}
              </p>
              <p className="text-gray-600 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span className="text-gray-900">Total à Payer:</span>
              <span className="text-emerald-600">
                {order.total.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-gray-600"
        >
          <p className="mb-2">Besoin d'aide ?</p>
          <div className="flex items-center justify-center gap-6">
            <a href="tel:+237670000000" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700">
              <Phone className="w-4 h-4" />
              +237 670 00 00 00
            </a>
            <a href="mailto:support@agri-ps.com" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700">
              <Mail className="w-4 h-4" />
              support@agri-ps.com
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
