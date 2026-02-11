<template>
  <div class="privacy-page">
    <div class="top">
      <div class="page-title">🔒 Politique de Confidentialité de MicroDéfis</div>
    </div>

    <v-card class="micro-card">
      <div class="section">
        <h2 class="page-subtitle">1. Introduction</h2>
          L'Équipe de développement de MicroDéfis (ci-après "l'Équipe", Sabrina Dubois, France ; contact : contact@microdefis.fr) s'engage à protéger vos données personnelles conformément au RGPD (Règlement UE 2016/679). 
          <br> Cette Politique explique comment nous collectons, utilisons et protégeons vos données dans l'app MicroDéfis. 
          Date : 1er février 2026.

        <h2 class="page-subtitle">2. Données Collectées</h2>
          Nous collectons uniquement les données nécessaires :
          <ul>
            <li>Identité : nom/prénom (optionnel), email (requis pour compte).</li>
            <li>Technique : progression défis, streaks, ID appareil, IP (anonymisée).</li>
            <li>Usage : notifications lues, préférences (opt-in).</li>
          </ul>
          Pas de données sensibles (santé, etc.).

        <h2 class="page-subtitle">3. Bases Légales et Utilisations</h2>
          Bases RGPD :
          <ul>
            <li>Consentement (notifications, cookies).</li>
            <li>Exécution contrat (gestion compte, défis).</li>
            <li>Intérêt légitime (amélioration app, sécurité).</li>
          </ul>
          Utilisations : gérer compte, suivre défis/streaks, notifications, analytics anonymes, support.

        <h2 class="page-subtitle">4. Partage et Destinataires</h2>
          Pas de vente/partage commercial. Destinataires limités :
          <ul>
            <li>Hébergeurs (OVH, UE ; contrat DPA).</li>
            <li>Analytics (Google Analytics anonymisé, UE).</li>
            <li>Autorités légales (sur réquisition).</li>
          </ul>

        <h2 class="page-subtitle">5. Conservation des Données</h2>
        <p>
          Compte actif : durée d'utilisation + 1 an. 
          Supprimé : 30 jours (sauf obligations légales : 5 ans fiscal). 
          Logs sécurité : 6 mois.
        </p>

        <h2 class="page-subtitle">6. Sécurité des Données</h2>
        <p>
          Mesures : chiffrement (HTTPS, AES-256), authentification 2FA optionnelle, audits réguliers, accès restreint. 
          Notification breach en 72h si risque élevé (art. 33 RGPD).
        </p>

        <h2 class="page-subtitle">7. Cookies et Technologies Similaires</h2>
        <p>
          Cookies essentiels (session, sécurité : durée 1 an). 
          Analytics (opt-in, anonymes). 
          Gérez via paramètres app/navigateur. Pas de trackers publicitaires. [web:24]
        </p>

        <h2 class="page-subtitle">8. Vos Droits RGPD</h2>
        <p>
          Accès, rectification, opposition, portabilité, oubli ("droit à l'oubli"), limitation. 
          Via app (paramètres) ou email contact@microdefis.fr (réponse 1 mois). 
          Réclamation CNIL : www.cnil.fr.
        </p>

        <h2 class="page-subtitle">9. Transferts Hors UE</h2>
        <p>
          Aucun, sauf outils certifiés (ex. : Privacy Shield si US, clauses contractuelles). Tous serveurs en UE. [web:24]
        </p>

        <h2 class="page-subtitle">10. Modifications</h2>
        <p>
          Mises à jour notifiées via app/email. Continuité = acceptation.
        </p>

        <h2 class="page-subtitle">11. Contact du DPO</h2>
        <p>
          Délégué : contact@microdefis.fr. Pas de DPO externe pour petite structure.
        </p>
      </div>
    </v-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.top {
	margin: 12px 0 20px;
}

.micro-title {
	font-size: 24px;
	font-weight: 700;
	color: #059669;
}

.micro-card {
	padding: 24px;
	margin-bottom: 24px;
	background: white;
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section {
	max-width: 800px;
}

h2 {
	font-size: 20px;
	font-weight: 600;
	color: #374151;
	margin: 28px 0 16px;
	border-bottom: 2px solid #e5e7eb;
	padding-bottom: 8px;
}

h2:first-child {
	margin-top: 0;
}

p {
	font-size: 16px;
	line-height: 1.6;
	color: #4b5563;
	margin-bottom: 20px;
}

ul {
	margin: 12px 0;
	padding-left: 24px;
}

li {
	font-size: 16px;
	line-height: 1.6;
	color: #4b5563;
	margin-bottom: 8px;
}

@media (max-width: 600px) {
	.micro-card {
		padding: 20px;
	}

	h2 {
		font-size: 18px;
	}

	p,
	li {
		font-size: 15px;
	}
}
</style>
