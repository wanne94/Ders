# Profile Menu Plan za Ulogovane Korisnike

## Pregled
Kreiranje kompletnog Profile menu-ja za sve ulogovane korisnike sa osnovnim funkcijama za upravljanje profilom i notifikacija settings.

## Analiza Postojeće Strukture

### Web Platform (Navigation.jsx)
- **Trenutna navigacija**: AppBar sa desktop/mobile drawer sistemom
- **Mesto za profil**: Između admin menija i logout dugmeta
- **Auth sistem**: localStorage sa getUserData() funkcijama

### Mobile Platform (BottomNavigation.js)  
- **Trenutna navigacija**: 5-tab bottom navigation + FAB Add menu
- **Mesto za profil**: "Moj profil" opcija u postojećem Add popup
- **Auth sistem**: AsyncStorage sa async helper funkcijama

### Postojeći Profile Sistem
- **Current**: `/profile/[type]/[id]` je za content profiles (lecture/daija/org)
- **Need**: Novi user profile sistem nezavisan od content profila

## Detaljni Implementation Plan

### 1. Backend API Endpoints
- [ ] **P1.1** GET `/api/users/profile` - current user info
- [ ] **P1.2** PUT `/api/users/profile` - update user info (email)
- [ ] **P1.3** POST `/api/users/change-password` - change password
- [ ] **P1.4** GET/PUT `/api/users/notification-preferences` - manage notifications
- [ ] **P1.5** POST/DELETE `/api/users/fcm-token` - manage push tokens

### 2. Web Frontend Implementation
- [ ] **P2.1** Dodaj "Profil" u Navigation.jsx (između admin i logout)
- [ ] **P2.2** Kreiraj `/pages/profile.js` - main user profile page
- [ ] **P2.3** Kreiraj `ProfileInfo` komponentu - basic user display
- [ ] **P2.4** Kreiraj `ProfileSettings` komponentu - email change
- [ ] **P2.5** Kreiraj `ChangePassword` komponentu - password update
- [ ] **P2.6** Kreiraj `NotificationSettings` komponentu - notification toggle
- [ ] **P2.7** Integriši Firebase web messaging za push notifications

### 3. Mobile Frontend Implementation
- [ ] **P3.1** Dodaj "Moj profil" u AddContentPopup.js opcije
- [ ] **P3.2** Kreiraj `ProfileScreen.js` - main mobile profile screen
- [ ] **P3.3** Kreiraj profile sub-screens za settings
- [ ] **P3.4** Kreiraj `NotificationSettingsScreen.js` - mobile notification toggle
- [ ] **P3.5** Kreiraj `ChangePasswordScreen.js` - mobile password update  
- [ ] **P3.6** Integriši Expo notifications za mobile push

### 4. Services Layer Integration
- [ ] **P4.1** Proširi `web/src/services/usersService.js` sa profile methods
- [ ] **P4.2** Proširi `mob/services/usersService.js` sa profile methods
- [ ] **P4.3** Dodaj notification preferences API calls
- [ ] **P4.4** Dodaj FCM token management API calls

### 5. Core Profile Features
- [ ] **P5.1** Display korisničke informacije (username, email, role, RID)
- [ ] **P5.2** **Email change** sa validation (za SVE korisnike: user, admin, super_admin)
- [ ] **P5.3** **Password change** sa current password verification (za SVE korisnike)
- [ ] **P5.4** **Notification preferences toggle** - enable/disable (za SVE korisnike, default: enabled)
- [ ] **P5.5** FCM token auto-registration on login
- [ ] **P5.6** Token cleanup on logout
- [ ] **P5.7** Role-specific profile sections (admins see their admin status)
- [ ] **P5.8** Validation da admini/super_admini mogu da mijenjaju svoje podatke

### 6. UI/UX Design Standards
- [ ] **P6.1** Material-UI consistent styling za web
- [ ] **P6.2** Native-looking design za mobile (React Native style)
- [ ] **P6.3** Responsive design za sve screen sizes
- [ ] **P6.4** Loading states i proper error handling
- [ ] **P6.5** Success feedback messages za sve akcije
- [ ] **P6.6** Konzistentni icons i color scheme

