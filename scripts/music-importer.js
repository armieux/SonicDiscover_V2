/**
 * Script d'import automatique de musiques pour SonicDiscover
 * 
 * Ce script importe 50+ morceaux de musique avec métadonnées complètes :
 * - Titre, artiste, genre, BPM, durée
 * - Fichiers MP3 simulés (pour la démo)
 * - Images de couverture
 * - Création d'utilisateurs artistes automatique
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');

const prisma = new PrismaClient();

// Données de musiques populaires avec métadonnées complètes
const SAMPLE_TRACKS = [
  // Electronic/Dance
  { title: "Midnight Drive", artist: "ElectroWave", genre: "Electronic", bpm: 128, duration: 240, mood: "energetic" },
  { title: "Neon Lights", artist: "SynthMaster", genre: "Synthwave", bpm: 120, duration: 195, mood: "nostalgic" },
  { title: "Digital Dreams", artist: "CyberSonic", genre: "Techno", bpm: 132, duration: 280, mood: "futuristic" },
  { title: "Bass Drop", artist: "EDM Producer", genre: "EDM", bpm: 140, duration: 210, mood: "energetic" },
  { title: "Retro Vibes", artist: "80s Revival", genre: "Synthwave", bpm: 118, duration: 220, mood: "nostalgic" },
  
  // Hip-Hop
  { title: "Street Chronicles", artist: "Urban Poet", genre: "Hip-Hop", bpm: 85, duration: 185, mood: "chill" },
  { title: "Flow State", artist: "Rap Master", genre: "Hip-Hop", bpm: 95, duration: 200, mood: "confident" },
  { title: "City Lights", artist: "Metro Beats", genre: "Hip-Hop", bpm: 90, duration: 175, mood: "atmospheric" },
  { title: "Underground", artist: "Classic Hip", genre: "Hip-Hop", bpm: 88, duration: 190, mood: "raw" },
  { title: "Golden Era", artist: "Old School", genre: "Hip-Hop", bpm: 92, duration: 165, mood: "nostalgic" },
  
  // Rock
  { title: "Thunder Road", artist: "Rock Storm", genre: "Rock", bpm: 140, duration: 255, mood: "powerful" },
  { title: "Electric Soul", artist: "Guitar Heroes", genre: "Rock", bpm: 120, duration: 230, mood: "emotional" },
  { title: "Fire Within", artist: "Metal Core", genre: "Rock", bpm: 160, duration: 275, mood: "intense" },
  { title: "Rebel Heart", artist: "Indie Rocks", genre: "Indie Rock", bpm: 110, duration: 200, mood: "rebellious" },
  { title: "Sunset Drive", artist: "Classic Rock", genre: "Rock", bpm: 125, duration: 290, mood: "nostalgic" },
  
  // Pop
  { title: "Summer Nights", artist: "Pop Star", genre: "Pop", bpm: 115, duration: 180, mood: "happy" },
  { title: "Heartbreak Hotel", artist: "Melody Maker", genre: "Pop", bpm: 100, duration: 195, mood: "melancholic" },
  { title: "Dance Floor", artist: "Chart Topper", genre: "Pop", bpm: 128, duration: 170, mood: "energetic" },
  { title: "Love Story", artist: "Romantic Pop", genre: "Pop", bpm: 95, duration: 205, mood: "romantic" },
  { title: "Neon Dreams", artist: "Synth Pop", genre: "Pop", bpm: 120, duration: 188, mood: "dreamy" },
  
  // Jazz
  { title: "Midnight Blues", artist: "Jazz Collective", genre: "Jazz", bpm: 80, duration: 320, mood: "smooth" },
  { title: "Saxophone Serenade", artist: "Smooth Jazz", genre: "Jazz", bpm: 75, duration: 280, mood: "romantic" },
  { title: "Bebop Fever", artist: "Jazz Masters", genre: "Jazz", bpm: 180, duration: 240, mood: "energetic" },
  { title: "Cool Breeze", artist: "Chill Jazz", genre: "Jazz", bpm: 70, duration: 300, mood: "relaxed" },
  { title: "Blue Note", artist: "Traditional Jazz", genre: "Jazz", bpm: 85, duration: 265, mood: "melancholic" },
  
  // R&B
  { title: "Velvet Voice", artist: "Soul Singer", genre: "R&B", bpm: 90, duration: 210, mood: "smooth" },
  { title: "Groove Machine", artist: "Funk Master", genre: "R&B", bpm: 105, duration: 195, mood: "groovy" },
  { title: "Love Ballad", artist: "R&B Legend", genre: "R&B", bpm: 65, duration: 245, mood: "romantic" },
  { title: "Neo Soul", artist: "Modern Soul", genre: "R&B", bpm: 85, duration: 220, mood: "emotional" },
  { title: "Funky Town", artist: "Retro Funk", genre: "R&B", bpm: 110, duration: 185, mood: "funky" },
  
  // Classical
  { title: "Symphony No. 5", artist: "Orchestra Moderne", genre: "Classical", bpm: 60, duration: 420, mood: "epic" },
  { title: "Piano Sonata", artist: "Piano Virtuoso", genre: "Classical", bpm: 120, duration: 380, mood: "elegant" },
  { title: "String Quartet", artist: "Chamber Music", genre: "Classical", bpm: 80, duration: 350, mood: "sophisticated" },
  { title: "Violin Concerto", artist: "Violin Master", genre: "Classical", bpm: 100, duration: 400, mood: "dramatic" },
  { title: "Orchestral Suite", artist: "Symphony Hall", genre: "Classical", bpm: 90, duration: 450, mood: "majestic" },
  
  // Ambient/Chill
  { title: "Floating Clouds", artist: "Ambient Space", genre: "Ambient", bpm: 60, duration: 360, mood: "peaceful" },
  { title: "Ocean Waves", artist: "Nature Sounds", genre: "Ambient", bpm: 55, duration: 480, mood: "relaxed" },
  { title: "Forest Path", artist: "Meditation Music", genre: "Ambient", bpm: 50, duration: 420, mood: "serene" },
  { title: "Cosmic Journey", artist: "Space Ambient", genre: "Ambient", bpm: 65, duration: 540, mood: "mysterious" },
  { title: "Inner Peace", artist: "Zen Master", genre: "Ambient", bpm: 45, duration: 600, mood: "meditative" },
  
  // Country
  { title: "Country Road", artist: "Nashville Star", genre: "Country", bpm: 100, duration: 215, mood: "nostalgic" },
  { title: "Whiskey Nights", artist: "Honky Tonk", genre: "Country", bpm: 95, duration: 190, mood: "melancholic" },
  { title: "Truck Stop Blues", artist: "Road Warrior", genre: "Country", bpm: 85, duration: 205, mood: "gritty" },
  { title: "Southern Belle", artist: "Country Gentleman", genre: "Country", bpm: 110, duration: 180, mood: "romantic" },
  { title: "Barn Dance", artist: "Fiddle Master", genre: "Country", bpm: 130, duration: 195, mood: "happy" },
  
  // Reggae
  { title: "Island Vibes", artist: "Reggae King", genre: "Reggae", bpm: 75, duration: 220, mood: "relaxed" },
  { title: "One Love", artist: "Rastafari", genre: "Reggae", bpm: 70, duration: 240, mood: "peaceful" },
  { title: "Dub Revolution", artist: "Dub Master", genre: "Reggae", bpm: 80, duration: 300, mood: "revolutionary" },
  { title: "Sunshine Reggae", artist: "Caribbean Vibes", genre: "Reggae", bpm: 85, duration: 195, mood: "happy" },
  { title: "Roots Rock", artist: "Reggae Roots", genre: "Reggae", bpm: 78, duration: 280, mood: "spiritual" },
  
  // Folk
  { title: "Mountain Song", artist: "Folk Wanderer", genre: "Folk", bpm: 90, duration: 210, mood: "nostalgic" },
  { title: "Campfire Stories", artist: "Acoustic Soul", genre: "Folk", bpm: 85, duration: 195, mood: "intimate" },
  { title: "River Valley", artist: "Country Folk", genre: "Folk", bpm: 95, duration: 225, mood: "peaceful" },
  { title: "Urban Folk", artist: "City Troubadour", genre: "Folk", bpm: 100, duration: 185, mood: "reflective" },
  { title: "Old Traditions", artist: "Folk Heritage", genre: "Folk", bpm: 80, duration: 250, mood: "traditional" },
  
  // Latin
  { title: "Salsa Caliente", artist: "Latin Fire", genre: "Latin", bpm: 180, duration: 200, mood: "energetic" },
  { title: "Bachata Romance", artist: "Latino Love", genre: "Latin", bpm: 120, duration: 215, mood: "romantic" },
  { title: "Reggaeton Beat", artist: "Urban Latino", genre: "Latin", bpm: 95, duration: 180, mood: "party" },
  { title: "Tango Passion", artist: "Argentine Soul", genre: "Latin", bpm: 100, duration: 245, mood: "passionate" },
  { title: "Merengue Fiesta", artist: "Caribbean Heat", genre: "Latin", bpm: 150, duration: 185, mood: "celebratory" }
];

// Fonction pour créer un dossier s'il n'existe pas
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Dossier créé: ${dirPath}`);
  }
}

// Fonction pour générer une URL d'image aléatoire
function generateCoverImageUrl(title, artist) {
  // Utiliser Picsum Photos pour des images aléatoires
  const randomId = Math.floor(Math.random() * 1000) + 1;
  return `https://picsum.photos/400/400?random=${randomId}`;
}

// Fonction pour créer un fichier MP3 fictif (pour la démo)
function createDummyAudioFile(title, artist, duration) {
  const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${artist.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
  const audioDir = path.join(process.cwd(), 'public', 'uploads');
  ensureDirectoryExists(audioDir);
  
  const filePath = path.join(audioDir, filename);
  
  // Créer un fichier MP3 factice (juste pour la démo)
  const dummyContent = Buffer.alloc(1024 * duration); // 1KB par seconde de durée
  fs.writeFileSync(filePath, dummyContent);
  
  return `/audio/${filename}`;
}

// Fonction pour créer un utilisateur artiste
async function createArtistUser(artistName) {
  try {
    // Vérifier si l'artiste existe déjà
    const existingUser = await prisma.users.findFirst({
      where: { username: artistName }
    });
    
    if (existingUser) {
      return existingUser;
    }
    
    // Créer un nouvel utilisateur artiste
    const artist = await prisma.users.create({
      data: {
        username: artistName,
        email: `${artistName.toLowerCase().replace(/\s+/g, '.')}@music.demo`,
        password: '$2b$12$dummy.hash.for.demo.purposes.only', // Hash factice
        role: 'artist',
        profilepicture: generateCoverImageUrl(artistName, 'artist'),
        followerscount: Math.floor(Math.random() * 10000) + 100,
        followingcount: Math.floor(Math.random() * 500) + 10
      }
    });
    
    console.log(`✅ Artiste créé: ${artistName} (ID: ${artist.id})`);
    return artist;
  } catch (error) {
    console.error(`❌ Erreur lors de la création de l'artiste ${artistName}:`, error);
    throw error;
  }
}

// Fonction pour importer un morceau
async function importTrack(trackData) {
  try {
    // Créer l'utilisateur artiste
    const artist = await createArtistUser(trackData.artist);
    
    // Créer le fichier audio factice
    const audioFilePath = createDummyAudioFile(trackData.title, trackData.artist, trackData.duration);
    
    // Créer le morceau
    const track = await prisma.tracks.create({
      data: {
        title: trackData.title,
        trackpicture: generateCoverImageUrl(trackData.title, trackData.artist),
        genre: trackData.genre,
        bpm: trackData.bpm,
        mood: trackData.mood,
        audiofile: audioFilePath,
        duration: trackData.duration,
        playcount: Math.floor(Math.random() * 10000),
        likecount: Math.floor(Math.random() * 1000),
        dislikecount: Math.floor(Math.random() * 100),
        averagerating: Math.random() * 5
      }
    });
    
    // Associer l'artiste au morceau
    await prisma.trackartists.create({
      data: {
        artistid: artist.id,
        trackid: track.id,
        role: 'main_artist'
      }
    });
    
    console.log(`✅ Morceau importé: "${trackData.title}" par ${trackData.artist} (ID: ${track.id})`);
    return track;
  } catch (error) {
    console.error(`❌ Erreur lors de l'import de "${trackData.title}":`, error);
    throw error;
  }
}

// Fonction pour générer des statistiques aléatoires
async function generateRandomStatistics(trackId, userId) {
  try {
    await prisma.statistics.create({
      data: {
        trackid: trackId,
        userid: userId,
        listencount: Math.floor(Math.random() * 50) + 1,
        favorite: Math.random() > 0.8, // 20% de chance d'être en favori
      }
    });
  } catch (error) {
    console.error('Erreur lors de la génération des statistiques:', error);
  }
}

// Fonction pour générer des commentaires aléatoires
async function generateRandomComments(trackId, userId) {
  const comments = [
    "Excellent morceau ! 🎵",
    "J'adore cette mélodie",
    "Parfait pour mes playlists",
    "Très bon travail de l'artiste",
    "Ça me rappelle de bons souvenirs",
    "Qualité audio exceptionnelle",
    "Un classique instantané",
    "Bravo pour cette composition !",
    "Ça groove bien 🔥",
    "Magnifique arrangement"
  ];
  
  try {
    if (Math.random() > 0.7) { // 30% de chance d'avoir un commentaire
      await prisma.comments.create({
        data: {
          userid: userId,
          trackid: trackId,
          content: comments[Math.floor(Math.random() * comments.length)]
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la génération des commentaires:', error);
  }
}

// Fonction principale d'import
async function importAllTracks() {
  console.log('🎵 Début de l\'import des morceaux de musique...\n');
  
  try {
    // Créer les dossiers nécessaires
    ensureDirectoryExists(path.join(process.cwd(), 'public', 'audio'));
    ensureDirectoryExists(path.join(process.cwd(), 'public', 'images'));
    
    let importedCount = 0;
    const totalTracks = SAMPLE_TRACKS.length;
    
    for (const trackData of SAMPLE_TRACKS) {
      try {
        const track = await importTrack(trackData);
        importedCount++;
        
        // Générer quelques statistiques et commentaires aléatoires
        const existingUsers = await prisma.users.findMany({
          take: 5,
          orderBy: { id: 'desc' }
        });
        
        for (const user of existingUsers) {
          if (Math.random() > 0.5) { // 50% de chance
            await generateRandomStatistics(track.id, user.id);
          }
          if (Math.random() > 0.8) { // 20% de chance
            await generateRandomComments(track.id, user.id);
          }
        }
        
        console.log(`📈 Progression: ${importedCount}/${totalTracks} morceaux importés`);
        
        // Pause pour éviter de surcharger la base
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Erreur lors de l'import de "${trackData.title}":`, error);
        continue; // Continuer avec le morceau suivant
      }
    }
    
    console.log(`\n🎉 Import terminé ! ${importedCount} morceaux importés avec succès.`);
    
    // Afficher un résumé
    const totalTracksInDB = await prisma.tracks.count();
    const totalArtists = await prisma.users.count({ where: { role: 'artist' } });
    const totalGenres = await prisma.tracks.groupBy({
      by: ['genre'],
      _count: { genre: true }
    });
    
    console.log('\n📊 Résumé de la base de données:');
    console.log(`   • Total morceaux: ${totalTracksInDB}`);
    console.log(`   • Total artistes: ${totalArtists}`);
    console.log(`   • Genres disponibles: ${totalGenres.length}`);
    console.log('\n📁 Fichiers créés:');
    console.log(`   • Fichiers audio: public/uploads/ (${importedCount} fichiers)`);
    console.log(`   • Images utilisées: API Picsum Photos`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour nettoyer la base (optionnel)
async function cleanDatabase() {
  console.log('🧹 Nettoyage de la base de données...');
  
  try {
    await prisma.trackartists.deleteMany();
    await prisma.statistics.deleteMany();
    await prisma.comments.deleteMany();
    await prisma.ratings.deleteMany();
    await prisma.playlisttracks.deleteMany();
    await prisma.tracks.deleteMany();
    await prisma.users.deleteMany({ where: { role: 'artist' } });
    
    console.log('✅ Base de données nettoyée');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--clean')) {
  cleanDatabase().then(() => {
    console.log('Nettoyage terminé. Relancez sans --clean pour importer.');
    process.exit(0);
  });
} else if (args.includes('--help')) {
  console.log(`
🎵 Script d'import de musique pour SonicDiscover

Usage:
  node scripts/music-importer.js          # Importer les morceaux
  node scripts/music-importer.js --clean  # Nettoyer la base avant import
  node scripts/music-importer.js --help   # Afficher cette aide

Ce script va:
✅ Créer ${SAMPLE_TRACKS.length} morceaux de musique avec métadonnées complètes
✅ Créer automatiquement les artistes associés
✅ Générer des fichiers audio² factices pour la démo
✅ Ajouter des statistiques et commentaires aléatoires
✅ Créer une base de données riche pour tester l'application
  `);
  process.exit(0);
} else {
  importAllTracks();
}
