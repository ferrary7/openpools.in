# OpenPools.in

A professional matchmaking platform that connects people based on their skills, interests, and expertise using AI-powered keyword matching.

## Features

- **AI-Powered Matching**: Uses Google Gemini to extract and analyze keywords from resumes and profiles
- **PDF Resume Upload**: Automatically extract keywords from PDF resumes
- **Smart Keyword Profiles**: Build comprehensive profiles from resumes, LinkedIn, and journal entries
- **Compatibility Scoring**: Find matches based on shared keywords and interests
- **Keyword Search**: Search for people with specific skills or interests
- **Journal System**: Document your professional journey and expand your keyword profile
- **Google OAuth**: Quick and secure sign-in with Google

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **AI**: Google Gemini API
- **PDF Processing**: pdf-parse-fork
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ferrary7/openpools.in.git
cd openpools.in
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `GEMINI_API_KEY`: Your Google Gemini API key

4. Set up the database:
   - Go to your Supabase project SQL Editor
   - Run the SQL from `supabase-schema.sql`
   - Add the INSERT policy for profiles (see `DATABASE_SETUP.md`)

5. Configure Google OAuth:
   - In Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add your Google OAuth credentials
   - Add redirect URLs for your domain

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Setup

See `DATABASE_SETUP.md` for detailed database setup instructions.

The key tables are:
- `profiles`: User profiles and basic information
- `keyword_profiles`: AI-extracted keywords for each user
- `matches`: Calculated compatibility scores between users
- `journals`: User journal entries for expanding profiles

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

Also update your Google OAuth redirect URLs to include your production domain.

## Project Structure

```
openpools/
├── app/
│   ├── (auth)/          # Authentication pages (login, signup)
│   ├── (protected)/     # Protected pages (dashboard, profile, matches, etc.)
│   ├── api/             # API routes
│   └── page.js          # Landing page
├── components/          # Reusable React components
├── lib/                 # Utility functions and configurations
│   ├── gemini.js        # Gemini AI integration
│   ├── keywords.js      # Keyword processing utilities
│   └── supabase/        # Supabase client configurations
├── public/              # Static assets
└── supabase-schema.sql  # Database schema
```
