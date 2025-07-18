/** Script d'import automatique de musiques pour SonicDiscover
* Utilise l'API Jamendo pour récupérer de vraies musiques libres de droits
*
* Ce script importe des morceaux avec de vraies métadonnées :
    * - Vrais fichiers MP3/OGG depuis Jamendo
* - Métadonnées complètes (titre, artiste, genre, BPM, durée)
* - Images de couverture réelles
* - Création d'utilisateurs artistes automatique
*/

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const https = require('https');

const prisma = new PrismaClient();

// Configuration API Jamendo (gratuite, pas de clé nécessaire)
const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const API_CLIENT_ID = 'aa647fe9'; // Client ID de démonstration

// Genres disponibles sur Jamendo
const GENRES = [
  'rock', 'pop', 'electronic', 'jazz', 'classical', 'blues', 'country',
  'folk', 'hiphop', 'reggae', 'latin', 'world', 'metal', 'punk', 'ambient'
];

// Configuration du script
const CONFIG = {
  maxTracksPerGenre: 5, // Nombre max de morceaux par genre
  totalTracks: 50,      // Nombre total souhaité
  downloadAudio: false, // true pour télécharger les fichiers audio localement
  useHighQuality: false  // true pour utiliser la haute qualité (OGG), false pour MP3
};

// Fonction pour faire une requête HTTP(S)
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : require('http');

    protocol.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Fonction pour télécharger un fichier
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : require('http');
    const file = fs.createWriteStream(outputPath);

    protocol.get(url, (response) => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });

      file.on('error', (error) => {
        fs.unlink(outputPath, () => {}); // Supprimer le fichier en cas d'erreur
        reject(error);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Fonction pour créer un dossier s'il n'existe pas
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Dossier créé: ${dirPath}`);
  }
}

// Fonction pour récupérer les morceaux depuis Jamendo
async function fetchTracksFromJamendo(genre, limit = 10) {
  try {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${API_CLIENT_ID}&format=json&limit=${limit}&tags=${genre}&include=musicinfo&audioformat=${CONFIG.useHighQuality ? 'ogg' : 'mp31'}`;
    console.log(url);
    console.log(`🔍 Recherche de morceaux pour le genre: ${genre}`);
    const response = await makeRequest(url);

    if (!response.results || response.results.length === 0) {
      console.log(`⚠️  Aucun morceau trouvé pour le genre: ${genre}`);
      return [];
    }

    console.log(`✅ ${response.results.length} morceaux trouvés pour ${genre}`);
    return response.results;

  } catch (error) {
    console.error(`❌ Erreur lors de la récupération pour ${genre}:`, error.message);
    return [];
  }
}

// Fonction pour récupérer les informations détaillées d'un artiste
async function fetchArtistInfo(artistId) {
  try {
    const url = `${JAMENDO_API_BASE}/artists/?client_id=${API_CLIENT_ID}&format=json&id=${artistId}`;
    const response = await makeRequest(url);

    if (response.results && response.results.length > 0) {
      return response.results[0];
    }
    return null;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération de l'artiste ${artistId}:`, error.message);
    return null;
  }
}

// Fonction pour déterminer le mood basé sur les tags et le genre
function determineMood(tags, genre) {
  const moodMap = {
    'energetic': ['dance', 'party', 'upbeat', 'fast', 'electronic', 'rock'],
    'calm': ['relaxing', 'chill', 'ambient', 'slow', 'peaceful'],
    'happy': ['uplifting', 'positive', 'cheerful', 'bright', 'pop'],
    'melancholic': ['sad', 'emotional', 'deep', 'blues', 'minor'],
    'romantic': ['love', 'romantic', 'soft', 'gentle'],
    'mysterious': ['dark', 'mysterious', 'atmospheric', 'ambient'],
    'nostalgic': ['vintage', 'retro', 'classic', 'old'],
    'powerful': ['strong', 'intense', 'aggressive', 'rock', 'metal']
  };

  const allTags = [...tags, genre].map(tag => tag.toLowerCase());

  for (const [mood, keywords] of Object.entries(moodMap)) {
    if (keywords.some(keyword => allTags.some(tag => tag.includes(keyword)))) {
      return mood;
    }
  }

  return 'neutral';
}

// Fonction pour estimer le BPM basé sur le genre
function estimateBPM(genre, musicInfo) {
  // Si les infos musicales contiennent le BPM, on l'utilise
  if (musicInfo && musicInfo.bpm && musicInfo.bpm > 0) {
    return Math.round(musicInfo.bpm);
  }

  // Sinon, estimation basée sur le genre
  const bpmRanges = {
    'ambient': [60, 80],
    'jazz': [80, 140],
    'blues': [60, 120],
    'country': [80, 140],
    'folk': [80, 120],
    'classical': [60, 200],
    'pop': [100, 140],
    'rock': [110, 160],
    'metal': [120, 200],
    'punk': [150, 200],
    'electronic': [120, 140],
    'hiphop': [70, 100],
    'reggae': [60, 90],
    'latin': [100, 180],
    'world': [80, 150]
  };

  const range = bpmRanges[genre.toLowerCase()] || [100, 130];
  return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
}

