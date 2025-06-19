# Google Service Account Key - Instrukcije za kreiranje

## Koraci za kreiranje Service Account Key:

### 1. Google Cloud Console
1. Idi na: https://console.cloud.google.com/
2. Kreiraj novi projekat ili koristi postojeći
3. Omogući Google Play Android Developer API

### 2. Kreiraj Service Account
1. Idi na: **IAM & Admin** → **Service Accounts**
2. Klikni **CREATE SERVICE ACCOUNT**
3. Unesi detalje:
   - Service account name: `eas-submit-ders-app`
   - Service account ID: `eas-submit-ders-app`
   - Description: `Service account for EAS Submit to upload to Google Play`
4. Klikni **CREATE AND CONTINUE**

### 3. Dodeli ulogu (Grant Access)
- Preskoči ovaj korak (klikni **CONTINUE**)
- Završi kreiranje (klikni **DONE**)

### 4. Kreiraj JSON Key
1. Klikni na kreirani service account
2. Idi na **KEYS** tab
3. Klikni **ADD KEY** → **Create new key**
4. Izaberi **JSON** format
5. Klikni **CREATE**
6. JSON fajl će se automatski download-ovati

### 5. Google Play Console Setup
1. Idi na: https://play.google.com/console
2. Izaberi svoju aplikaciju
3. Idi na: **Setup** → **API access**
4. Klikni **Link** pored Google Cloud projekta
5. Pod **Service accounts**, pronađi tvoj service account
6. Klikni **Grant access**
7. Dodeli sledeće dozvole:
   - **Release management** (za upload)
   - **App access** → Izaberi tvoju aplikaciju
8. Klikni **Invite user**

### 6. Upload na EAS
1. Idi na: https://expo.dev/accounts/wanne/projects/ders-app/credentials
2. Pod **Google Service Account**, upload JSON fajl koji si download-ovao

## Važne napomene:
- Čuvaj JSON fajl na sigurnom mestu
- Nikad ne commit-uj ovaj fajl u Git
- Service account treba oko 30 minuta da se propagira nakon setup-a