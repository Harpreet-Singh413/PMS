# Product Management System (PMS)

A modern, full-stack web application designed for secure and efficient product catalog management. Built with a **React** (Vite) frontend, a **Spring Boot** backend, and **MongoDB** as the database layer.

This project implements Role-Based Access Control (RBAC) to ensure that only authorized administrators can modify product data, while regular users have read-only access to browse the catalog and view dashboards.

## ✨ Features

- **Secure Authentication:** JWT-based stateless authentication with securely hashed passwords (BCrypt).
- **Role-Based Access Control (RBAC):** Server-side enforcement distinguishing between `USER` (read-only) and `ADMIN` (read, create, update, delete).
- **Product Catalog Management:** Fully functional CRUD operations for products (pending Phase 6 implementation).
- **Dashboard:** Role-specific statistical summaries (e.g., total products, low stock alerts).
- **Modern UI:** Built with Tailwind CSS featuring a premium glassmorphic dark-mode aesthetic, micro-animations, and responsive design.

## 🛠️ Tech Stack

### Frontend
- **React 18** (bootstrapped with Vite)
- **Tailwind CSS v3** (styling and responsive design)
- **React Router DOM** (client-side routing)
- **Axios** (API communication with request/response interceptors)
- **Lucide React** (beautiful, consistent iconography)

### Backend
- **Java 17 & Spring Boot 3**
- **Spring Security** (JWT authentication & method-level security)
- **Spring Data MongoDB**
- **Hibernate Validator** (input validation)
- **JJWT** (JSON Web Token generation & validation)

### Database
- **MongoDB Atlas** (NoSQL Document database)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Java Development Kit (JDK)](https://adoptium.net/) (v17 recommended)
- [Maven](https://maven.apache.org/)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB instance)

### Backend Setup (Spring Boot)

1. Navigate to the backend directory:
   ```bash
   cd SpringBoot_Backend
   ```

2. Configure your environment variables:
   Ensure you have the `MONGODB_URI` environment variable set on your machine, pointing to your MongoDB connection string. Alternatively, update `src/main/resources/application.properties` directly:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://<username>:<password>@cluster.mongodb.net/product_management_system
   ```

3. Build and run the backend:
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

### Frontend Setup (React + Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`.

---

## 🏗️ Project Structure

```text
PMS/
├── frontend/                 # React UI
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # AuthContext for global session state
│   │   ├── pages/            # Register, Login, Dashboard, Product Catalog
│   │   ├── services/         # Axios API instance and endpoint functions
│   │   └── App.jsx           # Routing configuration
│   └── tailwind.config.js    # Tailwind theme configuration
│
└── SpringBoot_Backend/       # Spring Boot API
    ├── src/main/java/com/example/SpringBoot_Backend/
    │   ├── Config/           # App configurations (e.g., MongoConfig)
    │   ├── Controller/       # REST API endpoints
    │   ├── DTO/              # Data Transfer Objects
    │   ├── Exception/        # Global exception handling
    │   ├── Model/            # MongoDB Document entities
    │   ├── Repository/       # Spring Data Mongo repositories
    │   ├── Security/         # JWT Utils, Filters, and Security Config
    │   └── Service/          # Business logic layer
    └── pom.xml               # Maven dependencies (Java 17)
```

---

## 🛡️ API Endpoints Summary

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/register` | Register a new user (`USER` role) | Public |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT | Public |
| `GET`  | `/api/products` | Retrieve paginated product catalog | Authenticated |
| `POST` | `/api/products` | Create a new product | `ADMIN` only |
| `PUT`  | `/api/products/{id}` | Update an existing product | `ADMIN` only |
| `DELETE`| `/api/products/{id}`| Delete a product | `ADMIN` only |
| `GET`  | `/api/dashboard/summary` | Get role-specific statistics | Authenticated |

*(Note: Product CRUD endpoints are scheduled for Phase 6 of development).*

---

## 🔮 Future Enhancements (Out of Scope for Initial Release)
- Refresh token rotation & HTTP-only cookies for enhanced security.
- Email verification & password reset workflows.
- Admin UI for user role management (promoting users to Admin).
- Image uploads for product listings.
- Advanced analytics & charting on the Dashboard.

---
*Developed as an internship project demonstrating clean architecture, secure REST API design, and modern frontend styling.*
