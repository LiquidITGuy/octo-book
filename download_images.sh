#!/bin/bash

# Script pour télécharger toutes les images des livres OCTO
echo "🔽 Téléchargement des images des livres OCTO..."

# Créer le dossier s'il n'existe pas
mkdir -p frontend/books/images

# Liste des URLs des images extraites du books.json
declare -a urls=(
"https://octo.com/assets/publications-categories-images/les_geants_du_web.jpg"
"https://octo.com/assets/publications-categories-images/refcard_restful_api_design.jpg"
"https://octo.com/assets/publications-categories-images/refcard_api_security.jpg"
"https://octo.com/assets/publications-categories-images/refcard_api_management.jpg"
"https://octo.com/assets/publications-categories-images/rewind_usi_2023.jpg"
"https://octo.com/assets/publications-categories-images/inside_usi_2021.jpg"
"https://octo.com/assets/publications-categories-images/inside_usi_2019.jpg"
"https://octo.com/assets/publications-categories-images/inside_usi_2018.jpg"
"https://octo.com/assets/publications-categories-images/inside_usi_2017.jpg"
"https://octo.com/assets/publications-categories-images/inside_usi_2016.jpg"
"https://octo.com/assets/publications-categories-images/inside_usi_2015.jpg"
"https://octo.com/assets/publications-categories-images/banque_digitale.jpg"
"https://octo.com/assets/publications-categories-images/octo_magazine_3.jpg"
"https://octo.com/assets/publications-categories-images/octo_magazine_2.jpg"
"https://octo.com/assets/publications-categories-images/octo_magazine_1.jpg"
"https://octo.com/assets/publications-categories-images/digital_studies_volume_3.jpg"
"https://octo.com/assets/publications-categories-images/digital_studies_volume_2.jpg"
"https://octo.com/assets/publications-categories-images/digital_studies_volume_1.jpg"
"https://octo.com/assets/publications-categories-images/rewind_usi_2024.jpg"
"https://octo.com/assets/publications-categories-images/devenir_une_entreprise_agile.jpg"
"https://octo.com/assets/publications-categories-images/culture_produit.jpg"
"https://octo.com/assets/publications-categories-images/okrs___piloter_le_produit_par_l_impact.jpg"
"https://octo.com/assets/publications-categories-images/s_organiser_pour_avoir_de_l_impact.jpg"
"https://octo.com/assets/publications-categories-images/poster_culture_innov.jpg"
"https://octo.com/assets/publications-categories-images/pour_une_roadmap_produit.jpg"
"https://octo.com/assets/publications-categories-images/refcard_eroom.jpg"
"https://octo.com/assets/publications-categories-images/refcard_ddd_strategique.jpg"
"https://octo.com/assets/publications-categories-images/refcard_eco_conception_des_apps_mobiles.jpg"
"https://octo.com/assets/publications-categories-images/refcard_accessibilite.jpg"
"https://octo.com/assets/publications-categories-images/octo_pulse___tech_trends_2025.jpg"
"https://octo.com/assets/publications-categories-images/tech_radar_2025___preparez_votre_roadmap.jpg"
"https://octo.com/assets/publications-categories-images/refcard_strategie_de_tests_sur_tous_les_fronts.jpg"
"https://octo.com/assets/publications-categories-images/refcard_low_code_no_code.jpg"
"https://octo.com/assets/publications-categories-images/culture_code.jpg"
"https://octo.com/assets/publications-categories-images/culture_test_volume_3.jpg"
"https://octo.com/assets/publications-categories-images/culture_test_volume_2.jpg"
"https://octo.com/assets/publications-categories-images/culture_test_volume_1.jpg"
"https://octo.com/assets/publications-categories-images/a_la_decouverte_du_devops.jpg"
"https://octo.com/assets/publications-categories-images/apprendre_le_japonais.jpg"
"https://octo.com/assets/publications-categories-images/refcard_graphql.jpg"
"https://octo.com/assets/publications-categories-images/refcard_pwa.jpg"
"https://octo.com/assets/publications-categories-images/refcard_mobile_app.jpg"
"https://octo.com/assets/publications-categories-images/refcard_mob_trends.jpg"
"https://octo.com/assets/publications-categories-images/culture_produit_data.jpg"
"https://octo.com/assets/publications-categories-images/culture_mlops.jpg"
"https://octo.com/assets/publications-categories-images/culture_data_et_industrie_vol._1.jpg"
"https://octo.com/assets/publications-categories-images/culture_data_et_industrie_vol._2.jpg"
"https://octo.com/assets/publications-categories-images/refcard_apache_spark.jpg"
"https://octo.com/assets/publications-categories-images/hadoop___feuille_de_route.jpg"
"https://octo.com/assets/publications-categories-images/hors_serie___souverainete_numerique.jpg"
"https://octo.com/assets/publications-categories-images/refcard_prod_ready.jpg"
"https://octo.com/assets/publications-categories-images/culture_devops_volume_3.jpg"
"https://octo.com/assets/publications-categories-images/culture_devops_volume_2.jpg"
"https://octo.com/assets/publications-categories-images/culture_devops_volume_1.jpg"
"https://octo.com/assets/publications-categories-images/refcard_api_architecture_strategy.jpg"
"https://octo.com/assets/publications-categories-images/cloud_ready_apps.jpg"
"https://octo.com/assets/publications-categories-images/le_livre_de_la_duck.jpg"
"https://octo.com/assets/publications-categories-images/culture_okr.jpg"
"https://octo.com/assets/publications-categories-images/refcard_equipe_agile.jpg"
"https://octo.com/assets/publications-categories-images/culture_kaizen.jpg"
"https://octo.com/assets/publications-categories-images/culture_hacking.jpg"
"https://octo.com/assets/publications-categories-images/culture_flow.jpg"
"https://octo.com/assets/publications-categories-images/culture_change.jpg"
)

# Compteur pour le suivi
total=${#urls[@]}
current=0

# Télécharger chaque image
for url in "${urls[@]}"; do
    current=$((current + 1))
    filename=$(basename "$url")
    
    echo "[$current/$total] Téléchargement de $filename..."
    
    # Télécharger avec curl
    curl -s -L -o "frontend/books/images/$filename" "$url"
    
    # Vérifier si le téléchargement a réussi
    if [ $? -eq 0 ] && [ -f "frontend/books/images/$filename" ]; then
        echo "  ✅ $filename téléchargé avec succès"
    else
        echo "  ❌ Erreur lors du téléchargement de $filename"
    fi
    
    # Petite pause pour éviter de surcharger le serveur
    sleep 0.1
done

echo ""
echo "🎉 Téléchargement terminé !"
echo "📁 Images sauvegardées dans frontend/books/images/"

# Afficher la taille du dossier
echo "📊 Taille totale : $(du -sh frontend/books/images | cut -f1)"
echo "📈 Nombre de fichiers : $(ls -1 frontend/books/images | wc -l)"
