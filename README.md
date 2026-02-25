# Order Management System - Backend

A RESTful API backend for managing restaurant orders, menu items, and customer information built with Node.js, Express, and PostgreSQL.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Architecture](#architecture)

## Overview

This backend system provides a complete order management solution for restaurants, enabling:
- Menu item management and retrieval
- Order creation with multiple items
- Order tracking and status management
- Customer information management
- Real-time order processing with transaction support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM/Query**: Raw SQL with pg (node-postgres)
- **Validation**: express-validator
- **Real-time**: Socket.io
- **Transpiler**: Babel (ES6+ support)
- **Development**: Nodemon

### Key Dependencies

```json
{
  "express": "^4.18.2",
  "pg": "^8.18.0",
  "express-validator": "^7.3.1",
  "socket.io": "^4.8.3",
  "cors": "^2.8.6",
  "dotenv": "^16.6.1"
}
```

## Project Structure

```
order-management-backend/
├── src/
│   ├── app.js                      # Application entry point
│   ├── controllers/                # Request handlers
│   │   ├── health/
│   │   │   └── index.js           # Health check controller
│   │   ├── menu-items/
│   │   │   └── index.js           # Menu items controller
│   │   └── orders/
│   │       └── index.js           # Orders controller
│   ├── routes/                     # API route definitions
│   │   ├── health/
│   │   │   └── index.js           # Health check routes
│   │   ├── menu-items/
│   │   │   └── index.js           # Menu items routes
│   │   ├── orders/
│   │   │   └── index.js           # Orders routes
│   │   └── wrap-routes.js         # Route aggregator
│   ├── services/                   # Business logic layer
│   │   ├── menu-items.js          # Menu items service
│   │   └── orders.js              # Orders service
│   ├── models/
│   │   └── db.js                  # Database connection
│   ├── validators/
│   │   └── orders.js              # Request validation rules
│   └── helpers/
│       ├── api-response.js        # Standardized API responses
│       ├── query-generator.js     # Dynamic SQL query builder
│       └── index.js               # Helper exports
├── .babelrc                        # Babel configuration
├── .env                            # Environment variables
├── .gitignore
├── package.json
└── README.md
```

### Architecture Layers

1. **Routes Layer** (`/routes`): Defines API endpoints and applies middleware
2. **Controllers Layer** (`/controllers`): Handles HTTP requests/responses
3. **Services Layer** (`/services`): Contains business logic and database operations
4. **Models Layer** (`/models`): Database connection and configuration
5. **Validators Layer** (`/validators`): Input validation rules
6. **Helpers Layer** (`/helpers`): Utility functions and response formatters

## Database Schema

### Tables

#### `menu_items`
```sql
- id (UUID, Primary Key)
- name (VARCHAR)
- description (TEXT)
- price (NUMERIC)
- image_url (VARCHAR)
- category (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `orders`
```sql
- id (UUID, Primary Key)
- customer_name (VARCHAR, 120 chars max)
- address (TEXT)
- phone (VARCHAR, 20 chars max)
- status (VARCHAR) - Default: 'Order Received'
- total_amount (NUMERIC)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `order_items`
```sql
- id (UUID, Primary Key)
- order_id (UUID, Foreign Key -> orders.id)
- menu_item_id (UUID, Foreign Key -> menu_items.id)
- quantity (INTEGER)
- price_at_order (NUMERIC)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Relationships
- One Order has many Order Items (1:N)
- One Menu Item can be in many Order Items (1:N)

## API Endpoints

### Health Check

#### `GET /health`
Check if the API is running.

**Response:**
```json
{
  "success": true,
  "message": "API is healthy"
}
```

---

### Menu Items

#### `GET /menu-items`
Retrieve all menu items.

**Response:**
```json
{
  "success": true,
  "message": "Menu items retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Pizza Margherita",
      "description": "Classic Italian pizza",
      "price": 12.99,
      "image_url": "https://...",
      "category": "Pizza",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### Orders

#### `POST /orders`
Create a new order with multiple items.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "address": "123 Main St, City, State 12345",
  "phone": "+1234567890",
  "totalAmount": 45.97,
  "status": "Order Received",
  "orderItems": [
    {
      "menuItemId": "uuid-of-menu-item",
      "quantity": 2,
      "priceAtOrder": 12.99
    },
    {
      "menuItemId": "uuid-of-another-item",
      "quantity": 1,
      "priceAtOrder": 19.99
    }
  ]
}
```

**Validation Rules:**
- `customerName`: Required, string, 1-120 characters
- `address`: Required, string
- `phone`: Required, string, 1-20 characters
- `totalAmount`: Required, numeric, >= 0
- `orderItems`: Required, non-empty array
- `orderItems[].menuItemId`: Required, valid UUID
- `orderItems[].quantity`: Required, integer >= 1
- `orderItems[].priceAtOrder`: Required, numeric, >= 0
- `status`: Optional, string

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "uuid",
    "customer_name": "John Doe",
    "address": "123 Main St, City, State 12345",
    "phone": "+1234567890",
    "status": "Order Received",
    "total_amount": 45.97,
    "created_at": "2024-01-01T00:00:00Z",
    "order_items": [...]
  }
}
```

**Transaction Handling:**
- Uses PostgreSQL transactions (BEGIN/COMMIT/ROLLBACK)
- Ensures atomicity: either all items are inserted or none
- Automatic rollback on any error

---

#### `GET /orders`
Retrieve all orders with item counts.

**Response:**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "customer_name": "John Doe",
      "address": "123 Main St",
      "phone": "+1234567890",
      "status": "Order Received",
      "total_amount": 45.97,
      "items_count": "2",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### `GET /orders/:id`
Retrieve a specific order by ID with full details.

**URL Parameters:**
- `id`: UUID of the order

**Validation:**
- `id` must be a valid UUID

**Response:**
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "id": "uuid",
    "customer_name": "John Doe",
    "address": "123 Main St",
    "phone": "+1234567890",
    "status": "Order Received",
    "total_amount": 45.97,
    "created_at": "2024-01-01T00:00:00Z",
    "order_items": [
      {
        "id": "uuid",
        "order_id": "uuid",
        "menu_item_id": "uuid",
        "quantity": 2,
        "price_at_order": 12.99,
        "name": "Pizza Margherita",
        "description": "Classic Italian pizza",
        "image_url": "https://..."
      }
    ]
  }
}
```

**Error Response (Not Found):**
```json
{
  "success": false,
  "error": true,
  "message": "Order not found"
}
```

---

### Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": true,
  "message": "Error description",
  "err": {} // Error details (in development)
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `500`: Internal Server Error

## Setup & Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (or Neon account)

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd order-management-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
PORT=8080
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

4. **Set up the database**
Create the required tables in your PostgreSQL database:
```sql
-- Create tables (schema provided above)
-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | `8080` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |

