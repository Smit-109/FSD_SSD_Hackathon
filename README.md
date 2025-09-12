# **Online Library System**

Welcome to the **Online Library System**, a comprehensive platform for viewing different category of books. Built using the MERN stack, this system provides functionality for browsing and viewing books.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [API Endpoints](#api-endpoints)
6. [Project Structure](#project-structure)
7. [Technologies Used](#technologies-used)
8. [License](#license)

## Project Overview

The **Online Library System** is a **MERN-based application** designed for users to view different category of books. With an intuitive UI, it allows users to browse books by category, search books, add new books, and view detailed information about each book.

### Live Demo

_[Link to Demo](https://online-library-system-mmj030703.onrender.com/)_

---

## Features

- **Add New Books**: Users can add books with details like title, author, category, and publication year.
- **Browse Library**: View all books categorized for easy navigation.
- **Search Books**: Quickly find books.
- **View Book Details**: Access detailed information such as the description, rating, and release year of a book.
- **Responsive Design**: Optimized for all screen sizes.

---

## Installation

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) (local or hosted instance)
- [ImageKit](https://imagekit.io/) (Create ImageKit account)

---

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/mmj030703/Online-Library-System.git
   ```

2. Change Directory

   ```bash
   cd ./backend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file and add the following:

   ```env
   PORT=5000
   DATABASE_NAME=<db_name>
   MONGODB_URI=<mongodb_uri>
   IMAGEKIT_PUBLIC_KEY=<imagekit_publickey>
   IMAGEKIT_PRIVATE_KEY=<imagekit_privatekey>
   IMAGEKIT_URL_ENDPOINT=<imagekit_url_endpoint>
   ```

5. Start the server:

   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5000`.

---

### Frontend Setup

1. Navigate to the frontend repository:

   ```bash
   cd Online-Library-System
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`.

---

## Usage

1. Open the application and browse the library to view available books by category.
2. Users can use the "Add Book" link in the navbar to add new books to the collection.
3. Click on a book to view its detailed information.
4. Use the search bar on the browse page to locate books by title or author.

---

## API Endpoints

#### Base URL

Local Base Url: `http://localhost:5000/api/v1`

Hosted Base Url: `https://online-library-system-97mj.onrender.com/api/v1`

### Books

| Method | Endpoint                    | Description               |
| ------ | --------------------------- | ------------------------- |
| GET    | `/books/all`                | Get all books             |
| POST   | `/books/add`                | Add a new book            |
| GET    | `/books/book/:id`           | Get book details by ID    |
| GET    | `/books/category/:category` | Get books by cateogry ID  |
| GET    | `/books/search`             | Get books by search query |

### Category

| Method | Endpoint                    | Description        |
| ------ | --------------------------- | ------------------ |
| POST   | `/categories/add/:category` | Add a new category |
| GET    | `/categories/all`           | Get all categories |

---

## Project Structure

```plaintext
online-library-system/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Backend logic
│   ├── models/          # Mongoose models
│   ├── routes/          # Backend API routes
│   ├── middlewares/     # Backend middlewares
│   ├── utils/           # Utility files
│   └── server.js        # Backend entry point
├── public/
├── src/
│   ├── components/      # React components
│   ├── utils/           # Utility files
│     ├── store/          # Redux Store
│        ├── slices/          # Redux Slices
│        ├── bookStore.js/          # Redux Store file
│   ├── pages/           # React pages
│   ├── App.jsx          # Application component
│   └── main.jsx         # Frontend entry point
```

---

## Technologies Used

- **Backend**:

  - Node.js, Express, MongoDB, Mongoose, ImageKit

- **Frontend**:
  - React, Tailwind CSS, Redux Toolkit, React Router.

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
