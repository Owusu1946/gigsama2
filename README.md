# Database Schema Creation System

An interactive AI-powered web application that assists users in designing database schemas through guided conversations. Users answer a series of questions posed by an AI model, and based on their responses, the system generates a complete database schema for their project.

## Features

- Interactive AI-powered database schema design assistant
- Real-time schema visualization
- Project-based organization with unique URLs for each schema
- Support for both SQL and NoSQL schema generation
- Fast response times with optimistic UI updates

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Integration**: Google's Gemini AI
- **Storage**: JSON-based file storage for simplicity (can be replaced with a database)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd database-schema-creator
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   You can obtain a Gemini API key from [Google AI Studio](https://ai.google.dev/).

4. Run the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter your database requirements in the input field on the home page
2. The AI assistant will ask clarifying questions to understand your needs
3. As the conversation progresses, a database schema will be generated
4. Each project is saved and accessible via its unique URL

## Design Decisions

### SQL vs NoSQL

The system generates either SQL or NoSQL schemas based on the requirements detected in the conversation. The AI model determines which is more appropriate for the specific use case.

### Storage Mechanism

For simplicity and rapid development, this implementation uses a JSON file-based storage system. In a production environment, this could be replaced with a database like PostgreSQL, MongoDB, or a cloud solution like Firestore.

### AI Integration

The application uses Google's Gemini AI model for both the interactive conversation and schema generation. Gemini was chosen for its strong performance in understanding contextual information and generating structured outputs.

## Future Enhancements

- User authentication system
- Database connectivity to automatically create the generated schema
- Export functionality (SQL scripts, Mongoose schemas, etc.)
- Collaborative editing
- Schema version history

## License

MIT

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
