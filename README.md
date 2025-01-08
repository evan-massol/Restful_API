# Library Management API

A RESTful API built with TypeScript for managing a library system, handling books, authors, genres, and users.

## Features

- Complete CRUD operations for books
- Author management with birthdates
- Genre management
- JWT Authentication
- OpenAPI/Swagger documentation
- Admin endpoints and security

## Technologies

- TypeScript
- NodeJS
- Express
- SQLite3
- JWT (JSON Web Token)
- bcrypt for password hashing
- Swagger UI for documentation
- Jest for unit tests

## Prerequisites

- NodeJS (v20 or higher)
- npm (v10 or higher)

## Installation

1. Clone the repository or download the zip file.

2. Navigate to the project directory.

3. Install dependencies:
```bash
npm install
```

4. Build the project:
```bash
npm run build
```

5. Start the server:
```bash
npm run start
```

The server will start on http://localhost:3000

## API Documentation

Interactive API documentation is available at:
http://localhost:3000/documentation

This documentation uses swagger-ui-express and the user can interact with the API directly from the documentation.

## Authentication

The API uses JWT authentication. To access protected endpoints:

1. Create an account via the `/auth/register` endpoint
2. Login via the `/auth/login` endpoint to get a JWT token
3. Copy the token and paste it in the 'Authorize' button in the documentation, then click on 'Authorize'. The token lasts for an hour.

## Endpoints Structure

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login and get a token

### Books
- `GET /books` - List all books
- `GET /books/:id` - Get book details
- `POST /books` - Create a book
- `PUT /books/:id` - Update a book
- `DELETE /books/:id` - Delete a book

### Authors
- `GET /authors` - List all authors
- `GET /authors/:id` - Get author details
- `POST /authors` - Create an author
- `PUT /authors/:id` - Update an author
- `DELETE /authors/:id` - Delete an author

### Genres
- `GET /genres` - List all genres
- `GET /genres/:id` - Get genre details
- `POST /genres` - Create a genre
- `PUT /genres/:id` - Update a genre
- `DELETE /genres/:id` - Delete a genre

### Administration (admin only)
- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `DELETE /users/:id` - Delete a user

## Project Structure

```
src/
├── ts/
│   ├─- database/          # Database management
│   │   ├── DAO/           # DAO declarations
│   │   │   ├── dbDAO/     # DAO definitions
│   │   ├── models/        # Model interfaces
│   │   └── services/      # Services
│   ├── utils/             # Utils (JWT and middleware)
│   ├── app.ts             # Entry point
│   ├── routes.ts          # Route definitions
│   └── swagger.ts         # Swagger configuration
├── tests/                 # Unit tests
└── openapi.yaml           # OpenAPI documentation
```

## Available Scripts

- `npm run build` - Compile TypeScript project and generate the OpenAPI documentation
- `npm run start` - Start the server
- `npm run test` - Run unit tests

## Database

The application uses SQLite as its database. On the first run, it:
- Automatically creates the required tables
- Inserts test data (books, authors, genres)
- Creates an admin account

## Security

- Password hashing with bcrypt
- Route protection with JWT
- Input parameter validation
- Security headers (CSP, CORS)
- Admin rights management

## Testing

Unit tests are written with Jest and cover:
- Book management services
- Author management services
- Genre management services
- Authentication and authorization

To run tests:
```bash
npm run test
```

## Author

Evan MASSOL