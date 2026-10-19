const API = "http://localhost:5000/emp";

/* =====================
   LOAD EMPLOYEES
===================== */

async function loadEmployees() {

  try {

    const response = await fetch(`${API}/get`);
    const data = await response.json();

    const tbody =
      document.querySelector("#employeeTable tbody");

    tbody.innerHTML = "";

    data.forEach(emp => {

      tbody.innerHTML += `
        <tr>

          <td>${emp.employee_id}</td>
          <td>${emp.name}</td>
          <td>${emp.email}</td>
          <td>${emp.department}</td>
          <td>${emp.salary_type}</td>
          <td>${emp.joining_date?.split("T")[0] || emp.joining_date}</td>
          <td>${emp.status}</td>
          

          
        </tr>
      `;
    });

  } catch (error) {

    console.log(error);
    alert("Failed to load employees");
  }
}

/* =====================
   ADD EMPLOYEE
===================== */

async function saveEmployee() {

  const employee = {

    name:
      document.getElementById("name").value,
    email:
      document.getElementById("email").value,  

    department:
      document.getElementById("department").value,

    salary_type:
      document.getElementById("salaryType").value,

    joining_date:
      document.getElementById("joiningDate").value,

    status:
      document.getElementById("status").value,

    job_role: ""
  };

  try {

    const response = await fetch(
      `${API}/insert`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(employee)
      }
    );

    const result = await response.json();

    alert(result.success || result.error);

    closeModal();
    loadEmployees();

  } catch (error) {

    console.log(error);
  }
}

/* =====================
   DELETE EMPLOYEE
===================== */

async function deleteEmployee(id) {

  if (!confirm("Delete employee?"))
    return;

  try {

    const response = await fetch(
      `${API}/delete/${id}`,
      {
        method: "DELETE"
      }
    );

    const result = await response.json();

    alert(result.success);

    loadEmployees();

  } catch (error) {

    console.log(error);
  }
}

/* =====================
   MODAL
===================== */

function openModal() {

  document.getElementById(
    "employeeModal"
  ).style.display = "flex";
}

function closeModal() {

  document.getElementById(
    "employeeModal"
  ).style.display = "none";
}

/* =====================
   PAGE LOAD
===================== */

window.onload = () => {

  loadEmployees();
};