### 7. Integration & Testing
- [ ] **P7.1** Test navigation integration na web (desktop + mobile view)
- [ ] **P7.2** Test navigation integration na mobile app
- [ ] **P7.3** Test notification preference updates end-to-end
- [ ] **P7.4** Test password change functionality
- [ ] **P7.5** Test FCM token registration/removal cycle
- [ ] **P7.6** Test cross-platform consistency

## Implementation Strategy

### Faza 1: Backend Foundation (P1.1-P1.5)
Kreiranje svih potrebnih API endpoints-a za user profile management

### Faza 2: Web Integration (P2.1-P2.7)
Web navigacija i profile stranice sa kompletnom funkcionalnosti

### Faza 3: Mobile Integration (P3.1-P3.6)  
Mobile navigacija i profile screens sa native experience

### Faza 4: Services & Features (P4.1-P5.6)
API integration i kompletne profile features

### Faza 5: Polish & Testing (P6.1-P7.6)
UI polish, responsive design i comprehensive testing

## Key Design Decisions

### Navigation Placement
- **Web**: "Profil" stavka u main navigation između admin tools i logout
- **Mobile**: "Moj profil" kao opcija u postojećem Add FAB popup menu

### Profile Page Structure
- **Web**: `/profile.js` - dedicated user profile page
- **Mobile**: `ProfileScreen.js` - native mobile screen sa sub-screens

### Notification Integration
- **Default**: Notifikacije uključene za sve nove korisnike
- **Control**: Simple on/off toggle u profile settings
- **Cross-platform**: Firebase (web) + Expo (mobile) notification system

### Security Considerations
- **Password Change**: Requires current password verification
- **Email Change**: Validation i uniqueness check
- **Token Management**: Automatic cleanup i security

## Success Criteria

1. **✅ Navigation Access**: Profile dostupan iz main navigation na oba platform-a
2. **✅ Basic Info Display**: Username, email, role, RID prikazani
3. **✅ Settings Management**: Email/password change funkcionalnost
4. **✅ Notification Control**: Toggle za enable/disable push notifications
5. **✅ Cross-Platform**: Konzistentna funkcionalnost web i mobile
6. **✅ Security**: Proper validation i verification za sve changes
7. **✅ UX**: Smooth integration sa postojećim design language

## Expected User Flow (Svi Tipovi Korisnika)

### Osnovni Korisnik (role: 'user')
1. **Login** → FCM token auto-registered
2. **Navigate** → Click "Profil" u navigation  
3. **View Profile** → See username, email, RID, role
4. **Change Email** → Update email sa validation
5. **Change Password** → Update password sa current password verification
6. **Toggle Notifications** → Enable/disable push notifications
7. **Get Notifications** → Receive push notifications za nova predavanja (if enabled)

### Admin Korisnik (role: 'admin')  
1-7. **Iste funkcije kao osnovni korisnik** +
8. **Admin Status** → Vidi da je admin u profile info
9. **Notifikacije** → Prima admin-specific notifikacije ako potrebno

### Super Admin (role: 'super_admin')
1-8. **Iste funkcije kao admin** + 
9. **Super Admin Status** → Vidi da je super admin u profile info
10. **Full Control** → Kompletna kontrola nad svojim profilom

## Ključne Karakteristike za Sve Tipove Korisnika

### 🔧 **Email Change**
- **Ko**: Svi korisnici (user, admin, super_admin)
- **Validation**: Email format, uniqueness check
- **Security**: Current password required za confirmation

### 🔐 **Password Change** 
- **Ko**: Svi korisnici (user, admin, super_admin)
- **Security**: Current password + new password confirmation
- **Validation**: Password strength requirements

### 🔔 **Notification Toggle**
- **Ko**: Svi korisnici (user, admin, super_admin) 
- **Default**: Enabled za sve nove korisnike
- **Control**: Simple on/off switch u profile settings
- **Scope**: Controls push notifications za nova predavanja

### 👤 **Profile Display**
- **Basic Info**: Username, email, role badge, RID
- **Role-Specific**: Admin/Super Admin status clearly marked
- **Consistent**: Isti interface za sve tipove korisnika

Ovaj plan osigurava da **SVI korisnici** (uključujući admin i super_admin) imaju pristup osnovnim profile funkcijama: email change, password change, i notification control.