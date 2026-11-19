# CANNOVA : sécurité, expliquée simplement

## Ce que le site fait déjà
- **Aucune base de données et aucun serveur à pirater** : le site est un ensemble de fichiers. Le panier et l'adresse restent dans le navigateur du client (sessionStorage, effacé à la fermeture de l'onglet). Les commandes ne passent que par WhatsApp ou Telegram, quand le client envoie lui-même son message. **Il n'y a donc aucun fichier client à voler sur le site.**
- **Aucun cookie** : pas de cookie publicitaire, pas de suivi. Il n'y a donc rien à voler « par cookies ».
- **En-têtes de sécurité** (fichier `vercel.json`, à déposer avec `index.html`) : interdit les scripts venant d'ailleurs que ton site et cdnjs (protection contre l'injection de code), interdit d'afficher ton site dans le cadre d'un autre site (anti-clickjacking), force HTTPS, bloque caméra, micro et géolocalisation, réduit les informations envoyées aux sites tiers.
- **Formulaire d'adresse** : longueurs maximales, format du téléphone vérifié, caractères dangereux retirés, champ piège invisible contre les robots, délai minimum de 2 secondes entre deux envois.
- **Panier** : à chaque affichage, les prix et les grammages sont recalculés à partir du catalogue, de sorte qu'un client qui modifierait le panier dans son navigateur ne peut pas changer un prix. Quantité limitée à 20 par produit et 20 lignes.
- **Message de commande** limité à 1 500 caractères.

## « 1 000 visiteurs en même temps »
Le site est servi par le réseau de Vercel (CDN) : des fichiers statiques sont distribués à des milliers de visiteurs sans effort, et c'est le téléphone du visiteur qui fait les calculs de l'animation 3D. Pour ne pas surcharger les appareils modestes, le fond 3D se réduit automatiquement sur les petits téléphones et les appareils à 4 cœurs ou moins. Les photos sont mises en cache 24 heures.

## Ce qu'il reste à faire de ton côté (10 minutes)
1. **Active la double authentification (2FA)** sur ton compte GitHub **et** sur ton compte Vercel. C'est la protection la plus importante : la majorité des piratages de sites viennent d'un compte volé, pas du code.
2. Utilise des **mots de passe longs et uniques** (gestionnaire de mots de passe).
3. Sur Vercel, dans le projet : **Settings, Firewall** : active le mode « Attack Challenge Mode » en cas d'attaque, et ajoute une règle de limitation de débit si ton offre le permet.
4. Sur GitHub, dépôt privé si possible, et ne mets **jamais** de mot de passe ou de clé dans les fichiers.
5. Quand tu auras un nom de domaine : active HTTPS (automatique sur Vercel) et garde le renouvellement automatique du domaine.
6. Garde une **copie du dossier** sur ton ordinateur (sauvegarde).
7. Pour les téléphones de ton équipe, protège WhatsApp et Telegram par une vérification en deux étapes.

## Les limites, honnêtement
- **Aucun site n'est « inpiratable » à 100 %.** Personne ne peut le garantir. Ce qui est en place réduit fortement les risques courants.
- **Je ne peux pas intégrer un « antivirus »** dans le site : ça n'existe pas pour un site statique. L'équivalent, c'est la liste d'autorisations des scripts (CSP) et les protections du compte d'hébergement.
- **Le site charge three.js depuis cdnjs** : si cdnjs était compromis, c'est un risque rare mais réel. Pour le supprimer, héberge toi-même le fichier three.js (r128) dans ton dossier.
- La politique CSP autorise les scripts écrits dans la page (`unsafe-inline`), car le site est un seul fichier. Une version plus stricte demande de séparer le JavaScript dans des fichiers.
- **WhatsApp et Telegram** sont des services tiers : la sécurité des conversations dépend d'eux et de tes téléphones.
- **Les données de tes clients dans tes propres conversations** (adresses, téléphones) sont à protéger : verrouille tes appareils, ne les partage pas, supprime-les quand tu n'en as plus besoin (RGPD).
