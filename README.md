# Expense Tracker

## Overview

Expense Tracker is a web application designed to help users manage their expenses. Users can register, log in, add, view, update, delete expenses, and view the total and count of their expenses. The backend is powered by Node.js with Express, and the frontend uses HTML, CSS, and JavaScript.

## Project Setup

### Prerequisites

- Node.js
- MySQL

### Installation

**1.** Clone the repository:
`git clone https://github.com/yourusername/expense-tracker.git`
`cd expense-tracker`

**2.** Install dependencies:
`npm install`

**3.** Set up environment variables:
Create a `.env` file in the root directory and add the following:
`PORT=3000`
`DB_HOST=your_database_host`
`DB_USER=your_database_user`
`DB_PASSWORD=your_database_password`

**4.** Set up MySQL database:

- Ensure your MySQL server is running.
- The application will automatically create the database and required tables upon startup if they don't exist.

### Running the Application

**1.** Start the server:
`node server.js`
The server will run on `http://localhost:3000`.

**2.** Open the application:
Open your browser and navigate to `http://localhost:3000`.

## Dependencies

- express: Web framework for Node.js
- express-session: Session middleware for Express
- mysql2: MySQL client for Node.js
- bcryptjs: Library to hash passwords
- cors: Middleware to enable CORS
- dotenv: Module to load environment variables
- body-parser: Middleware to parse incoming request bodies
- express-validator: Library for validating and sanitizing inputs
- nodemon: Utility to automatically restart the server on code changes
- path: Node.js module for working with file and directory paths

## Functionalities

### User Authentication

- Register:

  - Endpoint: `/api/register`
  - Method: `POST`
  - Validates email, username, and password.
  - Hashes the password and stores the user details in the database.
  - Returns a success or failure message.

- Login:

  - Endpoint: `/api/auth/login`
  - Method: `POST`
  - Validates user credentials.
  - Sets up a session on successful login.
  - Returns a success message and user ID.

- Logout:

  - Endpoint: `/logout`
  - Method: `POST`
  - Destroys the user session.
  - Clears the session cookie.

### Expense Management

- Get Expenses:

  - Endpoint: `/api/expenses/:userId`
  - Method: `GET`
  - Fetches all expenses for the logged-in user.
  - Returns a list of expenses.

- Add Expense:

  - Endpoint: `/api/expenses`
  - Method: `POST`
  - Adds a new expense for the logged-in user.
  - Returns a success message.

- Update Expense:

  - Endpoint: `/api/expenses/:id`
  - Method: `PUT`
  - Updates an existing expense for the logged-in user.
  - Validates the user password before updating.
  - Returns a success message.

- Delete Expense:

  - Endpoint: `/api/expenses/:id`
  - Method: `DELETE`
  - Deletes an existing expense for the logged-in user.
  - Validates the user password before deleting.
  - Returns a success message.

### Total Expenses

- Get Total Expenses:

  - Endpoint: `/api/expense/total/:userId`
  - Method: `GET`
  - Calculates and returns the total amount and count of expenses for the logged-in user.

## Instructions to Run the Application

**1.** Open the homepage:

- Navigate to `http://localhost:3000`.
- You will see options to register or log in.

**2.** Register a new user:

- Click on the Register button.
- Fill out the form and submit.

**3.** Log in with existing credentials:

- Click on the Login button.
- Fill out the form and submit.

**4.** Manage expenses:

- After logging in, you will be redirected to the expenses page.
- Add, view, update, or delete expenses as needed.

**5.** View total expenses:

- Click on the "View Total Expenses" button on the expenses page to see the total amount and count of your expenses.

**6.** Logout:

- Click on the logout button to end your session.

## File Structure

- api folder:

  - `node_modules` folder: Contains the installation files for the dependencies
  - `.env`: Contains environment variables for configuration settings.
  - `server.js`: Main server file containing all routes and database setup.

- `index.html`: Homepage with links to register and login.
- `register.html`: Registration page.
- `login.html`: Login page.
- `expenses.html`: Page to manage expenses.
- `total-expense.html`: Page to view total expenses.
- `index.css`: Styles homepage.
- `main.css`: Styles registration page and login page.
- `expenses.css`: Styles expenses page.
- `total-expense.css`: Styles total expenses page.
- `script.js`: Handles navigation between pages.
- `register.js`: Handles registration form submission.
- `login.js`: Handles login form submission.
- `expenses.js`: Handles expense management (add, view, update, delete).
- `total-expense.js`: Handles fetching and displaying total expenses.

## Node.js Project Directory

### expense-tracker/

Contains HTML, CSS, and JavaScript files for the frontend.

├── index.html
Main HTML file for the frontend.

├── index.css
Main CSS file for styling the homepage.

├── script.js
Main JavaScript file for frontend logic.

├── Other files for the frontend.

├── api/
Backend Node.js server files.

    ├── node_modules/
        Directory for installed Node.js modules.

    ├── .env
        Contains environment variables for configuration settings.

    ├── .gitignore
        Specifies files and directories to be ignored by Git.

    ├── package.json
        Contains metadata about the project and dependencies.

    ├── package-lock.json
        Contains exact versions of installed dependencies.

    └── server.js
        Main server file to set up and start the Node.js server.

└── README.md
Project documentation and instructions.
