# PayPal Integration Project

This project implements a PayPal integration for managing subscriptions and payments. It provides a backend service that interacts with the PayPal API to create, update, and manage user subscriptions, as well as handle webhook events for subscription updates.

## Project Structure

```
paypal-integration-project
├── src
│   ├── index.ts               # Entry point of the application
│   ├── config                  # Configuration files
│   │   ├── paypal.ts           # PayPal API configuration
│   │   └── firebase.ts         # Firebase configuration
│   ├── services                # Business logic services
│   │   ├── paypal.ts           # PayPal API interaction functions
│   │   └── subscription.ts      # Subscription management functions
│   ├── handlers                # Request handlers
│   │   ├── webhook.ts          # Webhook event handling
│   │   ├── subscription.ts      # Subscription request handling
│   │   └── payment.ts          # Payment processing functions
│   ├── types                   # TypeScript types and interfaces
│   │   ├── paypal.ts           # PayPal API types
│   │   └── subscription.ts      # Subscription types
│   ├── utils                   # Utility functions
│   │   ├── logger.ts           # Logging utility
│   │   └── validation.ts       # Input validation functions
│   └── middleware              # Middleware functions
│       ├── auth.ts             # Authentication middleware
│       └── cors.ts             # CORS middleware
├── tests                       # Test files
│   ├── unit                    # Unit tests
│   │   ├── services            # Unit tests for services
│   │   │   └── paypal.test.ts  # PayPal service tests
│   │   └── handlers            # Unit tests for handlers
│   │       └── subscription.test.ts # Subscription handler tests
│   └── integration             # Integration tests
│       └── webhook.test.ts     # Webhook handler tests
├── package.json                # NPM configuration
├── tsconfig.json               # TypeScript configuration
├── jest.config.js              # Jest configuration
├── .env.example                # Example environment variables
└── README.md                   # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd paypal-integration-project
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values, such as PayPal API credentials and Firebase configuration.

4. **Run the application:**
   ```
   npm start
   ```

5. **Run tests:**
   ```
   npm test
   ```

## API Endpoints

- **Create Subscription:** `POST /api/subscription`
- **Webhook Handler:** `POST /api/webhook`

Refer to the individual handler files for more details on request and response formats.

## License

This project is licensed under the MIT License. See the LICENSE file for more information.