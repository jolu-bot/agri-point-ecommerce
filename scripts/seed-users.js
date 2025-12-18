const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agri-point';

// Schema User (simplifié pour le seed)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'redacteur', 'assistant_ia', 'client'],
    default: 'client' 
  },
  avatar: String,
  phone: String,
  isActive: { type: Boolean, default: true },
  permissions: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Utilisateurs de démonstration
const demoUsers = [
  {
    name: 'Administrateur Principal',
    email: 'admin@agri-ps.com',
    password: 'admin123',
    role: 'admin',
    phone: '+237 657 39 39 39',
    permissions: [
      'users:read', 'users:write', 'users:delete',
      'products:read', 'products:write', 'products:delete',
      'orders:read', 'orders:write', 'orders:delete',
      'settings:read', 'settings:write',
      'messages:read', 'messages:write',
      'analytics:read',
      'agribot:manage'
    ],
  },
  {
    name: 'Manager Commercial',
    email: 'manager@agri-ps.com',
    password: 'manager123',
    role: 'manager',
    phone: '+237 676 02 66 01',
    permissions: [
      'products:read', 'products:write',
      'orders:read', 'orders:write',
      'messages:read', 'messages:write',
      'analytics:read'
    ],
  },
  {
    name: 'Rédacteur Contenu',
    email: 'redacteur@agri-ps.com',
    password: 'redacteur123',
    role: 'redacteur',
    phone: '+237 699 12 34 56',
    permissions: [
      'products:read',
      'settings:read', 'settings:write',
      'messages:read'
    ],
  },
  {
    name: 'Assistant IA AgriBot',
    email: 'agribot@agri-ps.com',
    password: 'agribot123',
    role: 'assistant_ia',
    permissions: [
      'agribot:manage',
      'messages:read', 'messages:write',
      'products:read'
    ],
  },
  {
    name: 'Client Test',
    email: 'client@agri-ps.com',
    password: 'client123',
    role: 'client',
    phone: '+237 698 76 54 32',
    permissions: [
      'products:read',
      'orders:read'
    ],
  },
  {
    name: 'Jean Kamga',
    email: 'jean.kamga@example.com',
    password: 'client123',
    role: 'client',
    phone: '+237 690 11 22 33',
    permissions: ['products:read', 'orders:read'],
  },
  {
    name: 'Marie Ngono',
    email: 'marie.ngono@example.com',
    password: 'client123',
    role: 'client',
    phone: '+237 677 44 55 66',
    permissions: ['products:read', 'orders:read'],
  },
];

async function seedUsers() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Supprimer les utilisateurs existants
    console.log('🗑️  Suppression des utilisateurs existants...');
    await User.deleteMany({});
    console.log('✅ Utilisateurs supprimés');

    // Créer les nouveaux utilisateurs
    console.log('👥 Création des utilisateurs de démonstration...');
    for (const userData of demoUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Utilisateur créé: ${userData.email} (${userData.role})`);
    }

    console.log('\n🎉 Seed des utilisateurs terminé avec succès !');
    console.log('\n📧 Comptes de démonstration créés:');
    console.log('   Admin:     admin@agri-ps.com / admin123');
    console.log('   Manager:   manager@agri-ps.com / manager123');
    console.log('   Rédacteur: redacteur@agri-ps.com / redacteur123');
    console.log('   AgriBot:   agribot@agri-ps.com / agribot123');
    console.log('   Client:    client@agri-ps.com / client123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

seedUsers();
