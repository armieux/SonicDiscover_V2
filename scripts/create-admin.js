const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🚀 Création d\'un utilisateur administrateur...');

    const username = process.argv[2] || 'admin';
    const email = process.argv[3] || 'admin@sonicdiscover.com';
    const password = process.argv[4] || 'admin123';

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ Un utilisateur avec cet email existe déjà');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur admin
    const admin = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'admin',
        followerscount: 0,
        followingcount: 0
      }
    });

    console.log('✅ Utilisateur administrateur créé avec succès !');
    console.log(`👤 Nom d'utilisateur: ${admin.username}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Mot de passe: ${password}`);
    console.log(`🆔 ID: ${admin.id}`);
    console.log('');
    console.log('🔐 Vous pouvez maintenant vous connecter avec ces identifiants');
    console.log('🛡️  N\'oubliez pas de changer le mot de passe après la première connexion');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Afficher l'aide si aucun argument
if (process.argv.length < 3) {
  console.log('📋 Usage: node scripts/create-admin.js [username] [email] [password]');
  console.log('');
  console.log('📝 Exemples:');
  console.log('  node scripts/create-admin.js admin admin@example.com motdepasse123');
  console.log('  node scripts/create-admin.js');
  console.log('');
  console.log('ℹ️  Les valeurs par défaut sont:');
  console.log('   - username: admin');
  console.log('   - email: admin@sonicdiscover.com');
  console.log('   - password: admin123');
  console.log('');
}

createAdmin();
