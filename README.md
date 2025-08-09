# 🎯 ADHD Quest - Wiskunde (Afrikaans)

An interactive, gamified mathematics education web app designed specifically for ADHD learners in Grade 4. Features advanced text-to-speech, parent portal for content management, PDF processing, and comprehensive learning analytics.

## 🌐 Live Demo
- **Production**: [https://adhd-quest-wiskunde-af.vercel.app](https://adhd-quest-wiskunde-af.vercel.app)
- **GitHub**: [https://github.com/YOUR_USERNAME/adhd-quest-wiskunde-af](https://github.com/YOUR_USERNAME/adhd-quest-wiskunde-af)

## ✨ Key Features

### 🎓 For Students
- **Gamified Learning**: XP, levels, coins, and streak rewards system
- **ADHD-Optimized**: Designed specifically for ADHD learners with focus-friendly features
- **Advanced TTS**: Multi-language text-to-speech with Lazybird API + Web Speech API fallback
- **Multiple Question Types**: MCQ, short answer, and numeric questions
- **Spaced Repetition**: Intelligent scheduling based on performance
- **Progress Tracking**: Detailed analytics and performance insights

### 👨‍👩‍👧‍👦 For Parents & Educators
- **Parent Portal**: Comprehensive content management system
- **PDF Processing**: Upload and automatically generate questions from PDF study materials
- **JSON Import/Export**: Import existing question sets with automatic TTS enhancement
- **Question Editor**: Full CRUD interface for managing custom questions
- **Content Library**: Organize materials by subject and difficulty level
- **TTS Instruction Generator**: Auto-creates contextual Afrikaans learning instructions

### 🔧 Technical Excellence
- **Offline-First**: IndexedDB for local data storage and question caching
- **Audio Caching**: Reduces API costs with intelligent TTS blob storage
- **Performance Optimized**: Lazy loading, code splitting, and efficient rendering
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🔧 Tech Stack

- **Frontend Framework**: React 18.3.1 with React Router for navigation
- **Build Tool**: Vite 5.4.2 for fast development and building
- **Styling**: Tailwind CSS 3.4.17 with custom theme
- **State Management**: Zustand 4.4.7 for lightweight state management
- **Animations**: Framer Motion 11.0.8 for smooth animations
- **Icons**: React Icons 5.4.0 (Feather icons)
- **Testing**: Vitest 1.0.0 with jsdom environment
- **Code Quality**: ESLint 9.9.1 with React plugins

## 🚀 Getting Started on Windows 11

### Prerequisites

Ensure you have the following installed on your Windows 11 system:

1. **Node.js** (version 18.0.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - During installation, make sure to check "Add to PATH"
   - Verify installation: Open Command Prompt or PowerShell and run:
     ```cmd
     node --version
     npm --version
     ```

2. **Git** (optional but recommended)
   - Download from [git-scm.com](https://git-scm.com/)
   - Or install via Windows Package Manager: `winget install Git.Git`

### Installation Steps

1. **Open Terminal**
   - Press `Win + X` and select "Windows Terminal" or "Command Prompt"
   - Navigate to your desired directory (e.g., `cd C:\Projects`)

2. **Clone or Download the Project**
   ```cmd
   # If using Git:
   git clone [your-repository-url]
   cd "ADHD Quest"
   
   # Or if you downloaded the ZIP file:
   # Extract it and navigate to the folder in terminal
   ```

3. **Install Dependencies**
   ```cmd
   npm install
   ```
   
   This will install all required packages listed in `package.json`. The installation may take a few minutes.

4. **Start the Development Server**
   ```cmd
   npm run dev
   ```
   
   You should see output similar to:
   ```
   VITE v5.4.2  ready in [time]ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ➜  press h to show help
   ```

5. **Open the Application**
   - Open your web browser (Chrome, Edge, Firefox, etc.)
   - Navigate to `http://localhost:5173/`
   - The app should load and display the "Quest Academy" homepage

### Available Scripts

```cmd
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linting (code quality check)
npm run lint

# Run linting with errors only
npm run lint:error

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Building for Production

To create an optimized build for deployment:

```cmd
npm run build
```

This creates a `dist` folder with optimized files ready for deployment to any web server.

## 🎮 How to Use the App

### Getting Started
1. **Home Screen**: View your current level, XP, and coins
2. **Start Quest**: Click to begin a learning session
3. **Settings**: Customize session length, difficulty, and TTS preferences

### During a Quiz Session
- **Question Types**: Answer multiple choice, fill-in-the-blank, or numeric questions
- **Hints**: Click the help icon for hints (reduces reward by 30%)
- **Audio**: Click the speaker icon to hear questions read aloud
- **Timer**: Each question has a time limit (default 45 seconds)
- **Feedback**: Get immediate feedback with explanations

### Reward System
- **XP Points**: Earned based on difficulty, speed, and accuracy
- **Coins**: Additional currency for future features
- **Levels**: Increase every 100 XP points
- **Streaks**: Bonus rewards for consecutive correct answers

### Spaced Repetition
Questions you struggle with appear more frequently, while mastered questions appear less often, optimizing your learning efficiency.

## 📁 Project Structure

```
ADHD Quest/
├── src/
│   ├── components/          # React components
│   │   ├── Home.jsx        # Main menu/dashboard
│   │   ├── Play.jsx        # Quiz gameplay screen
│   │   ├── Summary.jsx     # Session results
│   │   ├── QuestionRenderer.jsx  # Question display logic
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   └── useGameSession.js # Main game logic
│   ├── logic/              # Core business logic
│   │   ├── grading.js      # Answer evaluation
│   │   ├── scheduling.js   # Spaced repetition algorithm
│   │   └── scoring.js      # Points calculation
│   ├── state/              # State management
│   │   └── profileStore.js # User profile/progress
│   ├── data/               # Static data
│   │   └── seedQuestions.js # Question bank
│   ├── utils/              # Utility functions
│   └── test/               # Test files
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── vite.config.js        # Build configuration
├── tailwind.config.js    # Styling configuration
└── README.md             # This file
```

## 🔧 Configuration & Customization

### Question Bank
Edit `src/data/seedQuestions.js` to add or modify questions. Each question has:
- `type`: "mcq", "short", or "numeric"
- `difficulty`: 1 (easy), 2 (medium), or 3 (hard)
- `subject` and `topic`: For categorization
- `hint` and `explanation`: Educational content

### Game Settings
Default preferences in `src/state/profileStore.js`:
- `questionSeconds`: Time per question (45s)
- `sessionMinutes`: Session duration (8min)
- `ttsEnabled`: Text-to-speech on/off
- `dynamicDifficulty`: Adaptive difficulty

### Styling
Customize colors and themes in `tailwind.config.js`. The app uses a blue primary theme with success/warning/error accent colors.

## 🧪 Testing

The app includes comprehensive tests for core functionality:

```cmd
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test grading.test.js
```

Tests cover:
- Answer grading logic
- Scoring calculations
- Text normalization utilities

## 📱 Browser Support

Optimized for modern browsers:
- Chrome 90+ ✅
- Firefox 88+ ✅  
- Safari 14+ ✅
- Edge 90+ ✅

**Note**: Text-to-speech features require modern browser support and may need user interaction to initialize.

## 🔧 Troubleshooting

### Common Issues

**1. npm install fails**
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again
- Ensure you have Node.js 18+ installed

**2. App won't start**
- Check if port 5173 is already in use
- Try `npm run dev -- --port 3000` to use a different port

**3. Text-to-speech not working**
- Ensure your browser supports Web Speech API
- Try clicking the speaker button manually (some browsers require user interaction)
- Check browser permissions/settings

**4. Build fails**
- Run `npm run lint` to check for code issues
- Ensure all dependencies are installed correctly

### Windows-Specific Notes

- Use Command Prompt, PowerShell, or Windows Terminal
- If you see permission errors, try running as Administrator
- Windows Defender may scan node_modules during installation (normal)

## 🤝 Development

### Adding New Questions
1. Edit `src/data/seedQuestions.js`
2. Follow the existing question format
3. Test with `npm run dev`

### Code Style
- Uses ESLint for code quality
- Follows React best practices
- Uses functional components with hooks

### Making Changes
1. Create a new branch for features
2. Run tests before committing: `npm test`
3. Run linting: `npm run lint`
4. Build to verify: `npm run build`

## 📝 License

This project is for educational purposes. Please ensure you have proper licensing for any production use.

---

**Need Help?** 

Since you're still learning to code, here are some key concepts this app demonstrates:

- **React Components**: Reusable UI pieces like `Home.jsx`, `Play.jsx`
- **State Management**: Using Zustand to track user progress across components  
- **Hooks**: Custom logic like `useGameSession` to manage complex behavior
- **Event Handling**: User interactions like clicking buttons, submitting answers
- **Local Storage**: Saving progress in the browser so it persists between sessions
- **Responsive Design**: Using Tailwind CSS for mobile-friendly layouts
- **Testing**: Automated tests to ensure code works as expected

Each file has a specific purpose, and the app follows React best practices for organizing code. Feel free to explore the files to see how different features are implemented!