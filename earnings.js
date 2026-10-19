const API = "http://localhost:5000/earn";

console.log("earnings.js loaded");

/* =========================
   SHOW / HIDE FORM
========================= */

function showForm() {

  const form =
    document.getElementById("earningForm");

  if (
    form.style.display === "none" ||
    form.style.display === ""
  ) {

    form.style.display = "block";

  } else {

    form.style.display = "none";
  }
}

/* =========================
   LOAD EARNINGS
========================= */

async function loadEarnings() {

  try {

    const response = await fetch(
      `${API}/read/all`
    );

    const data = await response.json();

    const tbody =
      document.querySelector(
        "#earningTable tbody"
      );

    tbody.innerHTML = "";

    data.forEach(item => {

      tbody.innerHTML += `

        <tr>

          <td>${item.employee_id}</td>

          <td>${item.basic_salary}</td>

          <td>${item.hra}</td>

          <td>${item.travel_allowance}</td>

          <td>${item.overtime_pay}</td>

          <td>${item.month_year}</td>

          <td class="action-cell">

            <div class="action-icons">

              <i class="fa-solid fa-trash delete-btn"
              onclick="deleteEarning(${item.earning_id})">
              </i>

            </div>

          </td>

        </tr>

      `;
    });

  } catch (error) {

    console.log(error);

    alert("Failed to load earnings");
  }
}

/* =========================
   ADD EARNING
========================= */

async function addEarning() {

  const employee_id =
    document.getElementById("employee").value;

  const basic_salary =
    document.getElementById("basic").value;

  const hra =
    document.getElementById("hra").value;

  const travel_allowance =
    document.getElementById("ta").value;

  const overtime_pay =
    document.getElementById("ot").value;

  const month_year =
    document.getElementById("month").value;

  if (
    !employee_id ||
    !basic_salary ||
    !month_year
  ) {

    alert("Please fill required fields");

    return;
  }

  try {

    const response = await fetch(
      `${API}/insert`,
      {
        method: "POST",

        headers: {
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({

          employee_id,
          basic_salary,
          hra,
          travel_allowance,
          overtime_pay,
          month_year

        })
      }
    );

    const result =
      await response.json();

    alert(result.message);

    document.getElementById("employee").value = "";
    document.getElementById("basic").value = "";
    document.getElementById("hra").value = "";
    document.getElementById("ta").value = "";
    document.getElementById("ot").value = "";
    document.getElementById("month").value = "";

    loadEarnings();

  } catch (error) {

    console.log(error);

    alert("Failed to add earnings");
  }
}

/* =========================
   DELETE EARNING
========================= */

async function deleteEarning(id) {

  const confirmDelete =
    confirm("Delete earning?");

  if (!confirmDelete) return;

  try {

    const response = await fetch(
      `${API}/delete/${id}`,
      {
        method: "DELETE"
      }
    );

    const result =
      await response.json();

    alert(result.message);

    loadEarnings();

  } catch (error) {

    console.log(error);

    alert("Delete failed");
  }
}

/* =========================
   PAGE LOAD
========================= */

window.onload = () => {

  loadEarnings();
};