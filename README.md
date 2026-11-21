# CANNOVA : guide du site (version USA)

## Contenu du dossier
```
index.html                      <- le site (HTML + CSS + JavaScript)
images/
  fleurs-usa/<slug-du-produit>/carte.jpg + detail.jpg
  resine-usa/<slug-du-produit>/carte.jpg + detail.jpg
vercel.json  package.json       <- en-têtes de sécurité et configuration (à déposer à la racine)
api/                            <- serveur : codes de réduction, statistiques, connexion admin
admin/index.html                <- espace admin et tableau de bord (adresse /admin)
marketing/                      <- visuels de campagne (SVG) et plan marketing
SETUP-BACKEND.md                <- mise en route du serveur (à lire en premier)
SECURITE.md                     <- guide de sécurité
index-autonome.html             <- version "fichier unique" (photos intégrées)
```

## Parcours du site
Découvrir la sélection > Fleurs ou Résine (ou Demande spéciale) > **catalogue directement** > fiche produit > panier > **choix du style de boîte (Cali, Atlas, Angel, Muzo)** > **code de réduction (oui / non)** > adresse > WhatsApp ou Telegram. Le style choisi figure dans le message de commande.
Il n'y a plus de choix de pays : seule l'origine USA est proposée. Les anciennes adresses (par exemple `#fleurs-maroc`) renvoient vers le catalogue USA.

## Ajouter un produit
1. Dans `index.html`, cherche `CAT['fleurs-usa'].push(` et copie un bloc existant (ou ajoute-le dans `CAT['resine-usa']`) :
```js
CAT['fleurs-usa'].push({
  slug:'mon-produit',                      // sans accent, sans espace, en minuscules
  name:'Mon Produit',
  desc:'À partir de 12,90 €',
  text:'Description sobre (aspect, arôme).',
  info:[['Catégorie','Fleurs'],['Origine','USA']],
  prices:[[5,12.90],[10,22.90],[20,39.90]]  // [grammes, prix total en €]
});
```
2. Crée `images/fleurs-usa/mon-produit/` avec `carte.jpg` et `detail.jpg` (800 x 800 px conseillé, minuscules, extension .jpg).
3. Republie.

## Republier sur Vercel
- **GitHub** : Add file > Upload files, dépose `index.html` (et le dossier `images` si tu utilises le dossier), Commit changes. Vercel republie en une minute (vérifie « Ready » dans Deployments), puis Ctrl+Maj+R.
- **Un seul fichier** : dépose `index-autonome.html` renommé `index.html` : les photos y sont intégrées.
- **Si une photo ne s'affiche pas** : teste `https://ton-site.vercel.app/images/fleurs-usa/cali-gelato/carte.jpg`. Une page 404 veut dire que le dossier `images` n'est pas arrivé ou n'est pas à côté de `index.html`.

## À modifier avant la mise en ligne
| Quoi | Où |
|---|---|
| WhatsApp et Telegram | `TEAM={wa:'33646595261',tg:'cannovc'}` |
| Livraison gratuite dès 49 € | chercher `49` |
| Couleurs | `:root{--bg,--lime,--n2,--n3,--n4,--holo}` |

## Conformité
- Taux de THC inférieur à 0,3 % pour le CBD en France : garde l'analyse de laboratoire de chaque lot.
- Aucune promesse d'effet ni mention médicale sur le site.
- Seulement de vrais avis, avec l'accord des clients.
- Ajoute les mentions légales, CGV et politique de confidentialité (liens du pied de page vides).

## Pages légales
Les pages Mentions légales, CGV et Confidentialité sont dans le site (liens du pied de page). **Les zones surlignées en vert, entre crochets, sont à compléter** (nom de l'entreprise, SIRET, adresse, médiateur, durées, modes de paiement...). Cherche `var LG=` dans `index.html`. Ce sont des modèles : fais-les relire par un juriste avant la mise en ligne.

## Sécurité
Dépose **`vercel.json` à côté de `index.html`** (racine du dépôt) pour activer les en-têtes de sécurité. Lis `SECURITE.md`.

## Codes de réduction
Les codes sont gérés dans `/admin` (création, pourcentage de 1 à 50 %, nombre d'usages maximum, date d'expiration, suppression). Ils sont vérifiés par le serveur. Le parcours : panier, choix de la boîte, **code de réduction (oui ou non)**, adresse, WhatsApp ou Telegram. Lis `SETUP-BACKEND.md` pour activer le serveur.

