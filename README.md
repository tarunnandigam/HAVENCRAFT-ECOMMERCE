# HavenCraft E-commerce

A modern, responsive e-commerce platform for handmade and artisanal products. This project features a beautiful user interface, product catalog, shopping cart, and user authentication.

## 🌟 Features

- 🛍️ Product catalog with categories
- 🛒 Shopping cart functionality
- 🔐 User authentication (login/register)
- 📱 Fully responsive design
- 🚀 Fast and lightweight
- 🐳 Docker support for easy deployment

## Prerequisites

- Node.js (v14 or higher)
- Docker (optional, for containerization)
- Git

## Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/tarunnandigam/HAVENCRAFT-ECOMMERCE.git
   cd HAVENCRAFT-ECOMMERCE
   ```

2. **Open in browser**
   - Simply open `index.html` in your browser, or
   - Use a local server like Live Server in VS Code

## 🐳 Docker Setup

### Prerequisites
- Docker installed on your system
- Docker Compose (usually comes with Docker Desktop)

### Running with Docker

1. **Build and run using Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   Open your browser and go to: `http://localhost:80`

### Docker Commands

- **Build the Docker image**:
  ```bash
  docker build -t havencraft-ecommerce .
  ```

- **Run the container**:
  ```bash
  docker run -p 80:80 havencraft-ecommerce
  ```

- **Stop the container**:
  ```bash
  docker-compose down
  ```

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **UI Components**: Custom CSS with Flexbox and Grid
- **State Management**: Browser's LocalStorage
- **Build Tool**: None (Vanilla JS)
- **Containerization**: Docker

## 📂 Project Structure

```
HavenCraft-Ecommerce/
├── css/               # Stylesheets
│   ├── components/    # Component styles
│   ├── layout/        # Layout styles
│   └── pages/         # Page-specific styles
├── img/              # Image assets
├── js/               # JavaScript files
│   └── single-product/
├── index.html        # Main entry point
├── Dockerfile        # Docker configuration
└── docker-compose.yml # Docker Compose configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For any inquiries, please reach out to [tarunnandigam29@gmail.com](mailto:tarunnandigam29@gmail.com)
