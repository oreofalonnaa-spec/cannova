# Mise en route du serveur (codes de réduction, statistiques, espace admin)

Le site public fonctionne seul. Pour activer **l'espace admin, les codes de réduction et le tableau de bord**, il faut brancher deux services gratuits. Compte environ **20 minutes**.

## Ce dont tu as besoin
1. Le projet complet sur GitHub, avec à la racine : `index.html`, `vercel.json`, `package.json`, les dossiers `api`, `admin`, `images`, `marketing`. **Dépose bien tous ces éléments.**
2. Un projet Vercel relié à ce dépôt (Framework Preset : « Other », aucune commande de build).
3. Une **base Upstash Redis** (stocke les codes et les compteurs, aucune donnée client).
4. Un compte **Resend** (envoie le code de connexion à ton e-mail).

## Étape 1 : la base de données
1. Dans ton projet Vercel, ouvre **Storage** (ou Marketplace), cherche **Upstash Redis**, crée une base gratuite et **connecte-la au projet**.
2. Vercel ajoute les variables `KV_REST_API_URL` et `KV_REST_API_TOKEN` (ou `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN`). Le code accepte les deux.

## Étape 2 : l'e-mail de connexion
1. Crée un compte sur **resend.com avec l'adresse oreofalonnaa@gmail.com**.
2. Crée une clé API (API Keys).
3. Avec l'expéditeur par défaut (`onboarding@resend.dev`), Resend n'envoie qu'à l'adresse du compte : c'est exactement ce qu'il te faut.

## Étape 3 : les variables dans Vercel
Dans ton projet : **Settings, Environment Variables**, ajoute :
| Nom | Valeur |
|---|---|
| `ADMIN_EMAIL` | `oreofalonnaa@gmail.com` (facultatif : c'est déjà l'adresse par défaut) |
| `SESSION_SECRET` (recommandé ; si absent, le serveur en dérive une des clés Upstash et Resend) | une longue chaîne aléatoire (au moins 40 caractères). Génère-la avec un gestionnaire de mots de passe, ou dans un terminal : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `RESEND_API_KEY` | la clé Resend |

Puis **redéploie** (Deployments, les trois points, Redeploy) : les variables ne s'appliquent qu'aux nouveaux déploiements.

## Étape 4 : premier test
1. Va sur `https://ton-site.vercel.app/admin`.
2. Saisis `oreofalonnaa@gmail.com` : un code à 6 chiffres arrive par e-mail (vérifie les spams).
3. Entre le code : le tableau de bord s'ouvre. Crée ton code : **fvvlone, 15 %**.
4. Sur le site, ajoute un produit au panier, arrive à l'étape « code » et teste `fvvlone`.
5. Reviens sur `/admin` : les visites et les clics apparaissent.

## Comment ça te protège
- **Un seul e-mail autorisé.** Toute autre adresse est refusée, **renvoyée vers la page d'accueil** et enregistrée. Au bout de 3 tentatives, l'appareil (adresse IP) est bloqué pendant 1 heure.
- Le code à usage unique expire au bout de 10 minutes et ne marche qu'une fois (5 essais maximum).
- La session est dans un cookie réservé au serveur (HttpOnly, Secure, SameSite=Strict) et dure 8 heures.
- Les codes de réduction sont **vérifiés par le serveur**, pas dans la page : on ne peut plus les voir ni les deviner en ouvrant le code du site (20 essais maximum toutes les 10 minutes par appareil).

## Limites à connaître
- La sécurité de l'espace admin **dépend de ton compte Gmail** : active la **vérification en deux étapes sur Gmail**. Quelqu'un qui entre dans ta boîte mail peut se connecter.
- Un client peut toujours modifier le total affiché dans son propre navigateur. **Ton équipe doit recalculer le total à la réception du message** : le message contient le code utilisé, et `/admin` te montre le pourcentage de chaque code.
- **Les quotas gratuits** d'Upstash et de Resend sont limités. Si le quota est dépassé, le site continue de fonctionner : les codes et le suivi s'arrêtent simplement. Compte environ 10 commandes de base de données par visite.
- Ce code a été testé ici avec une base simulée (connexion, blocage, codes, compteurs : tout passe). Il n'a pas pu être testé avec de vrais services : fais les tests de l'étape 4 avant de t'en servir.

## Dépannage : le message « Configuration manquante »
Depuis cette version, le message **te dit ce qui manque**. Par exemple : « Configuration manquante : RESEND_API_KEY ; SESSION_SECRET ».
1. **Les variables sont dans le bon projet ?** Vercel, ton projet, Settings, Environment Variables.
2. **Orthographe exacte** des noms, en majuscules, sans espace ni guillemets (`RESEND_API_KEY`, pas `Resend_Api_Key`).
3. **La case « Production » est cochée** pour chaque variable (cochées toutes les trois cases : Production, Preview, Development).
4. **Tu as redéployé après les avoir ajoutées** : Deployments, les trois points du dernier déploiement, Redeploy. Sans cela, le site ne voit pas les nouvelles variables. C'est la cause la plus fréquente.
5. **La base Upstash est connectée au projet** : Storage doit montrer la base reliée à ce projet. Elle ajoute ses propres variables.
6. Autres messages :
   - « Resend a refusé l'envoi (erreur 403 ou 422) » : la clé est fausse ou ton compte Resend n'utilise pas oreofalonnaa@gmail.com.
   - « Base de données injoignable » : la connexion Upstash est cassée, reconnecte-la.
   - « Trop de demandes » : attends 15 minutes.
