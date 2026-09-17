const display = document.getElementById("display");
const expressionDisplay = document.getElementById("expression");
const historyContainer = document.getElementById("history");

let expression = "";
let lastResult = null;

function updateDisplay() {

    display.textContent = expression || "0";

}

function addToExpression(value) {

    expression += value;

    updateDisplay();

}

function clearCalculator() {

    expression = "";
    lastResult = null;

    expressionDisplay.textContent = "";

    updateDisplay();

}

function deleteLast() {

    expression = expression.slice(0, -1);

    updateDisplay();

}

function formatExpression(value) {

    return value
       .replaceAll("*", "×")
       .replaceAll("/", "÷");
}

function calculate() {

    if(!expression) {
        return;
    }

    try {
        let calculation = expression;

        calculation = calculation.replaceAll("×", "*");
        calculation = calculation.replaceAll("÷", "/");
        calculation = calculation.replaceAll("%", "/100");

        const result = Function(
            `"use strict"; return (${calculation})`
        )();

        if (!Number.isFinite(result)) {
            throw new Error("Invalid calculation");
        }

        const roundedResult =
            Number.isInteger(result)
              ? result
              : Number(result.toFixed(10));

        expressionDisplay.textContent =
          formatExpression(expression) + "=";

        expression = String(roundedResult);

        lastResult = roundedResult;

        updateDisplay();

        addHistory(
            expressionDisplay.textContent,
            roundedResult
        );
    } catch (error) {

        expressionDisplay.textContent = "Error";

        display.textContent = "Invalid";

        setTimeout(() => {
            clearCalculator();
        }, 1200);

    }
}

function toggleSign() {

    if (!expression) {
        return;
    }

    try {

        const result = Function(
            `"use strict"; return(${expression})`
        )();

        expression = String(result * -1);

        updateDisplay();

    } catch (error) {

        expression = "-(" + expression +")";

        updateDisplay();

    }
}

function square() {

    if(!expression) {
        return;
    }

    try {

        const value = Function (
            `"use strict"; return (${expression})`
        )();

        expression = String(value ** 2);

        updateDisplay();

    } catch (error) {

        showError();

    }
}

function squareRoot() {

    if(!expression) {
        return;
    }

    try {

        const value = Function (
            `"use strict"; return (${expression})`
        )();

        if (value < 0) {
            throw new Error("Negative square root");
        }

        expression = String(Math.sqrt(value));

        updateDisplay();

    } catch (error) {

        showError();
        
    }
}

function reciprocal() {

    if(!expression) {
        return;
    }

    try {

        const value = Function (
            `"use strict"; return (${expression})`
        )();

        if(value === 0) {
            throw new Error("Division by zero")
        }

        expression = String(1 / value);

        updateDisplay();

    } catch (error) {

        showError();
        
    }
}

function addPi() {

    expression += Math.PI;

    updateDisplay();

}

function scientificFunction(type) {

    if(!expression) {
        return;
    }

    try {

        const value = Function (
            `"use strict"; return (${expression})`
        )();

        let result;

        if (type === "sin") {
            result = Math.sin(value);
        }

        else if (type === "cos") {
            result = Math.cos(value);
        }

        else if (type === "tan") {
            result = Math.tan(value);
        }

        else if (type === "log") {
            if (value <= 0) {
                throw new Error("Invalid logarithm");
            }

            result = Math.log10(value);
        }

         else if (type === "ln") {
            if (value <= 0) {
                throw new Error("Invalid logarithm");
            }

            result = Math.log(value);
        }


        expression = String(Number(result.toFixed(10)));

        updateDisplay();

    } catch (error) {

        showError();
        
    }
}

function power() {

    if(!expression){
        return;
    }

    expression += "**";

    updateDisplay();

}

function showError() {

    expressionDisplay.textContent = "Error";

    display.textContent = "Invalid";

    setTimeout(() => {
        clearCalculator();
    }, 1200);

}

function addHistory(expressionValue, result) {

    const item = {
        expression: expressionValue,
        result: result
    };

    let history =
        JSON.parse(localStorage.getItem("calculatorHistory")) || [];

    history.unshift(item);

    history = history.slice(0, 20);

    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(history)
    );

    renderHistory();

}


function renderHistory() {

    let history =
        JSON.parse(localStorage.getItem("calculatorHistory")) || [];

    historyContainer.innerHTML = "";

    if (history.length === 0) {

        historyContainer.innerHTML =
            '<p class="empty-history">No calculations yet.</p>';

        return;
    }


    history.forEach((item) => {

        const historyItem =
            document.createElement("div");

        historyItem.className = "history-item";

        historyItem.innerHTML = `
            <div class="history-expression">
                ${item.expression}
            </div>

            <div class="history-result">
                ${item.result}
            </div>
        `;


        historyItem.addEventListener("click", () => {

            expression = String(item.result);

            updateDisplay();

        });


        historyContainer.appendChild(historyItem);

    });

}


function clearHistory() {

    localStorage.removeItem("calculatorHistory");

    renderHistory();

}


document.querySelectorAll("[data-value]").forEach((button) => {

    button.addEventListener("click", () => {

        addToExpression(button.dataset.value);

    });

});

document.querySelectorAll("[data-action]").forEach((button) => {

    button.addEventListener("click", () => {

        const action = button.dataset.action;


        if (action === "clear") {
            clearCalculator();
        }

        else if (action === "delete") {
            deleteLast();
        }

        else if (action === "calculate") {
            calculate();
        }

        else if (action === "toggle-sign") {
            toggleSign();
        }

        else if (action === "square") {
            square();
        }

        else if (action === "sqrt") {
            squareRoot();
        }

        else if (action === "reciprocal") {
            reciprocal();
        }

        else if (action === "pi") {
            addPi();
        }

        else if (
            ["sin", "cos", "tan", "log", "ln"].includes(action)
        ) {
            scientificFunction(action);
        }

        else if (action === "power") {
            power();
        }

    });

});


document.addEventListener("keydown", (event) => {

    const key = event.key;


    if (
        (key >= "0" && key <= "9") ||
        ["+", "-", "*", "/", ".", "(", ")", "%"].includes(key)
    ) {

        event.preventDefault();

        addToExpression(key);

    }


    else if (key === "Enter" || key === "=") {

        event.preventDefault();

        calculate();

    }


    else if (key === "Backspace") {

        event.preventDefault();

        deleteLast();

    }


    else if (key === "Escape") {

        clearCalculator();

    }

});


document
    .getElementById("clearHistory")
    .addEventListener("click", clearHistory);


document
    .getElementById("themeToggle")
    .addEventListener("click", () => {

        document.body.classList.toggle("dark");

        const darkMode =
            document.body.classList.contains("dark");

        localStorage.setItem(
            "calculatorDarkMode",
            darkMode
        );

    });


if (
    localStorage.getItem("calculatorDarkMode") === "true"
) {

    document.body.classList.add("dark");

}

renderHistory();

updateDisplay();