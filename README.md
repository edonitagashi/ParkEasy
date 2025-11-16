# Phase 1 – ParkEasy – Parking App Prototype

**Technology:** Node.js + Expo/React Native  

This project, developed by third-year Computer Engineering students at FIEK, is a prototype of a mobile parking management app. It provides screen views for navigation between locations, searching for parking spots, saving favorite spots, and managing the user profile for now.

## Developed by
- Arila Behrami  
- Edonita Gashi  
- Erza Duraku  
- Engji Osmani  
- Albi Kallaba  
- Fatlinda Osdautaj  

## Clone the Repository
```bash
git clone https://github.com/edonitagashi/ParkEasy.git 
```

## Project Description

ParkEasy is a mobile app prototype built using Node.js and Expo/React Native. Currently, it does **not** connect to a database (e.g., Firebase) but demonstrates the UI and screen navigation.

The app features four main sections in a tab bar:

- **Nearby** – Displays a map with nearby parking spots.  
- **Search** – Allows users to search for specific parking spots.  
- **Favorites** – Saves frequently used or favorite parking spots.  
- **Profile** – Shows user information and additional options like Settings, Help, About Us.  

## Key Functionalities

- **Nearby Map:** Display of parking spots on a map with the option to save locations.  
- **Search Parking:** Search for parking spots by name or location.  
- **Favorites:** List of favorite parking spots for easy access.  
- **Profile Management:** View user information and access additional options (Settings, Help, About Us).  
- **Navigation:** Tab bar allows quick switching between the four main sections.  

## How to Run the Prototype

1. **Clone the repository:**
```bash
git clone https://github.com/edonitagashi/ParkEasy.git
```
2. **Install the dependencies:**
```bash
cd ParkEasy
npm install
```
3. **Start the app using Expo:**
```bash
npx expo start
```
## QR Code
![QR Code](assets/qrcode.png)

## Screenshots

<p align="center">
  <img src="assets/foto1.jpg" alt="Foto 1" width="200"/>
  <img src="assets/foto2.png" alt="Foto 2" width="200"/>
  <img src="assets/foto3.png" alt="Foto 3" width="200"/>
  <img src="assets/foto4.jpg" alt="Foto 4" width="200"/>
  <img src="assets/foto5.jpg" alt="Foto 5" width="200"/>
  <img src="assets/foto6.jpg" alt="Foto 6" width="200"/>
  <img src="assets/foto7.jpg" alt="Foto 7" width="200"/>
</p>



## Conclusion

This is the initial prototype of the parking management app, developed in accordance with the requirements of the first phase of the “Mobile Device Programming” course project, demonstrating screen navigation, saving preferences, and map integration without a backend or database connection.



# Phase 2 – Functional Version with Firebase Integration

In the second phase of the project, the ParkEasy application is expanded into a fully functional system by integrating Firebase Authentication and Firestore Database. Users can now create accounts, log in, reserve parking spots, manage their bookings, save favorites, and interact with real-time data. Additionally, the system introduces role-based functionality for Admins and Owners.

**Technology:** Node.js + Expo/React Native + Firebase (Auth & Firestore)

This version includes complete backend integration, real data operations, and improved UI/UX compared to Phase 1.


## Key Functionalities
1. **Authentication** (Firebase Authentication)

**The app implements secure authentication with two methods**:
-Email / Password Login
-Google Login (GoogleAuthProvider)
-User inputs are validated during registration and login. After successful authentication, users are redirected based on their role:
-User → Nearby screen
-Owner → Owner Home screen
-Admin → Admin Dashboard
-Logout functionality is also provided in the Profile screens.


2.**CRUD with Firestore** (Create, Read, Update, Delete)

The app uses Cloud Firestore as its main database, enabling full CRUD for dynamic data.
Users

Users can update their profile information

-User roles are stored in /users/{uid}
-Bookings (User)
-Create booking → BookParkingScreen
-View bookings in real time → BookingsScreen
-Update booking → EditBookingScreen
-Delete booking → Firestore delete function
-Favorites
-Managed through /favorites/{uid}
-Users can save/remove parking spots
-Real-time updates using onSnapshot
-Optimistic UI for instant changes

Parkings (Admin + Owner)
-Admin can view, edit, or delete parkings
-Owner can edit their own parking information
-When an owner request is approved, a parking is automatically created
-Owner Requests
-Users can apply to become parking owners
-Admin can approve or reject requests
-Approved requests create a new parking in Firestore

3.**External API**(Optional Feature)


## Screenshots
<p align="center">
  <img src="assets/Foto1.1.jpg" alt="Foto 1.1" width="200"/>
  <img src="assets/Foto1.2.jpg" alt="Foto 1.2" width="200"/>
  <img src="assets/Foto1.3.jpg" alt="Foto 1.3" width="200"/>
  <img src="assets/Foto1.4.jpg" alt="Foto 1.4" width="200"/>
  <img src="assets/Foto1.5.jpg" alt="Foto 1.5" width="200"/>
  <img src="assets/Foto1.6.jpg" alt="Foto 1.6" width="200"/>
  <img src="assets/Foto1.7.jpg" alt="Foto 1.7" width="200"/>
  <img src="assets/Foto1.8.jpg" alt="Foto 1.8" width="200"/>
  <img src="assets/Foto1.9.jpg" alt="Foto 1.9" width="200"/>
  <img src="assets/Foto1.10.jpg" alt="Foto 1.10" width="200"/>
  <img src="assets/Foto1.11.jpg" alt="Foto 1.11" width="200"/>
  <img src="assets/Foto1.12.jpg" alt="Foto 1.12" width="200"/>
  <img src="assets/Foto1.13.jpg" alt="Foto 1.13" width="200"/>
  <img src="assets/Foto1.14.jpg" alt="Foto 1.14" width="200"/>
  <img src="assets/Foto1.15.jpg" alt="Foto 1.15" width="200"/>
  <img src="assets/Foto1.16.jpg" alt="Foto 1.16" width="200"/>
</p>


## Conclusion

Phase 2 upgrades ParkEasy from a basic UI prototype into a fully functional, data-driven application. With Firebase Authentication, real-time Firestore CRUD, role-based access, and an improved UI, the app now delivers complete booking, favorites, and parking management features for users, owners, and admins. All core requirements of the second project phase are successfully implemented.