# ft_transcendence: Modern Web-based Pong Game Platform

## 🎮 Project Overview

ft_transcendence is a modern web-based Pong game platform that brings the classic arcade experience to life with real-time multiplayer capabilities, tournaments, and social features. Built with Node.js, TypeScript, and containerized with Docker, this project demonstrates web development skills, real-time communication implementation, and secure user management.

## ✨ Features

- **Classic Pong Gameplay**: Faithful recreation of the original Pong (1972)
- **Tournament System**: Organize and participate in competitive tournaments
- **Multiplayer Modes**:
  - Direct 1v1 matches (local or remote)
  - 3-Player unique gameplay on specialized boards
- **User Management**: Register, log in, customize profiles
- **Social Features**: Friends list, online status tracking
- **Game Stats**: Comprehensive match history and performance analytics

## 🛠️ Technical Stack

### Backend
- **Framework**: Fastify with Node.js
- **Database**: SQLite for data persistence
- **Authentication**: JWT tokens with optional 2FA security
- **Security**: HTTPS, password hashing, XSS protection

### Frontend
- **Languages**: TypeScript with Tailwind CSS
- **Architecture**: Single-page application
- **Responsive Design**: Support for various devices and screen sizes

### Deployment
- **Containerization**: Docker for consistent deployment
- **One-command Setup**: Simple launch with docker-compose

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Modern web browser (Firefox recommended)

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/ft_transcendence.git
cd ft_transcendence

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Launch the application
docker-compose up --build
```

Access the application at: https://localhost

## 📷 Screenshots

<div align="center">
  <img src="screenshots/login_and_registration/Login_Screen.png" alt="Login Screen" width="400">
  <img src="screenshots/play_Game/Games.png" alt="Game Selection" width="400">
  <img src="screenshots/play_Game/1V1_Game.png" alt="1v1 Game" width="400">
  <img src="screenshots/play_Game/Tournament_Dashboard.png" alt="Tournament Dashboard" width="400">
  <img src="screenshots/play_Game/3-Player_Multiplayer_Game.png" alt="3-Player Game" width="400">
  <img src="screenshots/friends/Friends.png" alt="Friends Management" width="400">
</div>

## 🎮 Game Modes

### Direct Match
Challenge a friend to a classic 1-on-1 Pong match with customizable settings.

### Tournament Mode
Create or join tournaments with multiple players, automatic matchmaking, and progressive rounds leading to a championship match.

### 3-Player Multiplayer
Experience a unique twist on Pong with three players simultaneously controlling paddles on different sides of the playing field.

## 🕹️ Controls

- **Movement**: WASD keys or arrow keys
- **Game Options**: Access via in-game menu
- **Tournament Navigation**: On-screen buttons for match progression

## 🔐 Security Features

- Password hashing for secure storage
- Protection against SQL injections and XSS attacks
- HTTPS connections for all communications
- Form validation on both client and server sides
- Optional Two-Factor Authentication

## 📚 Project Structure

```
ft_transcendence/
├── backend/                 # Server-side code
│   ├── src/                 # Source files
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Data models
│   │   ├── plugins/         # Fastify plugins
│   │   ├── routes/          # API endpoints
│   │   └── services/        # Business logic
│   └── Dockerfile           # Backend container definition
├── frontend/                # Client-side code
│   ├── public/              # Static assets
│   ├── src/                 # Source files
│   │   ├── components/      # UI components
│   │   ├── context/         # React context
│   │   └── services/        # API services
│   └── Dockerfile           # Frontend container definition
├── docker/                  # Docker configuration
│   └── nginx/               # Web server configuration
├── docker-compose.yml       # Service orchestration
└── README.md                # This file
```

## 📈 Modules

The project implements the following modules as specified in the subject requirements. A total of 7 major modules (or equivalent combinations of minor modules) have been completed.

### Major Modules
- **1,0 Use a Framework to Build the Backend** ✅  
  Implemented using Fastify with Node.js for efficient server-side operations.

- **2,0 Standard User Management** ✅  
  Complete user registration, authentication, and profile management system.

- **3,0 Implement Two-Factor Authentication (2FA) and JWT** ✅  
  Enhanced security with optional 2FA and JWT token-based authentication.

- **4,0 Implement Remote Authentication** ✅  
  Support for third-party authentication providers including Google OAuth.

- **5,0 Multiple Players** ✅  
  Unique 3-player mode with specialized game boards in addition to standard 1v1 matches.

### Minor Modules (each pair counts as one Major Module)
- **5,5 Use a Database for the Backend** ✅  
  SQLite implementation for efficient data persistence.

- **6,0 Expanding Browser Compatibility** ✅  
  Cross-browser testing ensures compatibility with all modern browsers.

- **6,5 User and Game Stats Dashboards** ✅  
  Comprehensive statistics tracking and visualization for player performance.

- **7,0 GDPR Compliance Options** ✅  
  User anonymization, local data management, and account deletion functionality.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Authors

- [Luca Goddijn](https://github.com/DontCallMeLuca)
- Oleksii Volzhev
- [Jared Goedhart](https://github.com/jaredgoedhart)

## 🙏 Acknowledgments

The 42 Network for the project inspiration.
The Pong game (1972) for the classic gameplay concept.
The open-source community for the tools and libraries used.

This project was developed as part of the 42 School curriculum.
