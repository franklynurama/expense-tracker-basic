// server.js
const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const path = require("path");
const { check, validationResult } = require("express-validator");

// Initialize app
const app = express();
const port = process.env.PORT || 3000;

// Set up middleware to parse incoming data
app.use(express.static(__dirname));
app.use(express.json());
app.use(cors());
dotenv.config();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session middleware
app.use(
  session({
    secret: "w6sdr1ftrt48sd5sfs1s1xfdf5rtyhh5uy8tr5f5hg",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Use 'true' if HTTPS is enabled
  })
);

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, "..")));

// Create a connection to the database server
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Check database connection
db.connect((err) => {
  if (err) return console.error("Error connecting to MySQL:", err);

  console.log("Connected to MySQL as id:", db.threadId);

  // Create database if it doesn't exist
  db.query("CREATE DATABASE IF NOT EXISTS expense_tracker_plp", (err) => {
    if (err) return console.error("Error creating database:", err);

    console.log("Database 'expense_tracker_plp' checked/created successfully");

    // Select the created database
    db.changeUser({ database: "expense_tracker_plp" }, (err) => {
      if (err) return console.error("Error changing database:", err);

      console.log("Switched to 'expense_tracker_plp' database");

      // Create users table if it doesn't exist
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(100) NOT NULL UNIQUE,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL
        )
      `;
      db.query(createUsersTable, (err) => {
        if (err) return console.error("Error creating table:", err);

        console.log("Users table checked/created successfully");
      });

      // Create expenses table if it doesn't exist
      const createExpensesTable = `
        CREATE TABLE IF NOT EXISTS users_expenses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          category VARCHAR(50) NOT NULL,
          description VARCHAR(255),
          amount DECIMAL(10, 2) NOT NULL,
          date DATE NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
          )
          `;
      db.query(createExpensesTable, (err) => {
        if (err) return console.error("Error creating expenses table:", err);
        console.log("Expenses table checked/created successfully");
      });
    });
  });
});

// Define route to registratation form
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "register.html"));
});

// Display login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "login.html"));
});

// User registration route
app.post(
  "/api/register",
  [
    check("email").isEmail(),
    check("username")
      .matches(/^[A-Za-z][A-Za-z0-9]*$/) // regular expressions
      .withMessage("Username must start with a letter and be alphanumeric"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    check("email").custom(async (value) => {
      const userQuery = "SELECT * FROM users WHERE email = ?";
      const [rows] = await db.promise().query(userQuery, [value]);
      if (rows.length > 0) {
        throw new Error("Email already exists");
      }
    }),
    check("username").custom(async (value) => {
      const userQuery = "SELECT * FROM users WHERE username = ?";
      const [rows] = await db.promise().query(userQuery, [value]);
      if (rows.length > 0) {
        throw new Error("Username already exists");
      }
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);

      const newUserQuery =
        "INSERT INTO users(email, username, password) VALUES (?)";
      const values = [req.body.email, req.body.username, hashedPassword];
      db.query(newUserQuery, [values], (err) => {
        if (err) return res.status(500).json("Something went wrong!");

        res.status(200).json("User created successfully!");
      });
    } catch (err) {
      res.status(500).json("Internal Server Error");
    }
  }
);

// POST /api/auth/login
// User login route
app.post("/api/auth/login", (req, res) => {
  try {
    const userQuery = "SELECT * FROM users WHERE email = ?";

    db.query(userQuery, [req.body.email], (err, data) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (data.length === 0) {
        return res.status(404).json({ error: "User not found!" });
      }

      const user = data[0];
      const isPasswordValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      console.log("Setting req.session.user:", user);
      // Set the user session
      req.session.user = user;
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
        } else {
          console.log("Session saved successfully");
        }
      });

      res.status(200).json({ message: "Login successful", userId: user.id });
    });
  } catch (err) {
    console.error("Error in login route:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//handle authorization
const userAuthenticated = (req, res, next) => {
  console.log(req.session.user);
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Get expenses for the logged-in user
app.get("/api/expenses/:userId", userAuthenticated, (req, res) => {
  // // Another method which uses the headers tag in client-side
  // // to save userId and no need for userAuthenticated above:
  // const userId = req.headers.authorization;
  // console.log("Received request for user ID:", userId);

  const userId = req.params.userId;
  const query = "SELECT * FROM users_expenses WHERE user_id = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    console.log("Expenses fetched:- ", results); // Log fetched results
    res.json(results);
  });
});

// Add a new expense
app.post("/api/expenses", userAuthenticated, (req, res) => {
  const { userId, category, description, amount, date } = req.body;
  const query =
    "INSERT INTO users_expenses (user_id, category, description, amount, date) VALUES (?)";
  const values = [userId, category, description, amount, date];
  db.query(query, [values], (err) => {
    if (err) return res.status(500).json("Internal Server Error");
    res.status(200).json("Expense added successfully");
  });
});

// Update an existing expense
app.put("/api/expenses/:id", userAuthenticated, async (req, res) => {
  const expenseId = req.params.id;
  const { category, description, amount, date, password } = req.body;
  const userId = req.session.user.id;

  console.log("Received update request for expense ID:", expenseId);
  console.log("Request body:", req.body);

  try {
    // Fetch the user to validate the password
    const userQuery = "SELECT * FROM users WHERE id = ?";
    const [rows] = await db.promise().query(userQuery, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Proceed to update the expense
    const query =
      "UPDATE users_expenses SET category = ?, description = ?, amount = ?, date = ? WHERE id = ? AND user_id = ?";
    db.query(
      query,
      [category, description, amount, date, expenseId, userId],
      (err) => {
        if (err) {
          console.error("Database query error:", err);
          return res.status(500).json("Internal Server Error");
        }
        res.status(200).json("Expense updated successfully");
      }
    );
  } catch (err) {
    console.error("Error in update route:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete an expense
app.delete("/api/expenses/:id", userAuthenticated, async (req, res) => {
  const expenseId = req.params.id;
  const { password } = req.body;
  const userId = req.session.user.id;

  try {
    // Fetch the user to validate the password
    const userQuery = "SELECT * FROM users WHERE id = ?";
    const [rows] = await db.promise().query(userQuery, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Proceed to delete the expense
    const query = "DELETE FROM users_expenses WHERE id = ? AND user_id = ?";
    db.query(query, [expenseId, userId], (err) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json("Internal Server Error");
      }
      res.status(200).json("Expense deleted successfully");
    });
  } catch (err) {
    console.error("Error in delete route:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Calculate total expenses and count of expenses for a user
app.get("/api/expense/total/:userId", userAuthenticated, async (req, res) => {
  const userId = req.params.userId;
  console.log(`User ID: ${userId}`);

  const query =
    "SELECT SUM(amount) as totalAmount, COUNT(id) as expenseCount FROM users_expenses WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json("Internal Server Error");
    }
    if (results.length === 0) {
      return res.status(404).json("No expenses found for this user");
    }
    console.log("Query results:", results);
    res.json(results[0]);
  });
});

// Logout route
app.post("/logout", userAuthenticated, (req, res) => {
  console.log("Logging you out!");
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out.");
    }
    res.clearCookie("connect.sid"); // Assuming you're using the default session cookie name
    res.send("Logged out");
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
