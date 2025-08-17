# FocusFlow - Todo Application

A modern, feature-rich todo application built with React, TypeScript, and Supabase backend.

## Features

- ✅ **User Authentication** - Sign up, sign in, and secure user sessions
- ✅ **Real-time Data** - Todos sync across devices in real-time
- ✅ **Priority Management** - Organize todos by priority levels
- ✅ **Sub-tasks** - Break down todos into smaller, manageable sub-tasks
- ✅ **Tags & Categories** - Categorize todos with custom tags
- ✅ **Due Dates** - Set deadlines and track overdue items
- ✅ **Search & Filter** - Find todos quickly with search and filtering
- ✅ **Calendar View** - Visual calendar integration
- ✅ **Responsive Design** - Works perfectly on desktop and mobile
- ✅ **Dark/Light Mode** - Beautiful UI with theme support

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_REPO_URL>
   cd focusflow-organize-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase Backend**
   
   Follow the detailed setup guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
   - Create a Supabase project
   - Set up the database schema
   - Configure authentication
   - Get your API credentials

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173` and start using FocusFlow!

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── ui/             # shadcn/ui components
│   └── ...             # App-specific components
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries (Supabase client)
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript type definitions
└── ...
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Setup

The application uses Supabase as the backend, providing:
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Built-in auth with email/password
- **Real-time**: Live updates across devices
- **Storage**: File storage (if needed)

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete backend setup instructions.

## Deployment

### Deploy to Lovable

Simply open [Lovable](https://lovable.dev) and click on Share -> Publish.

### Deploy to Other Platforms

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your preferred hosting platform:
   - Vercel
   - Netlify
   - GitHub Pages
   - Any static hosting service

3. **Update Supabase settings** with your production domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
