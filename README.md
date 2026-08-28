# DUY-ดู-DEE — Firebase Movie CMS

## Requirements
- Node.js 20+ (Node 22 LTS recommended)
- Firebase CLI
- Firebase project `duydodeesport`

## 1. Install
```bash
npm install
```

## 2. Firebase login
```bash
npx firebase login
npx firebase use duydodeesport
```

## 3. Enable Firebase Authentication
Firebase Console → Authentication → Sign-in method → Email/Password → Enable.

## 4. Deploy database rules/indexes
```bash
npx firebase deploy --only firestore:rules,firestore:indexes
```

## 5. Seed genres/settings
Create a Firebase service account with appropriate Admin SDK access and save it OUTSIDE the project.
Then:

Windows PowerShell:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\duydodeesport-service-account.json"
npm run seed
```

macOS/Linux:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/secure/duydodeesport-service-account.json"
npm run seed
```

## 6. Create an admin
First register a normal account from the website, then:

```bash
npm run set-admin -- admin@example.com
```

Sign out and sign in again.

## 7. Run locally
```bash
npm run dev
```

Open the Vite URL shown in terminal.

## 8. Build
```bash
npm run build
```

## 9. Deploy Hosting
```bash
npx firebase deploy --only hosting
```

or:
```bash
npm run deploy
```

## Database
- movies
- movies/{movieId}/sources
- series
- series/{seriesId}/episodes
- series/{seriesId}/episodes/{episodeId}/sources
- genres
- countries
- users
- users/{uid}/favorites
- users/{uid}/watch_history
- comments
- ratings
- homepage_sections
- settings
- admins
- activity_logs

## Video URLs
Store only video/embed URLs you are authorized to publish or embed.
