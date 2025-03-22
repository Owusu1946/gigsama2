# KeyMap: AI-Powered Database Schema Designer for Gigsama

An innovative, production-ready web application that transforms database design through natural language conversation. Built with modern fullstack technologies and state-of-the-art AI integration, KeyMap demonstrates exceptional technical expertise relevant to Gigsama's tech stack and product philosophy.

**🔗 Live Demo:** [https://keymap-schema-designer.vercel.app](https://keymap-schema-designer.vercel.app)

## Key Features

- **AI-Powered Schema Design:** Interactive assistant with advanced context awareness and real-time typing indicators
- **Dynamic Schema Visualization:** Real-time updates with support for SQL (PostgreSQL, MySQL, SQLite) and NoSQL (MongoDB, DynamoDB) formats
- **Project Management:** Create, view, edit, and delete projects with optimistic UI updates and keyboard navigation
- **Responsive Design:** Fluid, accessible interface that works seamlessly across devices
- **User Authentication:** Secure login system with JWT-based session management and guest mode
- **Real-time Collaboration:** Shareable project URLs with live updates (WebSocket integration)
- **Error Recovery:** Graceful error handling with intelligent fallbacks and retry mechanisms
- **Accessibility:** WCAG 2.1 AA compliant with full keyboard navigation support

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

- **DevOps & Quality**
  - CI/CD pipeline with GitHub Actions
  - End-to-end testing with Playwright
  - Unit tests with Vitest
  - ESLint and Prettier for code quality

## Demonstration of Skills

This project demonstrates the following skills especially relevant to a fullstack developer position at Gigsama:

### 1. Modern Frontend Excellence
- Component-based architecture with clear separation of concerns
- Reusable UI components with TypeScript props validation
- Responsive and accessible design with mobile-first approach
- Advanced React patterns (custom hooks, context providers, higher-order components)
- Optimistic UI updates for immediate user feedback
- Efficient state management with minimal rerenders

### 2. Robust Backend Development
- RESTful API design following best practices
- Secure authentication with proper token handling
- Data validation and sanitization at all input points
- Error handling with detailed logging and graceful recovery
- Caching strategies for performance optimization
- Stateless architecture for horizontal scaling

### 3. AI Integration Expertise
- Sophisticated prompt engineering for reliable outputs
- Stream processing for real-time interaction
- Context management for coherent conversation
- Error handling for AI hallucinations and failures
- Feedback loop for continuous AI improvement

### 4. Software Engineering Excellence
- Clean, maintainable code following SOLID principles
- Comprehensive error handling and logging
- Performance optimization (code splitting, memoization, efficient rendering)
- Accessibility compliance throughout the application
- Security best practices (input validation, XSS prevention, CSRF protection)

## Implementation Details

### Project Management System
- **Project CRUD Operations:** Complete lifecycle management with optimistic UI updates
- **Real-time Updates:** Immediate UI feedback using optimistic updates followed by server confirmation
- **Keyboard Navigation:** Full keyboard support for enhanced accessibility
- **Delete Confirmation:** Two-step deletion process with clear user feedback
- **Error Recovery:** Graceful handling of network failures with retry mechanisms

### Schema Designer
- **Natural Language Interface:** Conversational UI for expressing database requirements
- **Multi-dialect Support:** Generation of SQL and NoSQL schemas from the same conversation
- **Contextual Suggestions:** AI-powered recommendations based on industry best practices
- **Visualization:** Interactive ERD diagrams with relationship highlighting
- **Version Control:** Track changes to schema design over time

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/keymap.git
   cd keymap
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   REDIS_URL=your_redis_url_here
   JWT_SECRET=your_secure_jwt_secret_here
   ```

4. Run the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Flow

1. **Authentication:** Sign in or create a guest session
2. **Project Creation:** Create a new project or select an existing one
3. **Requirements Input:** Enter database requirements in natural language
4. **Conversational Refinement:** Engage with the AI to refine your schema
5. **Visualization:** View and interact with the generated schema in real-time
6. **Export & Share:** Download schema SQL/NoSQL or share your project via URL

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

### Data Flow
1. User actions trigger state updates and API calls
2. Optimistic UI updates provide immediate feedback
3. API calls validate and process data
4. Database operations are performed with proper error handling
5. Response confirms success or provides error details
6. UI updates based on server response

## Future Enhancements

- Team collaboration features with real-time updates
- Enhanced version control with diff visualization
- Code generation for multiple ORM frameworks
- Schema analysis and optimization suggestions
- Advanced visualization options with custom theming
- AI-powered database migration planning

## License

MIT

---

*This project was created as a demonstration of fullstack development skills for a position at Gigsama. It showcases my ability to build production-ready applications with modern technologies and best practices that align perfectly with Gigsama's technical requirements.*

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
