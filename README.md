# Project Name
2800-202510-BBY24 - StudyNav

## Overview
StudyNav is a web application designed to connect students for productive study sessions. The application solves the problem of finding compatible study partners by matching users based on location, courses, and availability.

---

# About Us
Team Name: BBY 24
Team Members:

- Nikolas Rose
- Aarushi Sharma 
- Berenice Jean-Louis
- Jonathan Yeh Set 
- Carl Manansala Set 


---

## Features

### Core Functionality
- **User Authentication**: Secure login/signup for students and administrators
- **Study Session Coordination**: Create and join study sessions with geolocation
- **Real-time Chat**: Instant messaging between study partners
- **User Profiles**: Personalized accounts for students and administrators
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Interactive Map**: Visual interface for finding study locations

### User Types
- **Students**:
  - Create and join study sessions
  - Chat with other students
  - View and edit personal profiles
- **Administrators**:
  - Manage user accounts
  - Oversee study sessions
  - Access administrative tools

---

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, EJS, Bootstrap
- **Backend**: Node.js, Express.js, Socket.io( for real-time chat)
- **Database**: MongoDB 
- **Source Control**: SourceTree, GitHub, P4Merge
- **API**: OpenWeatherMap API, Open AI API
- **Hosting** : Render

---

## Installation and Setup

### Prerequisites:
1. **Node.js and npm**: Ensure you have Node.js (v14 or later) installed, which includes npm.
   - Verify installation:
     ```
     node -v
     npm -v
     ```
   - If not installed, download from [nodejs.org](https://nodejs.org/)

2. **MongoDB Account**: You'll need a MongoDB Atlas account or local MongoDB instance.

### Setup Instructions:
1. Clone the repository:
   ```
   git clone https://github.com/NikR-Os/2800-202510-BBY24
   cd 2800-202510-BBY24 
   ```
2. Install dependencies:

```
npm install 
```
3. Create a .env file in the project root with the following variables:
     ```
    MONGO_URI = mongo_uri_here
    OPENAI_API_KEY=your_openai_api_key
    PORT=8000
    ```
4.  Go to the directory where the repo is and write:
    ``` node backend/server.js```

5. Access the application at http://localhost:8000


---

## Project Structure

```
2800-202510-BBY24/
├── .env
├── .gitignore
├── 404.html
├── about.html
├── admin_profile.html
├── adminMain.html
├── index.html
├── login.html
├── main.html
├── navbar.html
├── package-lock.json
├── package.json
├── README.md
├── setting.html
├── student_profile.html
├── template.html
├── test.md
│
├── backend/
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Program.js
│   │   ├── Session.js
│   │   ├── Student.js
│   │   └── User.js
│   ├── ai.js
│   └── server.js
│
├── favicon/
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon.ico
│   └── site.webmanifest
│
├── images/
│   ├── AM01.jpg
│   ├── BBY01.jpg
│   ├── BBV01.jpg
│   ├── default.avif
│   ├── default2.avif
│   ├── drink1.jpg
│   ├── drink2.jpg
│   ├── drink3.jpg
│   ├── elmo.jpg
│   ├── Frame1.png
│   ├── hike1.jpg
│   ├── hike2.jpg
│   ├── hike3.jpg
│   ├── logo.jpg
│   └── NV01.jpg
│
├── node_modules/
│   └── [dependencies]
│
├── scripts/
│   ├── admin_profile.js
│   ├── chatbox.js
│   ├── location.js
│   ├── main.js
│   ├── navbar.js
│   ├── script.js
│   ├── session.js
│   ├── setting.js
│   ├── skeleton.js
│   └── student_profile.js
│
└── styles/
    ├── style_admin_profile.css
    ├── style_index.css
    ├── style_login.css
    ├── style_navbar.css
    ├── style_setting.css
    ├── style_student_profile.css
    ├── style.css
    └── styles_404.css
```
---

## Acknowledgments

- Code snippets for a few algoirthm were adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/).
- Icons sourced from [FontAwesome](https://fontawesome.com/) and images from [Freepik](https://freepik.com/).

---

