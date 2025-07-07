# PayPal Integration Project

This project implements a PayPal integration for managing subscriptions and handling webhook events. It is designed to provide a seamless experience for users to subscribe to services and for the application to manage those subscriptions effectively.

## Project Structure

- **src/**: Contains the source code for the application.
  - **config/**: Configuration files for PayPal and Firebase.
  - **controllers/**: Classes that handle incoming requests related to subscriptions and webhooks.
  - **services/**: Functions that interact with PayPal and Firestore.
  - **middleware/**: Middleware functions for authentication and validation.
  - **types/**: TypeScript types and interfaces for PayPal, subscriptions, and Firebase.
  - **utils/**: Utility functions for logging and error handling.
  - **index.ts**: Entry point of the application.

- **tests/**: Contains unit and integration tests for the application.
  - **unit/**: Unit tests for services and controllers.
  - **integration/**: Integration tests for webhook functionality.

- **.env.example**: Example environment variables needed for the project.
- **.gitignore**: Specifies files and directories to be ignored by Git.
- **package.json**: Configuration file for npm, listing dependencies and scripts.
- **tsconfig.json**: TypeScript configuration file.

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd paypal-integration-project
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env` and fill in the required values for PayPal and Firebase configurations.

4. **Run the application**:
   ```
   npm start
   ```

5. **Run tests**:
   ```
   npm test
   ```

## Usage

- The application provides endpoints for creating and managing subscriptions via PayPal.
- Webhook events from PayPal are processed to update subscription statuses and handle payments.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.