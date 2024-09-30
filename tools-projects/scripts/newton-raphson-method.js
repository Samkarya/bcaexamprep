// Constants
    const tolerance = 1e-6;
    let chart;
    
    // Main calculation function
    function calculate() {
        const equation = document.getElementById('equation').value;
        const derivative = document.getElementById('derivative').value;
        const initialGuess = parseFloat(document.getElementById('initialGuess').value);
        const maxIterations = parseInt(document.getElementById('maxIterations').value);
    
        if (!validateInputs(equation, derivative, initialGuess, maxIterations)) {
            return;
        }
    
        const result = newtonsMethod(equation, derivative, initialGuess, maxIterations);
        displayResult(result);
        displaySteps(result.steps);
        updateGraph(result.steps, equation);
    }
    
    // Input validation
    function validateInputs(equation, derivative, initialGuess, maxIterations) {
        if (!equation || !derivative) {
            alert("Please enter both the function and its derivative.");
            return false;
        }
        if (isNaN(initialGuess)) {
            alert("Please enter a valid initial guess.");
            return false;
        }
        if (isNaN(maxIterations) || maxIterations <= 0) {
            alert("Please enter a valid number of iterations.");
            return false;
        }
        return true;
    }
    
    // Newton's Method implementation
    function newtonsMethod(equation, derivative, initialGuess, maxIterations) {
        const steps = [];
        let x = initialGuess;
    
        for (let i = 0; i < maxIterations; i++) {
            const fx = evaluateFunction(equation, x);
            const fPrimeX = evaluateFunction(derivative, x);
    
            steps.push({ iteration: i, x, fx, fPrimeX });
    
            if (Math.abs(fx) < tolerance) {
                return { root: x, steps, converged: true };
            }
    
            if (Math.abs(fPrimeX) < tolerance) {
                return { root: x, steps, converged: false, message: "Derivative too close to zero." };
            }
    
            x = x - fx / fPrimeX;
        }
    
        return { root: x, steps, converged: false, message: "Max iterations reached." };
    }
    
    // Function evaluation
    function evaluateFunction(equation, x) {
        const safeEquation = equation.replace(/\^/g, '**').replace(/x/g, `(${x})`);
        try {
            return Function(`return ${safeEquation}`)();
        } catch (error) {
            console.error("Error evaluating function:", error);
            return NaN;
        }
    }
    
    // Result display
    function displayResult(result) {
        const resultElement = document.getElementById('final-answer');
        if (result.converged) {
            resultElement.textContent = `Root found: ${result.root.toFixed(6)}`;
        } else {
            resultElement.textContent = `Method did not converge. ${result.message}`;
        }
    }
    
    // Steps display
    function displaySteps(steps) {
        const table = document.getElementById('steps-table');
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';
    
        steps.forEach(step => {
            const row = tbody.insertRow();
            row.insertCell().textContent = step.iteration;
            row.insertCell().textContent = step.x.toFixed(6);
            row.insertCell().textContent = step.fx.toFixed(6);
            row.insertCell().textContent = step.fPrimeX.toFixed(6);
        });
    }
    
    // Graph update
    function updateGraph(steps, equation) {
        const ctx = document.getElementById('graph').getContext('2d');
        const xValues = steps.map(step => step.x);
        const yValues = steps.map(step => step.fx);
    
        const minX = Math.min(...xValues) - 1;
        const maxX = Math.max(...xValues) + 1;
        const plotPoints = 100;
        const plotXValues = Array.from({ length: plotPoints }, (_, i) => minX + (maxX - minX) * i / (plotPoints - 1));
        const plotYValues = plotXValues.map(x => evaluateFunction(equation, x));
    
        if (chart) {
            chart.data.datasets[0].data = plotXValues.map((x, i) => ({ x, y: plotYValues[i] }));
            chart.data.datasets[1].data = steps.map(step => ({ x: step.x, y: step.fx }));
            chart.update();
        } else {
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [
                        {
                            label: 'f(x)',
                            data: plotXValues.map((x, i) => ({ x, y: plotYValues[i] })),
                            borderColor: 'blue',
                            pointRadius: 1,
                            fill: false
                        },
                        {
                            label: 'Newton\'s Method Steps',
                            data: steps.map(step => ({ x: step.x, y: step.fx })),
                            borderColor: 'red',
                            pointRadius: 5,
                            showLine: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                            title: {
                                display: true,
                                text: 'x'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'f(x)'
                            }
                        }
                    }
                }
            });
        }
    }
    
    // Initialize event listeners
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('newton-raphson-form').addEventListener('submit', (e) => {
            e.preventDefault();
            calculate();
        });
    });
