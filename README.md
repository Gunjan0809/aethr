# Aethr - AI-Powered Study Assistant

Aethr is a comprehensive AI-driven study platform designed to help students manage their academic workload and enhance their learning experience through gamification and artificial intelligence.

## 🚀 Key Features

### 🧠 AI Study Companion
- **General Study Chat**: A smart assistant powered by Google Gemini to answer academic questions and explain complex topics in a student-friendly manner.
- **Context-Aware Document Chat**: Upload your study materials (PDFs) and ask questions specifically about the content of those documents. The AI extracts text from PDFs to provide precise, source-backed answers.
- **Automated Material Generation**: Instantly generate structured study aids, including:
    - **Flashcards**: Question-and-answer pairs for active recall.
    - **Quizzes**: Multiple-choice questions to test your knowledge.

### 🎮 Gamified Task Management
- **Academic Tracking**: Manage exams, daily study goals, and other academic tasks.
- **XP & Leveling System**: Earn Experience Points (XP) by completing tasks. As you accumulate XP, your level increases, turning studying into a rewarding game.
- **Progress Tracking**: Keep track of deadlines and completion status of your academic goals.

### 📂 Document Management
- **Secure Storage**: Study documents are stored securely using AWS S3.
- **PDF Processing**: Automatic text extraction from uploaded PDFs to power the AI's contextual understanding.
- **Organized Library**: Manage your uploaded resources with titles, subjects, and resource types.

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (Express)
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Google Gemini API
- **Cloud Storage**: AWS S3
- **Security**: JWT for authentication, Helmet for HTTP header security, BcryptJS for password hashing.

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: CSS (with PostCSS)

## 📂 Project Structure

```text
aethr/
├── backend/                # Express API server
│   ├── config/             # Database and S3 configurations
│   ├── middleware/         # Authentication and security middleware
│   ├── models/             # Mongoose schemas (User, Task, Document)
│   └── routes/             # API endpoints (AI, Tasks, Documents, Auth, etc.)
└── frontend/               # React application
    ├── public/             # Static assets
    └── src/                # React components and logic
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB account
- AWS account (for S3 bucket)
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aethr
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_BUCKET_NAME=your_s3_bucket_name
   AWS_REGION=your_aws_region
   CLIENT_URL=http://localhost:5173
   ```
   Start the backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

## 🛡️ Security & Architecture
- **Authentication**: All protected routes require a valid JWT passed in the request headers.
- **S3 Security**: Uses signed URLs for both uploading and viewing documents, ensuring that files are not publicly accessible.
- **Error Handling**: Centralized error handling middleware in the backend ensures consistent API responses.