// Fonction pour créer un utilisateur artiste
async function createArtistUser(artistData) {
  try {
    // Vérifier si l'artiste existe déjà
    const existingUser = await prisma.users.findFirst({
      where: { username: artistData.name }
    });

    if (existingUser) {
      return existingUser;
    }

    // Créer un nouvel utilisateur artiste
    const artist = await prisma.users.create({
      data: {
        username: artistData.name,
        email: `${artistData.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@jamendo.com`,
        password: '$2b$12$dummy.hash.for.demo.purposes.only', // Hash factice
        role: 'artist',
        profilepicture: artistData.image || `https://picsum.photos/200/200?random=${artistData.id}`,
        followerscount: Math.floor(Math.random() * 50000) + 1000,
        followingcount: Math.floor(Math.random() * 1000) + 50
      }
    });

    console.log(`✅ Artiste créé: ${artistData.name} (ID: ${artist.id})`);
    return artist;
  } catch (error) {
    console.error(`❌ Erreur lors de la création de l'artiste ${artistData.name}:`, error.message);
    throw error;
  }
}

// Fonction pour vérifier si un morceau existe déjà (vérification complète)
async function checkTrackExists(track, artistData) {
  try {
    // 1. Vérifier par ID Jamendo (le plus fiable)
    const existingByJamendoId = await prisma.tracks.findFirst({
      where: {
        OR: [
          { audiofile: { contains: track.id.toString() } },
          { trackpicture: { contains: track.id.toString() } }
        ]
      }
    });

    if (existingByJamendoId) {
      console.log(`⚠️  Morceau déjà existant (ID Jamendo): \"${track.name}\" par ${artistData.name}`);
      return existingByJamendoId;
    }

    // 2. Vérifier par titre et artiste exact
    const existingByTitleArtist = await prisma.tracks.findFirst({
      where: {
        title: track.name,
        trackartists: {
          some: {
            users: {
              username: artistData.name
            }
          }
        }
      }
    });

    if (existingByTitleArtist) {
      console.log(`⚠️  Morceau déjà existant (titre+artiste): \"${track.name}\" par ${artistData.name}`);
      return existingByTitleArtist;
    }

    // 3. Vérifier par titre similaire et même artiste (pour les variantes)
    const existingBySimilarTitle = await prisma.tracks.findFirst({
      where: {
        title: {
          contains: track.name.substring(0, Math.min(track.name.length, 20))
        },
        trackartists: {
          some: {
            users: {
              username: artistData.name
            }
          }
        }
      }
    });

    if (existingBySimilarTitle &&
        existingBySimilarTitle.title.toLowerCase().trim() === track.name.toLowerCase().trim()) {
      console.log(`⚠️  Morceau déjà existant (titre similaire): \"${track.name}\" par ${artistData.name}`);
      return existingBySimilarTitle;
    }

    return null;
  } catch (error) {
    console.error(`❌ Erreur lors de la vérification d'existence pour \"${track.name}\":`, error.message);
    return null;
  }
}

// Fonction pour traiter et télécharger l'audio si nécessaire
async function processAudioFile(track) {
  const audioUrl = CONFIG.useHighQuality ? track.audiodownload_allowed ? track.audiodownload : track.audio : track.audio;

  if (CONFIG.downloadAudio) {
    try {
      const audioDir = path.join(process.cwd(), 'public', 'uploads');
      ensureDirectoryExists(audioDir);

      const fileName = `${track.id}_${track.name.replace(/[^a-zA-Z0-9]/g, '_')}.${CONFIG.useHighQuality ? 'ogg' : 'mp3'}`;
      const filePath = path.join(audioDir, fileName);

      console.log(`📥 Téléchargement de: ${track.name}`);
      await downloadFile(audioUrl, filePath);

      return `/uploads/${fileName}`;
    } catch (error) {
      console.error(`❌ Erreur lors du téléchargement de ${track.name}:`, error.message);
      return audioUrl; // Utiliser l'URL directe en cas d'échec
    }
  }

  return audioUrl; // Utiliser l'URL directe
}

