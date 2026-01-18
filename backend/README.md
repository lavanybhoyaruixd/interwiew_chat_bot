# HireMate Backend API

A comprehensive backend API for the HireMate interview bot application with AI integration, resume processing, payment handling, performance analytics, and job matching.

## Features

### 🤖 AI Integration
- **OpenAI GPT-4 Integration**: Intelligent question generation and answer analysis
- **Resume Analysis**: AI-powered resume parsing and skill extraction
- **Feedback Generation**: Detailed, constructive feedback on interview answers
- **Question Generation**: Dynamic question creation based on job roles and resume content
 - **Contextual Interview Chat**: Refactored controller-based chat endpoints with concise, human-like answers using conversation history
 - **Trend-Aware Responses**: Enhanced AI service considers current year tech trends (placeholder logic)

### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure token-based authentication
- **User Management**: Complete user registration, login, and profile management
- **Role-based Access**: Different access levels for different features
- **Password Security**: Bcrypt hashing and secure password policies

### 📄 Resume Processing
- **PDF Upload**: Support for PDF resume uploads
- **Text Extraction**: AI-powered text extraction from resumes
- **Skill Analysis**: Automatic skill identification and categorization
- **Question Generation**: Resume-based interview questions

### 💳 Payment Integration
- **Stripe Integration**: Complete payment processing with Stripe
- **Subscription Management**: Multiple subscription tiers (Free, Premium, Enterprise)
- **Credit System**: Pay-per-use credit system
- **Webhook Handling**: Secure webhook processing for payment events

### 📊 Analytics & Performance
- **Interview Analytics**: Detailed performance tracking and analytics
- **Progress Tracking**: User improvement over time
- **Session Management**: Complete interview session lifecycle
- **Performance Metrics**: Comprehensive scoring and feedback systems
### 💼 Job Matching (New)
- **Job Board Integration**: Remote listings (Remotive public API stub)
- **Personalized Suggestions**: Matches jobs to resume & interview-derived strengths
- **Skill Overlap Scoring**: Weighted ranking by skill/tag intersection & role relevance
- **Performance Snapshot**: Cached aggregated user metrics for fast matching
 - **RapidAPI jsearch Support**: Automatically used when RapidAPI key is provided

### 🛡️ Security & Performance
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Secure cross-origin resource sharing
- **Input Validation**: Comprehensive input validation with Joi
- **Error Handling**: Centralized error handling and logging
- **Security Headers**: Helmet.js for security headers
 - **Async Handler & Timeouts**: Unified async error capture plus request timeouts to prevent hanging requests
 - **Structured ApiError**: Consistent error shape for future expansion

## Technology Stack

- **Runtime**: Node.js 14+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: OpenAI GPT-4 API
- **Payment Processing**: Stripe API
- **File Processing**: PDF-Parse for resume extraction
- **Validation**: Joi for input validation
- **Logging**: Winston for structured logging
- **Security**: Helmet, CORS, bcryptjs
- **Development**: Nodemon for development

## Installation

### Prerequisites
- Node.js 14 or higher
- MongoDB (local or cloud)
- OpenAI API key
- Stripe account (for payments)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hiremate-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Copy the `.env` file and update the following variables:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/hiremate_db

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

   # Client URL (for CORS)
   CLIENT_URL=http://localhost:5173

   # Job Matching (public API default; override if needed)
   REMOTIVE_API_URL=https://remotive.com/api/remote-jobs

   # Future external job board placeholders (optional)
   ADZUNA_APP_ID=your_app_id
   ADZUNA_APP_KEY=your_app_key
   # RapidAPI jsearch (set key to enable provider)
   RAPIDAPI_JSEARCH_KEY=your_rapidapi_key_here
   RAPIDAPI_JSEARCH_HOST=jsearch.p.rapidapi.com
   ```

4. **Database Setup**
   
   Ensure MongoDB is running. The application will create the database and collections automatically.

5. **Start the Server**
   
   For development:
   ```bash
   npm run dev
   ```
   
   For production:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /change-password` - Change password
- `POST /logout` - Logout user
- `GET /verify-token` - Verify JWT token

### Interview Routes (`/api/interview`)
- `POST /sessions` - Create new interview session
- `GET /sessions` - Get user's interview sessions
- `GET /sessions/:id` - Get specific session details
- `POST /sessions/:id/answer` - Submit answer to question
- `POST /sessions/:id/complete` - Complete interview session
- `POST /upload-resume` - Upload and process resume
- `GET /questions` - Get available questions
- `GET /analytics` - Get user analytics

### Payment Routes (`/api/payments`)
- `GET /plans` - Get available subscription plans
- `POST /create-subscription` - Create new subscription
- `POST /create-payment` - Create payment for credits
- `POST /cancel-subscription` - Cancel subscription
- `GET /billing` - Get billing information
- `POST /webhook` - Stripe webhook handler

### User Routes (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /analytics` - Get user analytics
- `GET /history` - Get interview history
### Job Routes (`/api/jobs`)
- `GET /suggestions` - Get personalized job suggestions

#### Job Provider Selection
The service will choose provider dynamically:
- If `RAPIDAPI_JSEARCH_KEY` is set → uses RapidAPI jsearch (`rapid-jsearch` provider id)
- Else → falls back to Remotive (`remotive` provider id)

Returned job objects include a `provider` field so the frontend can display source.

