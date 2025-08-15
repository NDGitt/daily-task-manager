# My Diary - Minimalist Daily Task Manager

A cross-platform, minimalist task manager designed to emulate the experience of writing tasks on a piece of paper. The app is focused on daily task logging with minimal clutter, optional project-based lists, and gentle, rule-based smart features that support productivity without overwhelming the user.

## 🌟 Features

### Core Functionality
- **Daily Task Log**: One task list per day, just like paper
- **Simple Task Management**: Add, complete, and reorder tasks with ease
- **Task Carry-Over**: Incomplete tasks automatically carry over to the next day
- **Clean Slate Philosophy**: If you don't use the app for a day, carried-over tasks are archived to maintain a clutter-free environment

### Smart Features
- **Task Overload Detection**: Suggests using the Eisenhower Matrix when you have too many tasks
- **Carry-Over Management**: Special attention for tasks that carry over multiple days
- **Project Archiving**: Automatic suggestions for archiving inactive projects
- **Eisenhower Matrix**: Drag-and-drop task prioritization

### Optional Projects
- **Project Lists**: Separate task lists for specific events, trips, or projects
- **Hidden by Default**: Projects are hidden to keep the daily view clean
- **Auto-Archiving**: Inactive projects are suggested for archiving

### User Experience
- **Onboarding Flow**: Guided introduction for new users
- **Minimalist Interface**: Clean, distraction-free design
- **Responsive Design**: Works on desktop and mobile
- **Settings Customization**: Tailor the app to your preferences

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free)

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/daily-task-manager.git
cd daily-task-manager

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run the development server
npm run dev
```

### Environment Variables
Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🗄️ Database Setup

1. Create a new Supabase project
2. Run the schema from `supabase-schema.sql` in the SQL Editor
3. Configure authentication settings
4. Add your local development URL to allowed sites

## 🎯 Philosophy

**Less is more.** This app is designed for users who:
- Value simplicity over complexity
- Want to focus on today's tasks without distraction
- Appreciate gentle smart features that don't interrupt workflow
- Prefer a clean, paper-like experience

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel
- **Database**: PostgreSQL with Row Level Security

## 📱 Screenshots

*Screenshots coming soon*

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Vercel.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the simplicity of paper-based task management
- Built for users with ADHD and attention sensitivities
- Designed to reduce digital clutter and improve focus

---

**Built with ❤️ for productive, focused task management**