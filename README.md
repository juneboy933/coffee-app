# Coffee App

A simple Node.js / Express backend for managing users, coffee products, and wallet-based coffee purchases using PostgreSQL.

## Features

- Automatic database initialization on server start
- User registration with associated wallet account
- User wallet funding via system account ledger entries
- Add coffee products with associated coffee accounts
- Purchase coffee with double-entry ledger tracking
- Basic health check endpoint

## Requirements

- Node.js 18 or later
- PostgreSQL database
- `npm` installed

## Environment Variables

Create a `.env` file in the project root with the following values:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_DATABASE=coffee_app
DB_PORT=5432
PORT=8080
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm run dev
```

3. The API will be available at `http://localhost:8080`.

## API Endpoints

- `GET /health`
  - Returns service status

- `POST /api/user/register`
  - Body: `{ "email": "user@example.com", "password": "secret" }`

- `POST /api/user/fund`
  - Body: `{ "userId": "<user-uuid>", "amount": 100 }`

- `POST /api/coffee/create`
  - Body: `{ "name": "Espresso", "price": 3.50 }`

- `POST /api/coffee/buy`
  - Body: `{ "userId": "<user-uuid>", "coffeeId": "<coffee-uuid>" }`

- `GET /api/coffee/all`
  - Returns all coffee products

- `GET /api/coffee/:name`
  - Returns a coffee item by name

## Notes

- The project currently stores user passwords in plaintext. For production use, hash passwords before saving with a library such as `bcrypt`.
- The database initialization creates supporting ledger and account tables automatically on startup.
- The dependency `pgvector` is included in `package.json` but is not used in the current codebase.

## GitHub Push

After creating a local repository, add a remote and push:

```bash
git init
git add .
git commit -m "Add README and initial project files"
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```
