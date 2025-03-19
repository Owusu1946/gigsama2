# Database Schema Creation System Test

## Overview
Build a web application that assists users in designing their own database schemas through an interactive AI-powered experience. Users will answer a series of guided questions posed by an AI model, and based on their responses, the system will generate a complete database schema for their project. This schema can be either SQL or NoSQL, depending on your design decision. Each generated schema is treated as an individual project, accessible via its own unique URL (e.g., `myapp.com/project-1`).

## Requirements

### Frontend
- **User Interface:**  
  - Implement a simple, responsive web interface following the design guidelines provided in the Figma link.  
  - Include a home page with an option to create a new project.
  - Display an interactive session where an AI model asks the user questions to collect information about the intended database.

- **Project Pages:**  
  - Each generated database schema should have its own unique URL.
  - Provide an intuitive way for users to view, edit, and save their schema.

### Backend
- **API & Data Handling:**  
  - Create a backend service that interacts with the AI model and processes the user responses.
  - Integrate with an AI provider (e.g., OpenAI, Hugging Face, etc.) to generate the database schema based on user input.
  - Implement proper error handling and data validation.

- **Schema Generation & Storage:**  
  - The generated schema can be SQL or NoSQL—choose one and justify your choice in the ReadME.
  - Persist each generated schema in your backend using your preferred storage method (a database, file storage, etc.).
  - Allow users to retrieve and view past projects via unique project URLs.

### AI Integration
- **Interactive Session:**  
  - Leverage any LLM provider to power the interactive Q&A session.
  - The AI should ask relevant questions to understand the project requirements and generate a database schema accordingly.
  - You are free to use any AI model and tools (Stack Overflow, documentation, etc.) to assist you in the implementation.

### Documentation & Testing
- **ReadME Documentation:**  
  - Include a straightforward ReadME that explains your design decisions and technology choices.
  - Detail how you implemented the AI integration, schema generation, and storage mechanisms.
  - Provide instructions for setting up and running the project.
  - If possible, include a demo or a link to a live version of the project.

