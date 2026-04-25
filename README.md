# Vero 🚀

**Build with context model and vero-style**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=flat&logo=github)](https://github.com/AyushK5ingh/Vero)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

Vero is an innovative AI-powered web development platform that enables users to create applications and websites through natural language conversations with AI. Built with cutting-edge technologies, it provides an intuitive interface for rapid prototyping and development.

## ✨ Features

- 🤖 **AI-Powered Development**: Create apps and websites by chatting with AI
- 🏗️ **Live Code Generation**: Real-time code generation and execution in sandboxed environments
- 📁 **Project Management**: Organize and manage multiple projects with persistent storage
- 🔒 **Authentication**: Secure user authentication powered by Clerk
- 💬 **Interactive Chat Interface**: Intuitive chat-based development workflow
- 🎨 **Modern UI**: Beautiful interface built with shadcn/ui and Tailwind CSS
- 📊 **Real-time Updates**: Live preview and instant feedback
- 🗄️ **Database Integration**: PostgreSQL with Prisma ORM

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation

### Backend

- **API**: tRPC for type-safe API calls
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **AI Integration**: OpenAI-compatible models (AWS API key preferred)
- **Background Jobs**: Inngest for workflow orchestration
- **Code Execution**: E2B sandboxed environments

### Development Tools

- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier
- **Database Migrations**: Prisma Migrate
- **Deployment**: Vercel (recommended)

## 📂 Project Structure

```
vero/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (home)/            # Home page route group
│   │   ├── projects/          # Project-specific pages
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...               # Custom components
│   ├── hooks/                 # Custom React hooks
│   ├── inngest/              # Background job functions
│   ├── lib/                   # Utility libraries
│   ├── modules/              # Feature modules
│   │   ├── home/             # Home page module
│   │   ├── messages/         # Message handling
│   │   └── projects/         # Project management
│   ├── trpc/                 # tRPC configuration
│   └── types.ts              # Global type definitions
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── public/                   # Static assets
├── sandbox-templates/        # E2B sandbox templates
│   └── nextjs/              # Next.js sandbox template
└── ...                       # Configuration files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Clerk account for authentication
- OpenAI-compatible API key (AWS API key preferred)
- E2B account for code execution

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AyushK5ingh/Vero.git
   cd Vero
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file with:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/vero"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   CLERK_SECRET_KEY="your_clerk_secret_key"

   # OpenAI-compatible model provider (Bedrock preferred)
   BEDROCK_API_KEY="your_bedrock_api_key"
   BEDROCK_BASE_URL="https://your-bedrock-openai-compatible-endpoint"
   BEDROCK_MODEL="your_bedrock_model_id"
   # Additional options:
   AWS_API_KEY="your_aws_api_key"
   # Optional fallbacks and overrides:
   # AI_API_KEY="your_generic_model_api_key"
   # GITHUB_TOKEN="your_github_models_token"
   # AWS_MODELS_BASE_URL="https://your-openai-compatible-endpoint"
   # AWS_MODEL="openai/gpt-4.1-mini"

   # E2B
   E2B_API_KEY="your_e2b_api_key"

   # Inngest
   INNGEST_EVENT_KEY="your_inngest_event_key"
   INNGEST_SIGNING_KEY="your_inngest_signing_key"
   ```

4. **Database setup**

   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Start development server**

   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Creating a New Project

1. **Sign in** to your account using Clerk authentication
2. **Create a project** by describing what you want to build
3. **Chat with AI** to refine and develop your application
4. **View live previews** of your generated code in real-time
5. **Manage projects** from your dashboard

### Chat Interface

- Type natural language descriptions of what you want to build
- The AI will generate code, create files, and run commands
- View live previews in sandboxed environments
- Iterate and refine your application through conversation

## 🗄️ Database Schema

The application uses three main models:

- **Project**: Stores project information and metadata
- **Message**: Conversation history between user and AI
- **Fragment**: Code snippets and generated files with sandbox URLs

## 🔧 Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm prisma:push  # Push database schema changes
pnpm prisma:gen   # Generate Prisma client
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy automatically** on every push to main branch

### Manual Deployment

1. **Build the application**

   ```bash
   pnpm build
   ```

2. **Start the production server**
   ```bash
   pnpm start
   ```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Clerk](https://clerk.dev/) - Authentication and user management
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Prisma](https://prisma.io/) - Next-generation ORM
- [E2B](https://e2b.dev/) - Code execution environments
- [tRPC](https://trpc.io/) - Type-safe APIs
- [Inngest](https://inngest.com/) - Background job processing