Example RapidAPI curl (replace token & key stored in backend env):
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" http://localhost:5001/api/jobs/suggestions
```

## API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

The API implements rate limiting:
- **General Routes**: 100 requests per 15 minutes per IP
- **Authentication Routes**: 5 requests per 15 minutes per IP

## File Upload

Resume uploads support:
- **File Types**: PDF only
- **File Size**: Maximum 5MB
- **Processing**: Automatic text extraction and AI analysis

## Webhook Security

Stripe webhooks are secured using webhook signatures. Ensure your webhook endpoint secret is correctly configured.

## Error Handling

The API includes comprehensive error handling:
- **Validation Errors**: Detailed field-level validation messages
- **Authentication Errors**: Clear authentication failure messages
- **Server Errors**: Logged errors with appropriate client responses
- **Rate Limit Errors**: Clear rate limiting messages

## Logging

Winston logging is configured with:
- **Development**: Console logging with colors
- **Production**: File logging with rotation
- **Log Levels**: Error, warn, info, debug
- **Log Files**: `logs/error.log` and `logs/combined.log`

## Testing

Use tools like Postman or curl to test the API endpoints. A Postman collection can be created for easy testing.

## Deployment

### Environment Variables
Ensure all production environment variables are properly set.

### Database
Use MongoDB Atlas or a properly configured MongoDB instance.

### Security
- Use strong JWT secrets
- Enable MongoDB authentication
- Use HTTPS in production
- Configure proper CORS origins

### Monitoring
Consider adding monitoring solutions like:
- Application monitoring (e.g., New Relic, DataDog)
- Error tracking (e.g., Sentry)
- Log aggregation (e.g., ELK stack)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## License

This project is licensed under the ISC License.

## New/Refactored Architecture Notes (Interview Chat & Resume)

### Chat Endpoint Improvements
The legacy inline logic in `routes/chat.js` has been moved into `controllers/chatController.js` for testability and clarity.

Key enhancements:
* Centralized prompt construction focused strictly on interview-related topics.
* Slim, concise response style with optional follow-up; encourages human-like tone.
* Conversation history trimming (last 8 messages, length-limited) for token optimization.
* Timeout wrapper (`withTimeout`) for external AI latency protection.
* Streaming remains via SSE without changing client contract.

### Resume Placeholder
Added future-ready endpoints under `/api/resume`:
* `POST /api/resume/analyze` – queues an analysis job (currently returns immediate preview).
* `GET /api/resume/status/:jobId` – stub status endpoint for later job queue integration.
Controller: `controllers/resumeController.js`.
Existing upload flow (`/api/interview/upload-resume`) untouched.

### Error Handling Strategy
* `utils/ApiError.js` defines a light custom error for domain-specific errors.
* Global error handler in `server.js` remains; future improvement: map `ApiError` automatically.
* Async route handlers wrapped by `middleware/asyncHandler.js` to remove try/catch repetition.

### Token & Cost Optimization
* History truncation and per-message length capping reduce unnecessary tokens.
* Temperature lowered for explanation/help routes for deterministic coaching tone.
* Distinct system prompt ensures domain gating minimizing irrelevant expansions.

### Scalability Recommendations (Next Steps)
1. Introduce a message persistence layer (Redis or Mongo collection) for multi-device continuity.
2. Implement a job queue (BullMQ, Redis Streams, or AWS SQS) for heavy resume analysis and future ML classification.
3. Add circuit breaker / retry logic around external AI calls (e.g., `opossum` library) to maintain resilience.
4. Implement bulk token usage metrics logging for cost governance.
5. Add request-level correlation IDs (attach to logger context) for distributed tracing readiness.
6. Add test harness for controllers (Jest + supertest) focusing on prompt boundaries & classification accuracy.

### Conversation State Strategy
Recommended shape for persisted state (per user):
```
{
   userId: ObjectId,
   messages: [ { role: 'user'|'assistant', content: string, ts: Date } ],
   lastDomain: 'frontend' | 'backend' | 'data-science' | null,
   experienceLevel: 'junior' | 'mid' | 'senior' | 'lead',
   resumeEmbeddingId: string | null,
   totalTokensUsed: number
}
```
Persist only recent subset; archive older messages into cold storage or summary embeddings.

### Future Resume Analysis Pipeline (Concept)
1. Upload PDF -> extract text -> generate skill vector (embedding).
2. Compare extracted skills against role-specific skill matrix (curated JSON or DB).
3. Gap detection: missing skills vs. required cluster weights.
4. Generate personalized question batch weighted by gaps + strengths.
5. Provide improvement roadmap (learning resources suggestions).

### Security Hardening Roadmap
* Enforce JWT rotation & refresh token pattern.
* Rate limit per-user + global sliding window using Redis.
* Validate AI outputs for length & sanitize before storing.
* PDF malware scanning (ClamAV container) prior to parsing.
* Content moderation on inputs to avoid prompt injection attempts.

### Monitoring & Observability
Recommend exporting structured metrics:
* `ai_completion_latency_ms`
* `ai_tokens_input` / `ai_tokens_output`
* `resume_processing_time_ms`
* `chat_classification_calls`
Use Prometheus + Grafana or a managed service.

### Testing Suggestions
* Unit: classification prompt returns YES/NO quickly.
* Integration: SSE stream returns chunks then done.
* Regression: resume placeholder returns 202 with preview.
