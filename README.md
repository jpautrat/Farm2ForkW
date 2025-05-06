# Farm2Fork

Farm2Fork is a local direct-to-consumer e-commerce platform enabling farmers to sell produce, dairy, and meats directly to consumers with integrated payment and shipping.

## Features

- Role-based authentication (Farmers, Consumers, Admins)
- Farmers manage products and fulfill orders
- Consumers browse, cart, checkout with Stripe/PayPal payments
- Real-time shipping rates via EasyPost
- Admin dashboard for user and content moderation, analytics
- RESTful JSON API backend

## Tech Stack

- Node.js, Express.js
- PostgreSQL with Sequelize ORM
- JWT authentication
- Stripe & PayPal for payments
- EasyPost API for shipping rates
- Jest & Supertest for testing
- Netlify for front-end deployment, Render for backend (suggested)

## Getting Started

### Prerequisites

- Node.js v14+
- PostgreSQL database
- .env configured (see .env.example)

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/yourusername/farm2fork.git
   cd farm2fork
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Setup environment variables
   ```bash
   cp .env.example .env
   ```
4. Run migrations and seed data
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
5. Start the server
   ```bash
   npm run dev
   ```

API is available at `http://localhost:5000`

## API Reference

### Auth

- `POST /auth/register` - Register user `{ name, email, password, role }`
- `POST /auth/login` - Login `{ email, password }` => `{ token }`

### Products

- `GET /products` - List products
- `GET /products/:id` - Get product
- `POST /products` - Create product (Farmer)
- `PUT /products/:id` - Update product (Farmer)
- `DELETE /products/:id` - Delete product (Farmer)

### Orders

- `GET /orders` - Get orders (role-specific)
- `POST /orders` - Create order `{ items, shippingCost, shippingAddress }`
- `PUT /orders/:id/status` - Update order status (Farmer/Admin)

### Payments

- `POST /payments/intent` - Create Stripe Payment Intent `{ amount, currency }`

### Shipping

- `POST /shipping/rates` - Get shipping rates `{ toAddress, fromAddress, parcel }`

### Admin

- `GET /admin/users`
- `PUT /admin/users/:id`
- `GET /admin/products`
- `GET /admin/analytics`

## Testing

```bash
npm test
```

Coverage reports in `coverage/`.

## License

This project is licensed under the MIT License.
