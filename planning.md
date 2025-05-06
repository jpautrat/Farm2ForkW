# Planning

## Requirements

### Functional Requirements

1. User Authentication
   - Registration and login for farmers, consumers, and admins.
   - Secure password storage (bcrypt) and JWT-based sessions.
2. Role-Based Access Control
   - Farmers: manage products, view orders, mark as fulfilled.
   - Consumers: browse products, cart, checkout, view own orders.
   - Admins: moderate users and listings, view analytics and logs.
3. Product Management
   - CRUD operations for product listings by farmers.
4. Shopping Cart & Checkout
   - Persistent cart for consumers.
   - Order creation with payment capture.
5. Payment Processing
   - Stripe integration with Payment Intents API.
6. Shipping Rates
   - EasyPost integration for live shipping estimates.
7. Order Fulfillment
   - Farmers mark orders as fulfilled.
8. Admin Panel
   - User moderation, listing approval, analytics dashboard.

## Personas

- **Farmer**: Registers to sell produce, manages listings, fulfills orders.
- **Consumer**: Browses products, places orders, tracks shipments.
- **Admin**: Oversees platform, moderates content, analyzes performance.

## Use Cases

1. Farmer registers and logs in.
2. Farmer adds a new product.
3. Consumer signs up, browses produce, adds to cart, and checks out.
4. Consumer receives live shipping rates at checkout.
5. Admin deactivates a fraudulent user.
6. Farmer marks an order as fulfilled.

## System Architecture

- **Client**: React/Vue/Angular (frontend)
- **Server**: Node.js with Express.js
- **Database**: PostgreSQL accessed via Sequelize ORM
- **Auth**: JWT, stored in HTTP-only cookies
- **Payments**: Stripe API
- **Shipping**: EasyPost API
- **Logging**: Morgan & Winston
- **Testing**: Jest & Supertest

## Database Schema

- **Users** (id, name, email, password, role, status, createdAt, updatedAt)
- **Products** (id, farmerId, name, description, category, price, stock, imageUrl)
- **Orders** (id, consumerId, totalAmount, status, createdAt)
- **OrderItems** (id, orderId, productId, quantity, price)
- **Payments** (id, orderId, stripePaymentIntent, status)
- **Shipping** (id, orderId, rates)

## Security & Compliance

- **Authentication**: JWT with short expiry, refresh tokens (future).
- **Password Security**: bcrypt hashing with salt.
- **Input Validation**: express-validator.
- **Data Protection**: HTTPS mandatory in production.
- **Accessibility**: WCAG 2.1 AA compliance for UI.
- **Logging & Monitoring**: Centralized logs for audit.

## Timeline & Milestones

1. **Setup & Architecture** (Day 1)
2. **Auth & User Roles** (Day 2)
3. **Product & Order APIs** (Day 3)
4. **Payment & Shipping Integrations** (Day 4)
5. **Admin Panel & Analytics** (Day 5)
6. **Testing & CI/CD** (Day 6)
7. **Documentation & Deployment** (Day 7)
