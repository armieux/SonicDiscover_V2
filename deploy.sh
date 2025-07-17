#!/bin/bash

# Script de déploiement pour SonicDiscover V2
# Usage: ./deploy.sh [dev|prod|stop|logs|restart]

set -e

PROJECT_NAME="sonicdiscover"
COMPOSE_FILE="docker-compose.yml"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Docker est installé
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose n'est pas installé"
        exit 1
    fi
}

# Créer les fichiers d'environnement si nécessaire
setup_env() {
    if [ ! -f .env ]; then
        if [ -f .env.production ]; then
            log "Copie de .env.production vers .env"
            cp .env.production .env
        else
            warn "Aucun fichier .env trouvé. Veuillez créer un fichier .env avec vos variables d'environnement."
            return 1
        fi
    fi
}

# Déploiement en mode développement
dev_deploy() {
    log "Déploiement en mode développement..."
    setup_env
    docker-compose -f $COMPOSE_FILE --profile admin up -d postgres adminer
    log "Base de données PostgreSQL et Adminer démarrés"
    log "Adminer disponible sur http://localhost:8080"
    log "Pour démarrer l'application : npm run dev"
}

# Déploiement en mode production
prod_deploy() {
    log "Déploiement en mode production..."
    setup_env
    
    # Build de l'image
    log "Construction de l'image Docker..."
    docker-compose -f $COMPOSE_FILE build app
    
    # Démarrage des services
    log "Démarrage des services..."
    docker-compose -f $COMPOSE_FILE --profile production up -d
    
    # Attendre que les services soient prêts
    log "Attente du démarrage des services..."
    sleep 10
    
    # Vérifier le statut
    docker-compose -f $COMPOSE_FILE ps
    
    log "Déploiement terminé !"
    log "Application disponible sur http://localhost:3000"
    log "Adminer disponible sur http://localhost:8080"
    log "Nginx disponible sur http://localhost:80"
}

# Arrêter tous les services
stop_services() {
    log "Arrêt des services..."
    docker-compose -f $COMPOSE_FILE down
    log "Services arrêtés"
}

# Redémarrer les services
restart_services() {
    log "Redémarrage des services..."
    docker-compose -f $COMPOSE_FILE restart
    log "Services redémarrés"
}

# Afficher les logs
show_logs() {
    if [ -n "$2" ]; then
        docker-compose -f $COMPOSE_FILE logs -f "$2"
    else
        docker-compose -f $COMPOSE_FILE logs -f
    fi
}

# Nettoyer les volumes et images
cleanup() {
    warn "Cette action va supprimer tous les volumes et données !"
    read -p "Êtes-vous sûr ? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f $COMPOSE_FILE down -v --rmi all
        docker system prune -f
        log "Nettoyage terminé"
    fi
}

# Backup de la base de données
backup_db() {
    log "Sauvegarde de la base de données..."
    timestamp=$(date +"%Y%m%d_%H%M%S")
    docker-compose -f $COMPOSE_FILE exec postgres pg_dump -U user sonicdiscover > "backup_${timestamp}.sql"
    log "Sauvegarde créée: backup_${timestamp}.sql"
}

# Restaurer la base de données
restore_db() {
    if [ -z "$2" ]; then
        error "Usage: $0 restore <backup_file.sql>"
        exit 1
    fi
    
    if [ ! -f "$2" ]; then
        error "Fichier de sauvegarde non trouvé: $2"
        exit 1
    fi
    
    warn "Cette action va écraser la base de données actuelle !"
    read -p "Êtes-vous sûr ? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Restauration de la base de données..."
        docker-compose -f $COMPOSE_FILE exec -T postgres psql -U user -d sonicdiscover < "$2"
        log "Restauration terminée"
    fi
}

# Mise à jour de l'application
update_app() {
    log "Mise à jour de l'application..."
    git pull origin main
    docker-compose -f $COMPOSE_FILE build app
    docker-compose -f $COMPOSE_FILE up -d app
    log "Mise à jour terminée"
}

# Menu principal
case "$1" in
    "dev")
        check_docker
        dev_deploy
        ;;
    "prod")
        check_docker
        prod_deploy
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "logs")
        show_logs "$@"
        ;;
    "cleanup")
        cleanup
        ;;
    "backup")
        backup_db
        ;;
    "restore")
        restore_db "$@"
        ;;
    "update")
        update_app
        ;;
    *)
        echo -e "${BLUE}Usage: $0 {dev|prod|stop|restart|logs|cleanup|backup|restore|update}${NC}"
        echo ""
        echo "Commandes disponibles:"
        echo "  dev      - Déploie la base de données pour le développement"
        echo "  prod     - Déploie l'application complète en production"
        echo "  stop     - Arrête tous les services"
        echo "  restart  - Redémarre tous les services"
        echo "  logs     - Affiche les logs (optionnel: nom du service)"
        echo "  cleanup  - Nettoie les volumes et images"
        echo "  backup   - Sauvegarde la base de données"
        echo "  restore  - Restaure la base de données depuis un fichier"
        echo "  update   - Met à jour l'application depuis Git"
        exit 1
        ;;
esac
