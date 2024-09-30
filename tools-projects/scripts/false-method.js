 let chart;
    let animationId;

    document.getElementById('false-position-form').addEventListener('submit', function (e) {
        e.preventDefault();
    
        const funcInput = document.getElementById('function').value || 'x^3 - x - 10';
        const aInput = document.getElementById('interval-a').value;
        const bInput = document.getElementById('interval-b').value;
        const iterationsInput = document.getElementById('iterations').value;
    
        let a = aInput !== '' ? parseFloat(aInput) : 2;
        let b = bInput !== '' ? parseFloat(bInput) : 2.5;
        const iterations = iterationsInput !== '' ? parseInt(iterationsInput) : 5;
    
        const outputElement = document.querySelector('#steps-table tbody');
        outputElement.innerHTML = '';
        document.getElementById('final-answer').innerHTML = '';
        
        if (chart) {
            chart.destroy();
        }

        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    
        let parsedFunction;
        try {
            parsedFunction = math.parse(funcInput).compile();
        } catch (error) {
            alert('Error parsing function. Please check your input.');
            return;
        }
    
        function f(x) {
            try {
                return parsedFunction.evaluate({ x });
            } catch (error) {
                return NaN;
            }
        }
    
        let f_a = f(a);
        let f_b = f(b);
    
        if (isNaN(f_a) || isNaN(f_b)) {
            alert('Function evaluation resulted in NaN. Please check your function and interval.');
            return;
        }
    
        if (f_a * f_b >= 0) {
            alert('Function does not change sign over the interval. Please choose different a and b.');
            return;
        }
    
        let iteration = 0;
    
        function addRow(a, b, c, f_a, f_b, f_c) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${iteration}</td>
                <td>${a.toFixed(6)}</td>
                <td>${b.toFixed(6)}</td>
                <td>${c.toFixed(6)}</td>
                <td>${f_a.toFixed(6)}</td>
                <td>${f_b.toFixed(6)}</td>
                <td>${f_c.toFixed(6)}</td>
            `;
            outputElement.appendChild(row);
            row.style.opacity = '0';
            setTimeout(() => {
                row.style.opacity = '1';
            }, 10);
        }
    
        function calculateStep() {
            if (iteration >= iterations) {
                const finalAnswer = b - (f_b * (b - a)) / (f_b - f_a);
                document.getElementById('final-answer').innerHTML = `After ${iterations} iterations, the approximate root is: ${finalAnswer.toFixed(6)}`;
                updateGraph(f, a, b, finalAnswer);
                return;
            }
    
            f_a = f(a);
            f_b = f(b);
    
            if (f_b - f_a === 0) {
                alert('Division by zero encountered in calculating c. Cannot proceed.');
                return;
            }
    
            let c = b - (f_b * (b - a)) / (f_b - f_a);
            let f_c = f(c);
    
            iteration++;
            addRow(a, b, c, f_a, f_b, f_c);
    
            if (Math.abs(f_c) < 1e-12) {
                document.getElementById('final-answer').innerHTML = `An exact root was found at x = ${c.toFixed(6)} after ${iteration} iterations.`;
                updateGraph(f, a, b, c);
                return;
            }
    
            if (f_a * f_c < 0) {
                b = c;
                f_b = f_c;
            } else {
                a = c;
                f_a = f_c;
            }
    
            animationId = requestAnimationFrame(calculateStep);
        }
    

        function updateGraph(f, a, b, root) {
            const ctx = document.getElementById('graph').getContext('2d');
            
            const xValues = [];
            const yValues = [];
            for (let x = a - 1; x <= b + 1; x += 0.1) {
                xValues.push(x);
                yValues.push(f(x));
            }
    
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: xValues,
                    datasets: [{
                        label: 'f(x)',
                        data: yValues,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1
                    }, {
                        label: 'Root Approximation',
                        data: [{ x: root, y: f(root) }],
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        pointRadius: 5,
                        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                        type: 'scatter'
                    }]
                },
                options: {
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    },
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
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    
        calculateStep();
    });

   
