# Mail Tracking System

Production-ready email tracking platform built with **Node.js**, **Express**, **Sequelize CLI**, **MySQL**, **Gmail API (OAuth2)**, and **JWT authentication**.

## Features

- User registration and JWT login
- Gmail OAuth2 connection for sending emails
- Automatic hidden tracking pixel injection in HTML emails
- Open tracking with IP, User-Agent, referer, and open count
- Dashboard showing recipient, subject, sent time, open status, open count, and last open time
- Sequelize CLI migrations, models, and seeders

## Tech Stack

- Node.js + Express 5
- Sequelize CLI + MySQL
- JWT (`jsonwebtoken`)
- Google APIs (`googleapis`)
- Helmet, CORS, dotenv, UUID

## Project Structure

```
mail-tracking-system/
├── config/              # Sequelize & env config
├── controllers/         # Route handlers
├── docs/                # API documentation
├── middleware/          # Auth, validation, errors
├── migrations/          # Sequelize CLI migrations
├── models/              # Sequelize models + associations
├── public/dashboard/    # Web dashboard UI
├── routes/              # Express routes
├── seeders/             # Sequelize CLI seeders
├── services/            # Business logic
├── utils/               # Helpers
├── validators/          # Request validation rules
├── app.js               # Express app setup
└── server.js            # Entry point
```

## Quick Start

### 1. Install dependencies

```bash
cd mail-tracking-system
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials, JWT secret, and Google OAuth credentials.

### 3. Create MySQL database

```sql
CREATE DATABASE mail_tracking_dev;
```

### 4. Run migrations & seeders (Sequelize CLI)

```bash
npm run db:migrate
npm run db:seed
```

Demo user after seeding:
- Email: `demo@mailtracker.com`
- Password: `password123`

### 5. Google Cloud setup

1. Create a project in [Google Cloud //console](https:////console.cloud.google.com/)
2. Enable **Gmail API**
3. Create OAuth 2.0 credentials (Web application)
4. Add authorized redirect URI: `http://localhost:3000/google/callback`
5. Copy Client ID and Client Secret to `.env`

### 6. Start the server

```bash
npm run dev
```

- API: `http://localhost:3000`
- Dashboard: `http://localhost:3000/dashboard`
- Health: `http://localhost:3000/health`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive JWT |
| GET | `/google/connect` | JWT | Get Gmail OAuth URL |
| GET | `/google/callback` | No | OAuth callback (Google redirect) |
| POST | `/email/send` | JWT | Send tracked email via Gmail |
| GET | `/email` | JWT | List all tracked emails |
| GET | `/email/:id` | JWT | Get email details + open events |
| GET | `/track/:trackingId` | No | Tracking pixel (1×1 PNG) |

See [docs/API.md](docs/API.md) for full request/response documentation.

## Database Schema

### Associations

- `User` hasMany `Email`
- `Email` belongsTo `User`
- `Email` hasMany `EmailOpen`
- `EmailOpen` belongsTo `Email`
- `User` hasOne `GmailAccount`
- `GmailAccount` belongsTo `User`

## NPM Scripts

```bash
npm start          # Start production server
npm run dev        # Start with nodemon
npm run db:migrate # Run Sequelize migrations
npm run db:seed    # Run Sequelize seeders
npm run db:reset   # Undo all, migrate, seed
```

## Tracking Flow

1. User sends email via `POST /email/send`
2. System generates a UUID `tracking_id`
3. A hidden `<img>` pixel is injected into the HTML body
4. When the recipient opens the email, the pixel loads `GET /track/:trackingId`
5. Server records IP, User-Agent, referer, increments open count
6. Server responds with a transparent 1×1 PNG

## License

ISC