## Running the Application

### Development Mode
```bash
npm run dev
```
Runs with Nodemon and Babel for hot-reloading and ES6+ support.

### Production Mode
```bash
# Build the application
npm run build

# Start the server
npm start
```

The server will start on `http://localhost:8080` (or your configured PORT).

## Architecture

### Design Patterns

1. **MVC Pattern**: Separation of concerns with Models, Views (JSON responses), and Controllers
2. **Service Layer Pattern**: Business logic isolated in service files
3. **Repository Pattern**: Database operations abstracted in services
4. **Middleware Pattern**: Validation and error handling as middleware

### Key Features

- **Transaction Management**: Database transactions for order creation
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Centralized error handling with consistent responses
- **CORS Support**: Cross-origin resource sharing enabled
- **Query Builder**: Dynamic SQL query generation for INSERT/UPDATE operations
- **Connection Pooling**: Efficient database connection management

### Helper Utilities

#### API Response Helper
Standardized response formats:
- `success()`: 200 OK responses
- `badRequest()`: 400 Bad Request
- `internalServerError()`: 500 Server Error

#### Query Generator
Dynamic SQL query builder:
- `generateInsertQuery()`: Creates INSERT statements with RETURNING clause
- `generateUpdateQuery()`: Creates UPDATE statements with timestamp

### Database Connection

- Uses connection pooling for performance
- SSL enabled for secure connections
- Automatic reconnection on connection loss
- Error handling and logging

## Future Enhancements

- [ ] Order status update endpoint
- [ ] Menu item CRUD operations
- [ ] Authentication and authorization
- [ ] Order history and analytics
- [ ] Real-time order updates via Socket.io
- [ ] Payment integration
- [ ] Order cancellation
- [ ] Delivery tracking
- [ ] Admin dashboard APIs

## License

ISC

## Author

RaftLabs
