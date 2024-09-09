document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("You need to log in to access this page.");
    window.location.href = "index.html"; // Redirect to login page if userId is not present
    return;
  }
  fetchTotalExpenses(userId);
  fetchExpensesByCategory(userId); // Fetch and display the pie and bar chart data

  // Add event listener to the back button
  document.getElementById("backButton").addEventListener("click", () => {
    window.location.href = "expenses.html"; // Navigate back to expenses.html
  });
});

// Function to fetch and display total expenses
async function fetchTotalExpenses(userId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/expense/total/${userId}`,
      {
        method: "GET",
      }
    );

    console.log(userId);

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    console.log("Fetched data:", data); // Logs the data to inspect its structure

    // Ensure totalAmount is parsed as a number
    const totalAmount = parseFloat(data.totalAmount);
    if (!isNaN(totalAmount)) {
      document.getElementById("totalAmount").textContent =
        totalAmount.toFixed(2);
    } else {
      throw new Error("Total amount is not a number");
    }

    // Ensure expenseCount is parsed as a number
    const expenseCount = parseInt(data.expenseCount, 10);
    if (!isNaN(expenseCount)) {
      document.getElementById("totalCount").textContent = expenseCount;
    } else {
      throw new Error("Expense count is not a number");
    }
  } catch (err) {
    console.error("Error fetching total expenses:", err);
  }
}

// Function to fetch and display expenses by category
async function fetchExpensesByCategory(userId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/expenses/${userId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) throw new Error("Failed to fetch expense data");

    const expenses = await response.json();
    console.log("Fetched expenses:", expenses); // Logs the expenses for debugging

    // Calculate total amounts per category
    const categoryTotals = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += parseFloat(expense.amount);
      return acc;
    }, {});

    // Extract labels and data for the pie chart
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    // Create the pie chart
    const pieChartElement = document.getElementById("expensePieChart");
    new Chart(pieChartElement, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Expense Distribution",
            data: data,
            backgroundColor: generateColors(labels.length),
            borderWidth: 1,
          },
        ],
      },
    });

    // Calculate counts per category
    const categoryCounts = expenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += 1; // Increment count for each expense in the category
      return acc;
    }, {});

    // Extract labels and counts for the bar chart
    const labels2 = Object.keys(categoryCounts);
    const data2 = Object.values(categoryCounts);

    // Create the bar chart
    const barChartElement = document.getElementById("expenseBarChart");
    new Chart(barChartElement, {
      type: "bar",
      data: {
        labels: labels2,
        datasets: [
          {
            label: "Number of Expenses",
            data: data2,
            backgroundColor: generateColors(labels2.length),
            borderColor: "#333",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return `${tooltipItem.label}: ${tooltipItem.raw} expenses`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              display: true,
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("Error fetching expenses by category:", err);
  }
}

// Helper function to generate an array of colors
function generateColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(`hsl(${(i * 360) / count}, 70%, 70%)`);
  }
  return colors;
}
