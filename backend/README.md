# HireMate Backend API

A comprehensive backend API for the HireMate interview bot application with AI integration, resume processing, payment handling, and performance analytics.

## Features

### 🤖 AI Integration
- **OpenAI GPT-4 Integration**: Intelligent question generation and answer analysis
- **Resume Analysis**: AI-powered resume parsing and skill extraction
- **Feedback Generation**: Detailed, constructive feedback on interview answers
- **Question Generation**: Dynamic question creation based on job roles and resume content

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

### 🛡️ Security & Performance
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Secure cross-origin resource sharing
- **Input Validation**: Comprehensive input validation with Joi
- **Error Handling**: Centralized error handling and logging
- **Security Headers**: Helmet.js for security headers

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
