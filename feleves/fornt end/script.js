let matrixSize = 0;

document
  .getElementById("matrixForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    generateMatrix();
  });

document.getElementById("sendButton").addEventListener("click", sendData);

function generateMatrix() {
  matrixSize = parseInt(document.getElementById("sizeInput").value);

  const container = document.getElementById("matrixContainer");
  const table = document.createElement("table");
  table.id = "matrixTable";
  table.className = "table table-bordered";

  for (let i = 0; i < matrixSize; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < matrixSize; j++) {
      const cell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.style.width = "60px";
      input.className = "form-control";
      input.required = true;
      input.value = 0;
      input.id = `cell-${i}-${j}`;
      cell.appendChild(input);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  document.getElementById("fillRandomButton").disabled = false;
  container.innerHTML = "";
  container.appendChild(table);
}

function getMatrixData() {
  const matrix = [];
  for (let i = 0; i < matrixSize; i++) {
    const row = [];
    for (let j = 0; j < matrixSize; j++) {
      const value = parseInt(document.getElementById(`cell-${i}-${j}`).value);
      if (isNaN(value)) {
        alert("Minden cellát ki kell tölteni érvényes számmal!");
        return null;
      }
      row.push(value);
    }
    matrix.push(row);
  }
  return matrix;
}

async function sendData() {
  const matrix = getMatrixData();
  if (!matrix) return;

  const epsilon = parseFloat(document.getElementById("epsilonInput").value);
  if (isNaN(epsilon)) {
      alert("Kérem adjon meg egy érvényes epszilon értéket!");
      return;
  }

  try {
      const response = await fetch("http://localhost:5247/api/matrix", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              Matrix: matrix,
              Epsilon: epsilon
          })
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      displayResult(result, matrix);
  } catch (error) {
      console.error("Error:", error);
      alert("Hiba a kérés feldolgozása során: " + error.message);
  }
}

function displayResult(result) {
  document.querySelectorAll(".highlighted").forEach(el =>
    el.classList.remove("highlighted")
  );

  if (result.largestArea && result.largestArea.length > 0) {
    result.largestArea.forEach(([i, j]) => {
      const cell = document.getElementById(`cell-${i}-${j}`);
      if (cell) {
        cell.parentElement.classList.add("highlighted");
      }
    });
  }

  const container = document.getElementById("resultContainer");
  const existing = document.getElementById("resultSize");
  if (existing) existing.remove();

  const resultDiv = document.createElement("div");
  resultDiv.id = "resultSize";

  const heading = document.createElement("h3");
  heading.textContent = "A legnagyobb összefüggő terület mérete:";
  const subheading = document.createElement("h4");
  subheading.textContent = `${result.largestArea.length} cella`;

  resultDiv.appendChild(heading);
  resultDiv.appendChild(subheading);
  container.appendChild(resultDiv);
}

document.getElementById("fillRandomButton").addEventListener("click", function () {
  if (matrixSize === 0) return;

  for (let i = 0; i < matrixSize; i++) {
    for (let j = 0; j < matrixSize; j++) {
      const randomValue = Math.floor(Math.random() * 21) - 10;
      document.getElementById(`cell-${i}-${j}`).value = randomValue;
    }
  }
});