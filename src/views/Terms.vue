<template>
	<div class="terms-page">
		<div class="top">
			<div class="page-title">📄 Conditions d'utilisation de MicroDéfis</div>
		</div>

		<v-card class="micro-card">
			<div class="section">
				<h2>1. Introduction et Acceptation</h2>
				<p>
					MicroDéfis est une application gratuite de défis personnels développée
					par l'équipe de Sabrina Dubois (ci-après "nous", "nos" ou "l'Équipe").
					En créant un compte ou en utilisant l'app, vous acceptez pleinement
					ces Conditions Générales d'Utilisation (CGU). Si vous n'êtes pas
					d'accord, ne l'utilisez pas. Date de dernière mise à jour : 1er
					février 2026.
				</p>

				<h2>2. Création et Gestion du Compte</h2>
				<p>
					Vous devez avoir au moins 18 ans ou l'accord parental pour créer un
					compte. Vous êtes seul responsable de la confidentialité de vos
					identifiants (email/mot de passe). Informez-nous immédiatement de
					toute utilisation non autorisée. Nous pouvons suspendre ou supprimer
					un compte en cas de violation.
				</p>

				<h2>3. Utilisation de l'Application et des Défis</h2>
				<p>
					L'app est pour un usage personnel et non commercial. Vous pouvez
					relever les défis, mais toute triche, contournement de règles (ex. :
					bots, partage frauduleux) entraîne suspension immédiate. Respectez les
					autres utilisateurs : pas de harcèlement ou contenu illégal.
				</p>

				<h2>4. Utilisations Interdites</h2>
				<p>
					Interdit : reverse engineering, décompilation, diffusion massive,
					utilisation de malware, ou toute action nuisant au fonctionnement.
					L'app est gratuite ; pas de monétisation sans autorisation. [web:18]
				</p>

				<h2>5. Propriété Intellectuelle</h2>
				<p>
					L'app, logos, défis, icônes et contenus sont notre propriété exclusive
					(droits d'auteur, marques). Usage personnel autorisé ; toute
					reproduction/modification/distribution sans permission est interdite.
				</p>

				<h2>6. Données Personnelles et RGPD</h2>
				<p>
					Vos données (email, progrès) sont traitées pour le fonctionnement
					(responsable : Sabrina Dubois, contact@microdefis.fr). Consultez notre
					<a href="/privacy">Politique de Confidentialité</a> pour détails,
					droits (accès, rectification, suppression via contact@microdefis.fr)
					et cookies. Conformité RGPD ; pas de vente de données.
				</p>

				<h2>7. Limitation de Responsabilité</h2>
				<p>
					L'app est fournie "telle quelle". Nous ne garantissons pas l'absence
					d'erreurs/bugs ni l'adéquation à vos besoins. Pas de responsabilité
					pour pertes indirectes, données perdues ou dommages (sauf faute
					grave/dol). Force majeure exclue.
				</p>

				<h2>8. Résiliation</h2>
				<p>
					Vous pouvez supprimer votre compte via paramètres. Nous pouvons
					résilier pour violation, sans préavis. Obligations survivent (ex. :
					confidentialité).
				</p>

				<h2>9. Modifications des CGU</h2>
				<p>
					Nous pouvons modifier ces CGU ; notification via app/email. Usage
					continu vaut acceptation. Vérifiez régulièrement.
				</p>

				<h2>10. Loi Applicable et Litiges</h2>
				<p>
					Droit français exclusif. Tout litige : médiation CNCM
					(https://www.mediation-conso.fr), puis Tribunal de Paris.
				</p>

				<h2>11. Contact</h2>
				<p>Questions ? contact@microdefis.</p>
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

a {
	color: #1e40af;
	text-decoration: none;
}

a:hover {
	text-decoration: underline;
}

@media (max-width: 600px) {
	.micro-card {
		padding: 20px;
	}

	h2 {
		font-size: 18px;
	}

	p {
		font-size: 15px;
	}
}
</style>
