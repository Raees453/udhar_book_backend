# Mera Udhar - NodeJS Application (Backend)

## Project Description

This project is a backend implementation of a Splitwise-like application, built using Node.js. It provides a robust API for user registration, authentication, and expense management, mirroring the core functionality of the popular bill-splitting app, Splitwise. The project is currently in beta stage, with approximately 70% of the planned features implemented.

## Key Features

- User registration and authentication using phone numbers
- Secure API endpoints accessible only to logged-in users
- Contact management (CRUD operations)
- Expense creation and management
- FCM (Firebase Cloud Messaging) for notifications
- Twilio integration for phone number verification and OTP

## Technology Stack

- **Backend Framework**: Node.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Cloud Messaging**: Firebase Cloud Messaging (FCM)
- **Phone Verification**: Twilio
- **Deployment**: AWS (EC2 for compute, RDS for database)

## Architecture

The project follows the MVC (Model-View-Controller) architectural pattern.

## Project Status

The project is currently in beta, with approximately 70% of the planned features implemented. A Flutter-based frontend is also in progress.

## API Overview

The backend consists of around 30 API endpoints, covering functionalities such as:

- User authentication
- Contact management
- Expense tracking and management
- Notifications

## Database Schema

The current database schema consists of 6-7 tables, including (but not limited to):

- Users
- Contacts
- Expenses
- Groups (if applicable)

## Security Measures

- JWT for secure authentication
- Secure connections for data access
- Authentication middleware for protected routes

## Deployment

The project is planned to be deployed on AWS, utilizing the following services:
- EC2 for hosting the Node.js application
- RDS for managing the PostgreSQL database

Specific deployment instructions and configurations will be added upon completion.

## Installation and Setup

To get the project running locally, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/splitwise-clone-backend.git
   cd meraudhar-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
    - Create a `.env` file in the root directory
    - Add the following variables (replace with your actual values):
      ```
      DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
      JWT_SECRET='Your JWT SECRET'
      JWT_EXPIRES_IN='YOUR_TIME_TO_EXPIRE_JWT'
      ENVIRONMENT='development'
      OTP_HASH="YOUR_OTP_HASH"
      ```

4. Set up the database:
   ```
   npx prisma migrate dev
   ```

5. Start the server:
   ```
   npm run start
   ```

The server should now be running on `http://localhost:3000` (or your specified port).

## System Architecture

Here's a high-level overview of the system architecture:

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  Flutter Client  | <-> |   Node.js API    | <-> |  PostgreSQL DB   |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
                               ^      ^
                               |      |
                   +-----------+      +-----------+
                   |                              |
          +------------------+            +------------------+
          |                  |            |                  |
          |     Twilio       |            |       FCM        |
          |                  |            |                  |
          +------------------+            +------------------+
```

This diagram illustrates the main components of the system and their interactions.

## Challenges and Solutions

During the development of this project, we encountered several challenges:

1. **Real-time updates**: Implementing real-time updates for expense changes was challenging. We solved this by integrating Firebase Cloud Messaging, allowing us to push notifications to clients when relevant data changes.

2. **Phone number verification**: To ensure security in user registration, we needed a reliable way to verify phone numbers. We integrated Twilio's API for sending and verifying OTPs, which provided a robust solution.

3. **Database schema design**: Designing a flexible schema that could accommodate various types of expenses and group arrangements took several iterations. We ultimately settled on a design that uses a combination of relational tables and JSON fields for maximum flexibility.

## Lessons Learned

Throughout the development process, several key lessons were learned:

1. **The importance of proper planning**: Spending more time on system design and database schema planning at the beginning could have saved time during later stages of development.

2. **The value of third-party services**: Integrating services like Twilio and FCM, while initially seeming complex, ultimately saved a significant amount of development time and improved the robustness of our solution.

3. **The need for comprehensive testing**: As the project grew, the lack of a testing framework became more apparent. In future iterations, implementing a testing strategy from the beginning would be beneficial.

4. **The benefits of the MVC pattern**: Using the MVC pattern helped in organizing the codebase and making it more maintainable. It also made it easier to onboard new developers to the project.

5. **The importance of documentation**: Keeping API documentation up-to-date proved crucial, especially when coordinating with the frontend team developing the Flutter client.

## Future Enhancements

In addition to the previously mentioned future enhancements, we are also considering:

1. Implementing WebSocket connections for real-time updates to improve efficiency.
2. Adding support for multiple currencies and automatic currency conversion.
3. Implementing more advanced analytics for expense trends and insights.
4. Exploring the possibility of integrating with popular payment gateways for in-app settlements.
5. Adding CI/CD Pipelines to the Project for Automation

## Contributing

We welcome contributions to this project! If you're interested in contributing, please follow these steps:

1. Fork the repository
2. Create a new branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code adheres to our coding standards and includes appropriate tests.

## Contact

Ali Wajdan - [@linkedin](https://www.linkedin.com/in/aliwajdanpasha) - raeesali453@gmail.com

Project Link: [https://github.com/Raees453/udhar_book_backend.git](https://github.com/Raees453/udhar_book_backend.git)
