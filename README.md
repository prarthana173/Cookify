# Cookify - Recipe Discovery App with Flask Authentication

A modern web application for discovering recipes based on available ingredients, now with secure Flask backend authentication.

## Features

- 🔐 **Secure Flask Backend Authentication**
  - User registration and login
  - Password hashing with Werkzeug
  - Session-based authentication
  - SQLite database for user storage

- 🍳 **Recipe Discovery**
  - Find recipes based on available ingredients
  - Integration with TheMealDB API (free, no API key required)
  - Beautiful, responsive UI
  - Recipe details and instructions

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Installation

1. **Clone or download the project files**

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   
   **Option A: Use the startup script (recommended)**
   ```bash
   python start_servers.py
   ```
   
   **Option B: Run servers manually**
   
   In one terminal (Flask backend):
   ```bash
   python app.py
   ```
   
   In another terminal (Frontend):
   ```bash
   python -m http.server 8080
   ```

4. **Access the application**
   - Open your browser and go to: `http://localhost:8080/Cookify - Welcome.html`
   - The Flask backend will be running on: `http://localhost:5000`

## Demo Accounts

The application comes with pre-configured demo accounts:

- **Admin**: admin@cookify.com / admin123
- **User**: user@example.com / password
- **Chef**: chef@cookify.com / hello

## API Endpoints

The Flask backend provides the following authentication endpoints:

- `POST /api/register` - Create a new user account
- `POST /api/login` - Authenticate user
- `POST /api/logout` - End user session
- `GET /api/check-auth` - Check authentication status
- `GET /api/user` - Get current user information

## Architecture

### Backend (Flask)
- **app.py**: Main Flask application with authentication routes
- **SQLite Database**: User data storage with password hashing
- **Session Management**: Secure server-side sessions
- **CORS Support**: Cross-origin requests for frontend

### Frontend
- **HTML/CSS/JavaScript**: Modern, responsive web interface
- **Fetch API**: Communication with Flask backend
- **Session Cookies**: Automatic session management
- **Form Validation**: Client and server-side validation

## Security Features

- ✅ Password hashing with Werkzeug's secure methods
- ✅ Server-side session management
- ✅ CORS configuration for secure cross-origin requests
- ✅ Input validation and sanitization
- ✅ SQL injection protection with SQLAlchemy ORM
- ✅ Secure cookie handling

## Development

### Project Structure
```
CSI/
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── start_servers.py      # Startup script
├── config.js             # Frontend configuration
├── script.js             # Frontend JavaScript
├── style.css             # Styling
├── Cookify - Welcome.html # Login/Register page
├── Cookify - Ingredients.html # Main app page
├── Cookify - Recipes.html # Recipe results
└── Cookify - Recipe Details.html # Recipe details
```

### Database
The application uses SQLite with the following schema:
- **Users table**: id, email, name, password_hash, created_at

### Configuration
- Flask secret key: Change in production (app.py)
- API URLs: Configure in config.js
- Database: SQLite file (cookify.db) created automatically

## Troubleshooting

1. **Port conflicts**: If ports 5000 or 8080 are in use, modify the port numbers in the respective files
2. **Module not found**: Ensure all dependencies are installed with `pip install -r requirements.txt`
3. **Database issues**: Delete `cookify.db` to reset the database
4. **CORS errors**: Ensure both servers are running and check browser console for details

## Production Deployment

For production deployment:
1. Change the Flask secret key in `app.py`
2. Use a production WSGI server (e.g., Gunicorn)
3. Use a production database (PostgreSQL, MySQL)
4. Enable HTTPS
5. Configure proper CORS origins
6. Set up environment variables for sensitive configuration

## License

This project is for educational purposes.
