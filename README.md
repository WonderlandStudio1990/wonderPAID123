# Monite Integration Project

This project integrates Monite's API for payment and invoice management with our application.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in the required values:
   ```bash
   cp .env.example .env
   ```

4. Set up your environment variables:
   - `POSTGRES_URL`: Your Supabase database URL
   - `POSTGRES_URL_NON_POOLING`: Non-pooling database URL for migrations
   - `MONITE_ENTITY_ID`: Your Monite entity ID
   - `MONITE_API_KEY`: Your Monite API key

5. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/lib/monite/` - Monite integration code
  - `config.ts` - Configuration setup
  - `client.ts` - Monite API client
  - `api/generated/` - Generated API types and clients

## Database Migrations

To run database migrations:

```bash
npm run apply-migrations
```

## Development

The project uses Next.js with TypeScript and integrates with Supabase for database management.