// Fonction pour importer un morceau
async function importTrack(track, artistData) {
  try {
    // Vérifier si le morceau existe déjà avec une vérification complète
    const existingTrack = await checkTrackExists(track, artistData);

    if (existingTrack) {
      return null; // Retourner null pour indiquer qu'aucun nouveau morceau n'a été créé
    }

    // Créer l'utilisateur artiste
    const artist = await createArtistUser(artistData);

    // Traiter le fichier audio
    const audioFilePath = await processAudioFile(track);

    // Déterminer les métadonnées
    const mood = determineMood(track.musicinfo ? track.musicinfo.tags.genres[0] : [], track.musicinfo ? track.musicinfo.tags.genres[0] || 'unknown' : 'unknown');
    const bpm = estimateBPM(track.musicinfo ? track.musicinfo.tags.genres[0] || 'unknown' : 'unknown', track.musicinfo);
    console.log(track.musicinfo);
    const genre = track.musicinfo && track.musicinfo.tags.genres.length > 0
        ? track.musicinfo.tags.genres[0]
        : 'Unknown';

    // Créer le morceau
    const newTrack = await prisma.tracks.create({
      data: {
        title: track.name,
        trackpicture: track.image || `https://picsum.photos/400/400?random=${track.id}`,
        genre: genre,
        bpm: bpm,
        mood: mood,
        audiofile: audioFilePath,
        duration: Math.round(track.duration) || 180, // Durée en secondes
        playcount: Math.floor(Math.random() * 100000),
        likecount: Math.floor(Math.random() * 10000),
        dislikecount: Math.floor(Math.random() * 1000),
        averagerating: Math.random() * 4 + 1 // Entre 1 et 5
      }
    });

    // Associer l'artiste au morceau
    await prisma.trackartists.create({
      data: {
        artistid: artist.id,
        trackid: newTrack.id,
        role: 'main_artist'
      }
    });

    console.log(`✅ Morceau importé: \"${track.name}\" par ${artistData.name} (${genre}, ${bpm} BPM, ${mood})`);
    return newTrack;
  } catch (error) {
    console.error(`❌ Erreur lors de l'import de \"${track.name}\":`, error.message);
    throw error;
  }
}

