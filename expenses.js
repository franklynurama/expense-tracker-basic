document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    // If userId is null or undefined, show a message and redirect
    alert("You need to log in to access this page.");
    window.location.href = "index.html"; // Redirect to login page
    return; // Exit early
  }

  console.log("User ID:", userId);

  document
    .getElementById("addExpenseForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const category = document.getElementById("expenseCategory").value;
      const description = document.getElementById("expenseDescription").value;
      const amount = parseFloat(
        document.getElementById("expenseAmount").value
      ).toFixed(2);
      const date = document.getElementById("expenseDate").value;

      try {
        const response = await fetch("http://localhost:3000/api/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, category, description, amount, date }),
        });

        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }

        fetchExpenses(); // Refresh list after adding
      } catch (err) {
        console.error("Error adding expense:", err);
      }
    });
});

// Function to fetch expenses
async function fetchExpenses() {
  const userId = localStorage.getItem("userId");
  console.log("Fetching expenses for user ID:", userId);

  try {
    const response = await fetch(
      `http://localhost:3000/api/expenses/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userId}`,
        }, // Another authorization method without using userAuthenticated in server-side
      }
    );

    if (response.status === 401) {
      alert("You need to log in to access this page.");
      window.location.href = "index.html"; // Redirect to login page
      return;
    }

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    // Try to parse the response as JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Received non-JSON response:", text); // Log the raw response
      throw new Error("Received non-JSON response");
    }

    const expenses = await response.json();
    console.log("Expenses:", expenses); // Debugging statement

    const expenseList = document.getElementById("expenseList");
    const noExpensesMessage = document.getElementById("noExpensesMessage");
    const getExpensesMessage = document.getElementById("getExpensesMessage");

    // Clear the expense list and message visibility
    expenseList.innerHTML = "";
    noExpensesMessage.style.display = "none";
    getExpensesMessage.style.display = "none";

    if (expenses.length === 0) {
      // If no expenses, show the "No expenses" message
      noExpensesMessage.style.display = "block";
    } else {
      // If expenses exist, show the "Get expenses" message
      getExpensesMessage.style.display = "none";

      // Populate the list with expenses
      expenses.forEach((expense) => {
        const formattedDate = new Date(expense.date).toLocaleDateString();
        const listItem = document.createElement("li");
        listItem.innerHTML = `<span>${expense.category}</span> <span>${expense.description}</span> 
                              <span>$${expense.amount}</span> <span>${formattedDate}</span>
                              <button onclick="updateExpense(${expense.id})">Update Expense</button>
                              <button onclick="deleteExpense(${expense.id})">Delete Expense</button>`;
        expenseList.appendChild(listItem);
      });

      // Create a wrapper for the total button
      const buttonWrapper = document.createElement("div");
      buttonWrapper.className = "button-wrapper";

      // Append the button to the wrapper
      const totalButton = document.createElement("button");
      totalButton.textContent = "View Total Expenses";
      totalButton.className = "button";
      totalButton.style.marginTop = "30px";
      totalButton.addEventListener("click", () => {
        window.location.href = "total-expense.html";
      });
      buttonWrapper.appendChild(totalButton);

      // Append the wrapper to the list
      expenseList.appendChild(buttonWrapper);
    }
  } catch (err) {
    console.error("Error fetching expenses:", err);
  }
}

// Function to update an expense
window.updateExpense = async function (expenseId) {
  const category = prompt("New Category:");
  const description = prompt("New Description:");
  const amount = parseFloat(prompt("New Amount:")).toFixed(2);

  let date;
  while (true) {
    date = prompt("New Date (YYYY-MM-DD):");
    if (date === null) {
      alert("Date input canceled.");
      return;
    }
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (datePattern.test(date)) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate)) {
        break;
      } else {
        alert("Invalid date. Please enter a valid date in YYYY-MM-DD format.");
      }
    } else {
      alert("Invalid format. Please use YYYY-MM-DD.");
    }
  }

  // Prompt for the password
  const password = prompt("Please enter your password to confirm the update:");

  if (!password) {
    alert("Password is required to update the expense.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/expenses/${expenseId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category, description, amount, date, password }),
      }
    );

    const result = await response.json();

    if (response.status === 200) {
      fetchExpenses(); // Refresh list after updating
      alert("Expense updated successfully");
    } else {
      alert(result.error || "Failed to update expense");
    }
  } catch (err) {
    console.error("Error updating expense:", err);
  }
};

// Function to delete an expense
window.deleteExpense = async function (expenseId) {
  try {
    // Prompt the user for their password
    const password = prompt("Please enter your password to confirm deletion:");

    if (!password) {
      alert("Password is required to delete the expense.");
      return;
    }

    const response = await fetch(
      `http://localhost:3000/api/expenses/${expenseId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      }
    );

    const result = await response.json();

    if (response.status === 200) {
      fetchExpenses(); // Refresh list after deleting
      alert("Expense deleted successfully");
    } else {
      alert(result.error || "Failed to delete expense");
    }
  } catch (err) {
    console.error("Error deleting expense:", err);
  }
};

function logout() {
  // Clear local storage
  localStorage.removeItem("userId");

  // Make a request to the server to destroy the session
  fetch("http://localhost:3000/logout", {
    method: "POST",
    credentials: "include", // Include credentials to send the session cookie
  })
    .then((response) => {
      if (response.ok) {
        // Redirect to the login page
        window.location.href = "index.html";
      } else {
        console.error("Failed to log out");
      }
    })
    .catch((err) => {
      console.error("Error logging out:", err);
    });
}
