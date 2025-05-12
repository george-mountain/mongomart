## MongoMart - MongoDB, GRIDFS, FASTAPI, REACTJS VITE.

This is one of my tutorials that shows how to work with FARM stack - FastAPI, REACTJS and MongoDB.

### Getting Started

To run the MongoMart application, follow the steps below:

#### Backend (FastAPI + MongoDB)
1. Ensure you have Docker installed on your system.
2. Navigate to the root directory of the project.
3. Run the following command to start the backend:
    ```bash
    docker compose up --build
    ```
4. Once the backend is running, you can access the API documentation at:
    - [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### Frontend (ReactJS + Vite)
1. Navigate to the `mongomart-react` directory:
    ```bash
    cd mongomart-react
    ```
2. Install the dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```
4. Access the frontend UI at:
    - [http://localhost:5173/](http://localhost:5173/)

### Project Structure

The project is organized as follows:

```
MONGODB-FASTAPI/
├── app/  #backend API
│   ├── auth.py
│   ├── crud.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── schemas.py
├── mongomart-react/  # Frontend
│   ├── node_modules/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── modals/
│       │   ├── Footer.jsx
│       │   ├── ItemCard.jsx
│       │   ├── Loader.jsx
│       │   ├── Modal.jsx
│       │   ├── Navbar.jsx
│       ├── contexts/
│       │   ├── AuthContext.jsx
│       │   ├── ModalContext.jsx
│       │   └── NotificationContext.jsx
│       ├── pages/
│       ├── services/
│       │   └── api.js
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       └── .env
├── .gitignore
├── README.md
├── docker-compose.yml
└── Dockerfile
```

### Notes
- Ensure that the `.env` file in the `mongomart-react/src/` directory is properly configured for the frontend.
- The backend uses MongoDB as the database, so ensure that the MongoDB service is running correctly within the Docker container.