// Fonction pour générer des interactions utilisateur
async function generateUserInteractions(trackId) {
  try {
    // Récupérer quelques utilisateurs existants
    const users = await prisma.users.findMany({
      where: { role: 'user' },
      take: 10
    });

    if (users.length === 0) {
      // Créer quelques utilisateurs de test si aucun n'existe
      const testUsers = [];
      for (let i = 1; i <= 5; i++) {
        const user = await prisma.users.create({
          data: {
            username: `user${i}`,
            email: `user${i}@test.com`,
            password: '$2b$12$dummy.hash.for.demo.purposes.only',
            role: 'user',
            profilepicture: `https://picsum.photos/150/150?random=${i}`,
            followerscount: Math.floor(Math.random() * 1000),
            followingcount: Math.floor(Math.random() * 500)
          }
        });
        testUsers.push(user);
      }
      users.push(...testUsers);
    }

    // Générer des statistiques d'écoute
    for (const user of users.slice(0, Math.floor(Math.random() * users.length))) {
      if (Math.random() > 0.3) { // 70% chance
        await prisma.statistics.create({
          data: {
            trackid: trackId,
            userid: user.id,
            listencount: Math.floor(Math.random() * 50) + 1,
            favorite: Math.random() > 0.8
          }
        });
      }
    }

    // Générer des ratings
    for (const user of users.slice(0, Math.floor(Math.random() * users.length))) {
      if (Math.random() > 0.5) { // 50% chance
        await prisma.ratings.create({
          data: {
            trackid: trackId,
            userid: user.id,
            liked: Math.random() > 0.2 // 80% de likes
          }
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de la génération des interactions:', error.message);
  }
}

// Fonction principale d'import
async function importAllTracks() {
  console.log('🎵 Début de l\'import des morceaux depuis Jamendo API...\n');

  try {
    // Afficher l'état initial de la base de données
    const initialTrackCount = await prisma.tracks.count();
    console.log(`📊 État initial: ${initialTrackCount} morceaux déjà en base`);

    // Créer les dossiers nécessaires
    if (CONFIG.downloadAudio) {
      ensureDirectoryExists(path.join(process.cwd(), 'public', 'uploads'));
    }

    let importedCount = 0;
    let skippedCount = 0;
    const targetCount = CONFIG.totalTracks;
    const shuffledGenres = [...GENRES].sort(() => Math.random() - 0.5);

    for (const genre of shuffledGenres) {
      if (importedCount >= targetCount) break;

      try {
        const tracks = await fetchTracksFromJamendo(genre, CONFIG.maxTracksPerGenre);

        for (const track of tracks) {
          if (importedCount >= targetCount) break;

          try {
            // Récupérer les infos de l'artiste
            const artistInfo = await fetchArtistInfo(track.artist_id);
            if (!artistInfo) continue;

            const importedTrack = await importTrack(track, artistInfo);
            if (importedTrack) {
              // Générer des interactions utilisateur
              await generateUserInteractions(importedTrack.id);

              importedCount++;
              console.log(`📈 Progression: ${importedCount}/${targetCount} morceaux importés (${skippedCount} doublons ignorés)`);

              // Pause pour éviter de surcharger l'API
              await new Promise(resolve => setTimeout(resolve, 500));
            } else {
              skippedCount++;
            }

          } catch (error) {
            console.error(`❌ Erreur lors de l'import de \"${track.name}\":`, error.message);
            continue;
          }
        }

      } catch (error) {
        console.error(`❌ Erreur lors du traitement du genre ${genre}:`, error.message);
        continue;
      }
    }

    console.log(`\n🎉 Import terminé ! ${importedCount} nouveaux morceaux importés, ${skippedCount} doublons ignorés.`);

    // Afficher un résumé
    const totalTracksInDB = await prisma.tracks.count();
    const totalArtists = await prisma.users.count({ where: { role: 'artist' } });
    const totalGenres = await prisma.tracks.groupBy({
      by: ['genre'],
      _count: { genre: true }
    });

    console.log('\
📊 Résumé de la base de données:');
    console.log(`   • Total morceaux: ${totalTracksInDB}`);
    console.log(`   • Total artistes: ${totalArtists}`);
    console.log(`   • Genres disponibles: ${totalGenres.length}`);
    console.log('\
🎵 Sources:');
    console.log(`   • API: Jamendo (musiques libres de droits)`);
    console.log(`   • Qualité: ${CONFIG.useHighQuality ? 'OGG haute qualité' : 'MP3 standard'}`);
    console.log(`   • Fichiers: ${CONFIG.downloadAudio ? 'Téléchargés localement' : 'Liens directs vers Jamendo'}`);

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

    // Nettoyer les fichiers audio téléchargés
    if (CONFIG.downloadAudio) {
      const audioDir = path.join(process.cwd(), 'public', 'uploads');
      if (fs.existsSync(audioDir)) {
        const files = fs.readdirSync(audioDir);
        files.forEach(file => {
          if (file.endsWith('.mp3') || file.endsWith('.ogg')) {
            fs.unlinkSync(path.join(audioDir, file));
          }
        });
      }
    }

    console.log('✅ Base de données nettoyée');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Fonction pour tester la connexion API
async function testAPIConnection() {
  console.log('🔌 Test de connexion à l\'API Jamendo...');

  try {
    const url = `${JAMENDO_API_BASE}/tracks/?client_id=${API_CLIENT_ID}&format=json&limit=1`;
    const response = await makeRequest(url);

    if (response.results && response.results.length > 0) {
      console.log('✅ Connexion API réussie');
      console.log(`📡 Exemple de morceau: \"${response.results[0].name}\" par ${response.results[0].artist_name}`);
      return true;
    } else {
      console.log('❌ Aucun résultat de l\'API');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur de connexion API:', error.message);
    return false;
  }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--clean')) {
  cleanDatabase().then(() => {
    console.log('Nettoyage terminé. Relancez sans --clean pour importer.');
    process.exit(0);
  });
} else if (args.includes('--test')) {
  testAPIConnection().then(() => {
    process.exit(0);
  });
} else if (args.includes('--download')) {
  CONFIG.downloadAudio = true;
  console.log('🎵 Mode téléchargement activé - les fichiers audio seront téléchargés localement');
  importAllTracks();
} else if (args.includes('--help')) {
  console.log(`
🎵 Script d'import de musique pour SonicDiscover (API Jamendo)

Usage:
  node scripts/music-importer-jamendo.js              # Importer ${CONFIG.totalTracks} morceaux (liens directs)
  node scripts/music-importer-jamendo.js --download   # Importer + télécharger les fichiers localement
  node scripts/music-importer-jamendo.js --clean      # Nettoyer la base avant import
  node scripts/music-importer-jamendo.js --test       # Tester la connexion API
  node scripts/music-importer-jamendo.js --help       # Afficher cette aide

Ce script va:
✅ Récupérer de vraies musiques libres de droits depuis Jamendo
✅ Importer les morceaux dans la base de données avec toutes les métadonnées
✅ Créer des utilisateurs artistes automatiquement
✅ Télécharger les fichiers audio (optionnel)
✅ Générer des interactions utilisateur aléatoires (écoutes, likes, etc.)

Options:
  --download   : Télécharger les fichiers audio localement (sinon, seuls les liens sont importés)
  --clean      : Nettoyer la base de données avant l'import (supprime tous les morceaux, artistes, etc.)
  --test       : Tester la connexion à l'API Jamendo (vérifie si l'API est accessible)
  --help       : Afficher cette aide

Remarque: Ce script utilise des données de démonstration et peut créer un grand nombre d'entrées. Utilisez avec précaution sur une base de données en production.
`);
} else {
  importAllTracks();
}
