# ParkEasy – Parking App Prototype

**Technology:** Node.js + Expo/React Native  
**Course:** Mobile Device Programming – FIEK  
**Group:** [Numri i Grupit]  

---

## Anëtarët e Grupit
- Arila Behrami  
- Edonita Gashi  
- Erza Duraku  
- Engji Osmani  
- Albi Kallaba  
- Fatlinda Osdautaj  

---

## Përshkrimi i Projektit
ParkEasy është një prototip i aplikacionit mobil për menaxhimin e parkingjeve. Ky projekt u zhvillua nga studentët e vitit të tretë të Inxhinierisë Kompjuterike në FIEK. Aplikacioni demonstron navigimin ndërmjet ekranëve, kërkimin dhe ruajtjen e vendndodhjeve të parkingjeve të preferuara, si dhe menaxhimin e profilit të përdoruesit.  

Ky prototip aktualisht nuk është i lidhur me një bazë të dhënash, por demonstron funksionalitetin e UI dhe navigimin ndër ekranet.  

---

## Funksionalitetet Kryesore

### 1. Autentifikimi (Firebase Authentication)
- Mbështet të paktën 2 metoda login-i:
  - Email / Password  
  - Google, GitHub, Facebook ose metoda të tjera nga Firebase  
- Validim i inputeve gjatë regjistrimit dhe hyrjes  
- Ridrejtim tek ekrani kryesor (Home) pas login  
- Logout i përdoruesit  

### 2. CRUD me Firebase Firestore
- Shtimi i të dhënave të reja  
- Leximi dhe shfaqja e listës së të dhënave  
- Përditësimi ose fshirja e një elementi  
- Përdorimi i `useEffect` dhe `useState` për menaxhimin e gjendjeve  
- Trajtimi i gjendjeve `loading`, `error`, dhe `success`  

### 3. API e Jashtme (opsionale)
- Mund të integrohet një API publike për të marrë të dhëna shtesë, për shembull:
  - OpenWeatherMap (moti)  
  - TheMealDB (ushqim)  
  - RandomUser / JSONPlaceholder (të dhëna testuese)  

### 4. Navigimi dhe UI
- Navigim i plotë me **Expo Router**  
- UI e përmirësuar krahasuar me Fazën I (ngjyra, layout, përputhshmëri)  
- Strukturë e organizuar e projektit:
  - `/app` – për ekranet  
  - `/components` – për komponentët e ripërdorshëm  
  - `/firebase` – konfigurimi i Firebase  
  - `/assets` – imazhet dhe ikonat  

---

## Sekcionet Kryesore të Aplikacionit
1. **Nearby** – Shfaq një hartë me vendet e parkingut pranë  
2. **Search** – Kërkoni vendet e parkingut sipas emrit ose lokacionit  
3. **Favorites** – Ruani vendet e preferuara për qasje të shpejtë  
4. **Profile** – Informacion për përdoruesin dhe opsione të tjera (Settings, Help, About Us)  

---

## Si të Ekzekutohet Prototipi
1. Klononi repository-n:
   ```bash
   git clone https://github.com/edonitagashi/ParkEasy.git


Shkoni në folder-in e projektit:

cd ParkEasy


Instaloni varësitë:

npm install


Start aplikacionin me Expo:

npx expo start