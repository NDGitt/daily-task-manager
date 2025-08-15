# My Diary - Daily Task Manager

A minimalist daily task manager designed to emulate the experience of writing tasks on a piece of paper. Built with Next.js, TypeScript, and Tailwind CSS.

## 🌟 Features

### ✅ Implemented (MVP)
- **Daily Task List**: Clean, paper-like interface for today's tasks
- **Task Operations**: Add, edit, complete, delete, and reorder tasks
- **Drag & Drop**: Intuitive task reordering
- **Eisenhower Matrix**: Organize tasks by urgency and importance when overloaded
- **Smart Suggestions**: Task overload detection and carry-over warnings
- **Local Storage**: Persistent task storage (temporary until Supabase integration)

### 🚧 Coming Soon
- **User Authentication**: Secure login with Supabase Auth
- **Database Integration**: Full Supabase backend integration
- **Task Carry-Over**: Automatic carry-over of incomplete tasks
- **Project Pages**: Optional project-based task lists
- **Settings**: Customizable behavior and preferences
- **Previous Days**: View and manage historical tasks

## 🚀 Getting Started

1. **Clone and Install**:
   ```bash
   git clone <your-repo>
   cd my-diary
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   Visit [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: Lucide React
- **Backend** (planned): Supabase
- **Deployment** (planned): Vercel

## 🎯 Design Philosophy

This app prioritizes:
- **Simplicity**: Minimal UI without distractions
- **Focus**: Single daily task list by default
- **Natural Interaction**: Drag-and-drop, inline editing
- **Smart Assistance**: Gentle, rule-based suggestions
- **Accessibility**: Clean typography and intuitive navigation

## 📱 Usage

1. **Add Tasks**: Click the "+" button or "Add a task"
2. **Edit Tasks**: Click on any task to edit inline
3. **Complete Tasks**: Click the circle to mark complete
4. **Reorder**: Drag and drop tasks to reorder
5. **Matrix View**: When you have 8+ tasks, use the Eisenhower Matrix to prioritize
6. **Navigation**: Use the subtle icons in the top-right for Projects, Previous Days, and Settings

## 🔧 Development

### Project Structure
```
src/
├── app/              # Next.js app router
├── components/       # React components
├── lib/             # Utilities and services
├── types/           # TypeScript interfaces
└── styles/          # Global styles
```

### Key Components
- `DailyView`: Main daily task interface
- `TaskList`: Task list with drag-and-drop
- `TaskItem`: Individual task component
- `EisenhowerMatrix`: Priority matrix for task organization

## 🗄️ Data Model

```typescript
interface Task {
  id: string;
  user_id: string;
  content: string;
  date_created: string;
  completed: boolean;
  order: number;
  carry_over_count: number;
  eisenhower_quadrant?: 1 | 2 | 3 | 4;
}
```

## 🎨 Customization

The app will support various customization options:
- Task completion behavior (color change, move to bottom, hide, stay visible)
- Smart suggestions toggle
- Task overload threshold
- Theme preferences

## 🚀 Deployment

Ready for deployment to Vercel:
1. Connect your GitHub repository to Vercel
2. Configure environment variables for Supabase
3. Deploy automatically on push

## 📄 License

MIT License - feel free to use this project as a starting point for your own task manager!

---

Built with ❤️ for productivity and focus.