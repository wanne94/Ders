# 📱 iOS Build Opcije - Detaljna Analiza

## 🎯 Pregled Svih Opcija za iOS Distribuciju

### **1. LOKALNI BUILD (Bez Expo/EAS) ✅ PREPORUČENO**

#### **Prednosti:**
- ✅ Potpuna kontrola nad build procesom
- ✅ Nema dependency na external servise
- ✅ Besplatno (osim Apple Developer licence)
- ✅ Brže za male izmjene
- ✅ Možeš debugovati build probleme
- ✅ Direktan pristup Xcode features

#### **Nedostaci:**
- ❌ Zahtijeva Mac računar
- ❌ Zahtijeva Xcode instalaciju (~15GB)
- ❌ Manual setup certifikata
- ❌ Teže za CI/CD

#### **Kako koristiti:**
```bash
cd mob
./build-ios-appstore.sh
```

---

### **2. EAS BUILD (Expo Application Services)**

#### **Prednosti:**
- ✅ Ne treba Mac računar
- ✅ Automatski upravlja certifikatima
- ✅ Cloud-based build
- ✅ Integrisana CI/CD

#### **Nedostaci:**
- ❌ Ograničen broj besplatnih build-ova
- ❌ Dependency na Expo servise
- ❌ Sporije za male izmjene
- ❌ Košta za production usage

#### **Kako koristiti:**
```bash
eas build --platform ios --profile production
```

---

### **3. XCODE MANUAL BUILD**

#### **Prednosti:**
- ✅ GUI interface
- ✅ Visual debugging
- ✅ Direktna integracija sa App Store Connect

#### **Nedostaci:**
- ❌ Manual proces
- ❌ Ne može se automatizovati
- ❌ Prone to human error

#### **Kako koristiti:**
1. Open `ios/Ders.xcworkspace`
2. Product → Archive
3. Window → Organizer → Distribute App

---

## 📊 Poređenje Build Tipova

| Feature | Lokalni Script | EAS | Xcode Manual |
|---------|---------------|-----|--------------|
| **Potreban Mac** | ✅ Da | ❌ Ne | ✅ Da |
| **Automatizacija** | ✅ Potpuna | ✅ Potpuna | ❌ Manual |
| **Cijena** | Free | $$ | Free |
| **Brzina** | ⚡ Brzo | 🐢 Sporo | 🐢 Sporo |
| **Kontrola** | 100% | 50% | 100% |
| **CI/CD** | ⚠️ Moguće | ✅ Built-in | ❌ Ne |

---

## 🔐 Signing Opcije

### **1. Automatic Signing (Preporučeno)**
```xml
<key>signingStyle</key>
<string>automatic</string>
```
- Xcode automatski kreira provisioning profiles
- Najlakše za početak

### **2. Manual Signing**
```xml
<key>signingStyle</key>
<string>manual</string>
<key>provisioningProfiles</key>
<dict>
    <key>com.daije.mobile</key>
    <string>YOUR_PROFILE_UUID</string>
</dict>
```
- Potpuna kontrola
- Potrebno za enterprise distribuciju

---

## 📦 Export Metode

### **1. App Store Connect** 
```xml
<key>method</key>
<string>app-store-connect</string>
```
- Za upload na App Store
- Koristi Transporter ili Xcode

### **2. Ad Hoc**
```xml
<key>method</key>
<string>ad-hoc</string>
```
- Za testiranje na registrovanim uređajima
- Do 100 uređaja

### **3. Enterprise**
```xml
<key>method</key>
<string>enterprise</string>
```
- Za internu distribuciju u kompaniji
- Zahtijeva Enterprise licencu ($299/god)

### **4. Development**
```xml
<key>method</key>
<string>development</string>
```
- Za debug i testing
- Samo na povezanim uređajima

---

## 🚀 Produkcijski Workflow

### **OPCIJA A: Potpuno Automatizovan Lokalni Build**

```bash
# 1. Pripremi environment
export NODE_ENV=production
export EXPO_ENV=production

# 2. Pokreni build script
./build-ios-appstore.sh

# 3. Upload preko Transporter
# IPA će biti u: ios/build/AppStore/Ders.ipa
```

### **OPCIJA B: Polu-automatizovan sa Xcode**

```bash
# 1. Build arhivu
xcodebuild -workspace ios/Ders.xcworkspace \
    -scheme Ders \
    -configuration Release \
    -archivePath ios/build/Ders.xcarchive \
    archive

# 2. Export kroz Xcode UI
open ios/build/Ders.xcarchive
# Window → Organizer → Distribute App
```

### **OPCIJA C: CI/CD Pipeline**

```yaml
# GitHub Actions example
- name: Build iOS
  run: |
    cd mob
    ./build-ios-appstore.sh
    
- name: Upload to App Store
  run: |
    xcrun altool --upload-app \
      -f ios/build/AppStore/Ders.ipa \
      -u ${{ secrets.APPLE_ID }} \
      -p ${{ secrets.APP_PASSWORD }}
```

---

## 📱 Upload Metode

### **1. Transporter App (Najlakši)**
1. Download sa Mac App Store
2. Drag & drop IPA
3. Click "Deliver"

### **2. Xcode Organizer**
1. Window → Organizer
2. Select archive
3. Distribute App → App Store Connect

### **3. Command Line (altool)**
```bash
xcrun altool --upload-app \
  -f ios/build/AppStore/Ders.ipa \
  -u YOUR_APPLE_ID \
  -p APP_SPECIFIC_PASSWORD
```

### **4. Fastlane (Advanced)**
```ruby
lane :upload do
  deliver(
    ipa: "ios/build/AppStore/Ders.ipa",
    skip_metadata: true,
    skip_screenshots: true
  )
end
```

---

## ⚙️ Trenutna Konfiguracija

- **Bundle ID:** `com.daije.mobile`
- **Team ID:** `9Y9WRB4KLV`
- **Version:** 1.1.6
- **Build:** 1
- **Min iOS:** 15.1
- **Signing:** Apple Development (Avdo Hasanovic)

---

## 🎯 Preporuka

Za tvoj slučaj, **preporučujem OPCIJU A** - lokalni automatizovan build:

1. **Pokreni build:**
   ```bash
   cd mob
   ./build-ios-appstore.sh
   ```

2. **Upload preko Transporter:**
   - Otvori Transporter
   - Drag IPA fajl: `ios/build/AppStore/Ders.ipa`
   - Click "Deliver"

3. **Konfiguriši na App Store Connect:**
   - Idi na https://appstoreconnect.apple.com
   - Dodaj screenshots, opise, itd.
   - Submit for review

---

## ❓ FAQ

**Q: Trebam li Distribution certifikat?**
A: Za App Store da, ali Xcode može automatski kreirati sa automatic signing.

**Q: Mogu li testirati bez Apple Developer Account?**
A: Možeš na simulatoru, ali ne na pravom uređaju za production.

**Q: Koliko traje build?**
A: Prvi put 10-15 min, kasnije 3-5 min.

**Q: Mogu li automatizovati cijeli proces?**
A: Da, koristi CI/CD sa GitHub Actions ili Fastlane.

---

## 🔧 Troubleshooting

### Problem: "No signing certificate"
```bash
# Otvori Xcode i sign in
open ios/Ders.xcworkspace
# Xcode → Preferences → Accounts → Add Apple ID
```

### Problem: "Profile doesn't match"
```bash
# Refresh profiles
xcodebuild -allowProvisioningUpdates
```

### Problem: "Archive failed"
```bash
# Clean build folder
rm -rf ~/Library/Developer/Xcode/DerivedData
# Retry build
```