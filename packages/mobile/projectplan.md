# Plan za detaljnu analizu i poređenje funkcionalnosti mobilne vs web aplikacije

## Cilj
Izvršiti detaljnu analizu i identifikovati konkretne razlike u funkcionalnostima između mobilne (mob/) i web (web/) aplikacije, sa fokusom na funkcionalnosti koje postoje u jednoj ali ne u drugoj aplikaciji.

## Todo lista

- [ ] **1. Analiza navigacije i meni strukture**
  - Čitanje mob/components/Menu.js
  - Čitanje mob/navigation/AppNavigator.js
  - Čitanje web/src/components/Navigation.jsx
  - Čitanje web/src/components/DashSidebar.jsx
  - Identifikovanje razlika u dostupnim opcijama i strukturi menija

- [ ] **2. Analiza pretraživanja i filtriranja**
  - Čitanje mob/screens/HomeScreen.js za search funkcionalnost
  - Čitanje web/src/pages/index.jsx i web/src/pages/predavanja.jsx
  - Čitanje web/src/components/SearchBar.jsx
  - Čitanje web/src/components/AdvancedFilters.jsx
  - Identifikovanje razlika u filterima između aplikacija

- [ ] **3. Analiza prikaza predavanja**
  - Čitanje mob/components/UniverzalCard.js
  - Čitanje web/src/components/UniversalCard.jsx
  - Uporedba funkcionalnosti (share, bookmark, cancel report, etc.)

- [ ] **4. Analiza user/admin management**
  - Čitanje mob/screens/ProfileScreen.js
  - Pretraživanje mob/screens/AdminPanel.js (ako postoji)
  - Čitanje web/src/pages/profile.jsx
  - Čitanje web/src/pages/dashboard/ strukture
  - Provjera admin funkcionalnosti i role-based pristup

- [ ] **5. Analiza statistika**
  - Pretraživanje mob/screens/StatisticsScreen.js
  - Čitanje web/src/components/SimplifiedStatistics.jsx
  - Čitanje web/src/components/EnhancedStatistics.jsx
  - Identifikovanje razlika u dostupnim statistikama

- [ ] **6. Kreiranje konkretan izvještaj**
  - Tačna imena funkcionalnosti koje nedostaju
  - Fajlovi gdje se nalaze
  - Prioriteti za implementaciju

## Review sekcija
*Biće dopunjena nakon završetka analize*