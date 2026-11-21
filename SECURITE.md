# CANNOVA : sécurité, expliquée simplement

## Ta remarque sur F12 : elle est juste
Tout ce qui est écrit dans la page du site (le code qu'on voit avec F12) peut être lu et modifié par n'importe quel visiteur. C'est pour ça que **les codes de réduction ne sont plus dans la page** : ils sont stockés sur le serveur, qui répond « valable » ou « pas valable ». Un visiteur ne peut ni lire la liste des codes, ni en créer.

## Ce qui est en place
- **Espace admin** (`/admin`) : connexion par **e-mail unique** (oreofalonnaa@gmail.com) avec un code à usage unique envoyé par e-mail. Autre e-mail : refusé, renvoyé sur l'accueil, enregistré, appareil bloqué 1 heure après 3 essais.
- **Cookie de session** protégé (HttpOnly, Secure, SameSite=Strict), signé et limité à 8 heures. Un cookie falsifié est refusé.
- **Limites** (anti-bots, anti-surcharge) : 90 mesures par minute, 20 essais de code par 10 minutes, 8 demandes de connexion par 15 minutes, par appareil.
- **En-têtes de sécurité** (`vercel.json`) : interdit les scripts venant d'ailleurs que ton site et cdnjs, interdit d'afficher ton site dans le cadre d'un autre site, force HTTPS, bloque caméra, micro et géolocalisation.
- **Formulaire d'adresse** : longueurs limitées, téléphone contrôlé, caractères dangereux retirés, champ piège contre les robots.
- **Panier** : prix et grammages recalculés à partir du catalogue à chaque affichage ; 20 lignes et 20 unités maximum.
- **Données clients** : le panier et l'adresse restent dans le navigateur du client. **Le serveur ne stocke que des compteurs anonymes et les codes**, jamais de nom, d'adresse ni de téléphone.
- **Cookies visiteurs** : aucun.

## « 1 000 visiteurs en même temps »
- Les pages sont servies par le réseau de Vercel, qui encaisse des milliers de visiteurs sans effort.
- Les fonctions serveur s'adaptent automatiquement au nombre de visiteurs ; les mesures sont envoyées en tâche de fond : si la base est saturée, le site continue de fonctionner.
- **Mode léger automatique** : si un appareil est trop lent (moins de 24 images par seconde) ou en mode économie de données, le fond 3D se coupe et les animations s'arrêtent. Sur les téléphones modestes, le nombre de feuilles 3D est réduit dès le départ.
- Les photos sont mises en cache 24 heures.

## À faire de ton côté (10 minutes)
1. **Double authentification (2FA)** sur **Gmail**, GitHub, Vercel, Upstash et Resend : c'est la protection la plus importante.
2. Mots de passe longs et uniques (gestionnaire de mots de passe).
3. Sur Vercel : **Settings, Firewall** : « Attack Challenge Mode » en cas d'attaque.
4. Dépôt GitHub **privé**, et ne mets jamais de mot de passe ou de clé dans les fichiers (les clés vont dans les variables d'environnement).
5. Garde une copie du dossier sur ton ordinateur.

## Limites, honnêtement
- **Aucun site n'est invulnérable.** Ce qui est en place réduit fortement les risques courants.
- **Je ne peux pas intégrer d'« antivirus »** : la protection équivalente, ce sont les règles d'autorisation de scripts (CSP), les limites de requêtes et les protections de tes comptes.
- Le site charge three.js depuis cdnjs ; pour supprimer ce risque rare, héberge toi-même ce fichier.
- Un client peut modifier le total affiché dans son navigateur : ton équipe doit **recalculer le total** à la réception du message.
