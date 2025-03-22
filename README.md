# KeyMap: AI-Powered Database Schema Designer

An innovative, production-ready web application that transforms database design through natural language conversation. Designed as a conversational AI assistant for database schema creation, KeyMap empowers users to easily translate their project requirements into fully-formed database schemas through natural language interaction.

**🔗 Live Demo:** [https://keymap-drab.vercel.app](https://keymap-drab.vercel.app)

**Clear comments to ensure my thought process in bug fixes, enhancements etc. (Gigsama)**

## Key Features

- **Groundbreaking Guest Mode:** Instantly start designing database schemas without signing up, just like ChatGPT's guest experience
- **AI-Powered Schema Design:** Interactive assistant with advanced context awareness and real-time typing indicators
- **Project Management:** Create, view, edit, and delete projects with optimistic UI updates and keyboard navigation
- **Responsive Design:** Fluid, accessible interface that works seamlessly across devices
- **User Authentication:** Secure login system with JWT-based session management
- **Unique Project URLs:** Each schema project has its own unique, shareable URL
- **Real-time Collaboration:** Share project URLs with collaborators for live updates (viewers)
- **Error Recovery:** Graceful error handling with intelligent fallbacks and retry mechanisms
- **Accessibility:** WCAG 2.1 AA compliant with full keyboard navigation support

## How KeyMap Fulfills Project Requirements

### User Interface & Experience
✅ **Conversational AI Design Interface:** Natural language interaction to gather database requirements  
✅ **Responsive Web Application:** Mobile-friendly design that works across all devices  
✅ **Unique Project URLs:** Each schema has its dedicated URL (e.g., `/project/[id]`)  
✅ **Intuitive Project Management:** Easy creation, viewing, editing, and sharing of schemas  
✅ **Real-time Typing Indicators:** Sleek, modern typing animation shows when AI is processing

### Guest Mode Experience
✅ **No Sign-up Required:** Start designing schemas immediately without registration  
✅ **Instant Accessibility:** Jump straight into designing with zero friction  
✅ **Persistent Session:** Complete your design in a single session with no data loss  
✅ **Clear Upgrade Path:** Seamless transition to registered accounts to save projects  
✅ **Equal Feature Access:** Same AI capabilities and schema generation as registered users

### Schema Generation & AI Integration
✅ **Intelligent Format Selection:** AI chooses between SQL and NoSQL based on requirements  
✅ **Contextual Understanding:** AI retains conversation context for coherent recommendations  
✅ **Multi-step Refinement:** Iterative design process through conversation  
✅ **Complete Schema Generation:** Creates fully-formed schemas with relationships  
✅ **Visual Representation:** Real-time visual updates of the database schema  

### Backend & Data Management
✅ **API Integration:** RESTful API design with proper status codes and error handling  
✅ **Schema Persistence:** Projects saved and retrievable via unique URLs  
✅ **User Data Security:** JWT authentication for registered users  
✅ **Efficient Data Storage:** Optimized storage and retrieval patterns  
✅ **Session Management:** Guest and authenticated session handling

## Technology Stack

- **Frontend**
  - Next.js 15 (App Router architecture)
  - React 19 (Server Components, Suspense, Streaming)
  - TypeScript 5 with strict mode
  - Tailwind CSS with custom design system
  - Framer Motion for smooth animations
  - React Context API for global state management

- **Backend**
  - Next.js API Routes with Edge Runtime support
  - RESTful API design with proper status codes and error handling
  - Serverless architecture for horizontal scaling
  - Rate limiting and request validation middleware

- **AI Integration**
  - Google's Gemini API with advanced prompt engineering
  - Context-aware conversation management
  - Schema validation and error correction
  - Streaming response handling

- **Storage & Data Management**
  - JSON-based persistence layer with atomic operations
  - Redis caching for performance optimization
  - Data migration utilities for schema evolution
  - Efficient query patterns with pagination support

## Guest Mode: Transforming Database Design Accessibility

Our groundbreaking Guest Mode democratizes database schema design, eliminating traditional barriers to entry with a zero-friction starting experience:

### Instant Access, No Sign-up
Start designing your database schema immediately without registration, login forms, or email verification – just like ChatGPT's guest experience. This removes all friction to trying the platform.

### Full-Featured Experience
Guest users enjoy the same powerful AI-driven schema design experience as registered users, including:
- Complete conversational AI capabilities
- Full schema generation and visualization
- Real-time typing indicators and response streaming
- Multi-format schema support (SQL & NoSQL)

### Seamless Continuation Path
While guest sessions don't persist data between visits, we offer:
- Clear prompts to create an account to save work
- One-click transition to registered accounts
- Project history and management for registered users

### Real-world Impact
This approach significantly lowers the barrier to entry for developers who need quick schema design assistance without commitment, much like how ChatGPT's guest mode revolutionized AI accessibility.

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Owusu1964/gigsama2.git
   cd gigsama2
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Gemini API key:
   ```
    GEMINI_API_KEY=your_gemini_api_key_here
    keymap_KV_REST_API_TOKEN="your__token"
    keymap_KV_REST_API_URL="your_url"
    NEXT_PUBLIC_APP_URL=http://localhost:3000

   ```

4. Run the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Flow

1. **Welcome Screen:** Start in either guest mode or sign in
2. **Project Creation:** Begin a conversation by describing your database needs
3. **Requirements Input:** Engage with the AI to describe your schema requirements
4. **Conversational Refinement:** Iterate and refine through back-and-forth conversation
5. **Schema Generation:** Ask the AI to "generate schema" when you're ready
6. **Visualization & Export:** View, modify, and export your schema in SQL or NoSQL format
7. **Save & Share:** Create an account to save your project or share via unique URL

## Architecture Highlights

### Frontend Architecture
The application follows a component-based architecture with clear separation of concerns:
- **Page Components:** Handle routing and layout
- **Feature Components:** Implement specific business logic
- **UI Components:** Reusable, presentational components
- **Custom Hooks:** Abstract complex logic and state management
- **Context Providers:** Manage global application state

### Backend Architecture
The API follows RESTful principles with a focus on:
- **Resource-based Routes:** Clear endpoint structure
- **Middleware Chain:** Authentication, validation, error handling
- **Service Layer:** Business logic separated from controllers
- **Data Access Layer:** Abstraction over storage implementation
- **Error Boundary:** Consistent error response format

### AI Integration Architecture
The AI integration is designed for robust, context-aware schema generation:
- **Conversation Management:** Maintaining context through message history
- **Schema Generation Pipeline:** Converting requirements to structured schemas
- **Format Detection:** Intelligent SQL vs NoSQL format selection
- **Error Handling:** Fallback mechanisms for AI failures
- **Prompt Engineering:** Carefully crafted prompts for consistent results


## License

MIT

---

*This project demonstrates how AI can transform database schema design through natural language interaction, making database architecture accessible to developers of all experience levels.*

