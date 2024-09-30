 let functionGraph;

  document.getElementById('bisection-form').addEventListener('submit', async function (e) {
      e.preventDefault();

      const funcInput = document.getElementById('function').value || 'x^3 - x - 10'; // Default function
      const aInput = document.getElementById('interval-a').value;
      const bInput = document.getElementById('interval-b').value;
      const iterationsInput = document.getElementById('iterations').value;

      let a = aInput !== '' ? parseFloat(aInput) : 1; // If empty, default to 1.5
      let b = bInput !== '' ? parseFloat(bInput) : 3; // If empty, default to 2
      const iterations = iterationsInput !== '' ? parseInt(iterationsInput) : 5; // Default iterations to 5 if empty

      const outputElement = document.querySelector('#steps-table tbody');
      outputElement.innerHTML = ''; // Clear previous output
      document.getElementById('final-answer').innerHTML = '';

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

      let iteration = 0;
      const tolerance = 0.000001; // Define a tolerance level

      function addRow(a, b, c, f_a, f_b, f_c) {
          const row = `<tr>
              <td>${iteration}</td>
              <td>${a.toFixed(6)}</td>
              <td>${b.toFixed(6)}</td>
              <td>${c.toFixed(6)}</td>
              <td>${f_a.toFixed(6)}</td>
              <td>${f_b.toFixed(6)}</td>
              <td>${f_c.toFixed(6)}</td>
          </tr>`;
          outputElement.innerHTML += row;
      }

      if (f(a) * f(b) > 0) {
          alert('f(a) and f(b) must have opposite signs. No root in this interval.');
          return;
      }

      function calculateStep() {
          if (iteration >= iterations) {
              const finalAnswer = (a + b) / 2;
              document.getElementById('final-answer').innerHTML = `After ${iterations} iterations, the approximate root is: ${finalAnswer.toFixed(6)}`;
              updateGraph(funcInput, a, b, finalAnswer);
              return;
          }

          let c = (a + b) / 2;
          let f_a = f(a);
          let f_b = f(b);
          let f_c = f(c);

          addRow(a, b, c, f_a, f_b, f_c);

          if (Math.abs(f_c) < tolerance) {
              document.getElementById('final-answer').innerHTML = `The root is approximately: ${c.toFixed(6)} after ${iteration + 1} iterations.`;
              updateGraph(funcInput, a, b, c);
              return;
          }

          if (f_a * f_c < 0) {
              b = c;
          } else {
              a = c;
          }

          iteration++;
          setTimeout(calculateStep, 100);  // Reduced delay for smoother animation
      }

      calculateStep();
      updateGraph(funcInput, a, b);
  });



  function updateGraph(funcInput, a, b, approxRoot = null) {
            const ctx = document.getElementById('functionGraph').getContext('2d');
            
            // Destroy existing chart if it exists
            if (functionGraph) {
                functionGraph.destroy();
            }

            // Generate data points
            const points = 200;
            const data = [];
            const margin = (b - a) * 0.1; // Add 10% margin on each side
            const xMin = a - margin;
            const xMax = b + margin;
            const step = (xMax - xMin) / points;

            for (let x = xMin; x <= xMax; x += step) {
                try {
                    const y = math.evaluate(funcInput, { x: x });
                    if (isFinite(y)) {
                        data.push({ x: x, y: y });
                    }
                } catch (error) {
                    console.error('Error evaluating function:', error);
                }
            }

            // Dataset for the function graph
            const datasets = [{
                label: 'f(x)',
                data: data,
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 2,
                fill: false,
                pointRadius: 0
            }];

            // If the approximate root is provided, add it as a red point
            if (approxRoot !== null) {
                datasets.push({
                    label: 'Approximate Root',
                    data: [{ x: approxRoot, y: math.evaluate(funcInput, { x: approxRoot }) }],
                    backgroundColor: 'red',
                    borderColor: 'red',
                    pointRadius: 5,
                    pointHoverRadius: 8
                });
            }

            // Create the chart
            functionGraph = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: datasets
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
                            },
                            min: xMin,
                            max: xMax
                        },
                        y: {
                            type: 'linear',
                            position: 'left',
                            title: {
                                display: true,
                                text: 'f(x)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.x !== null) {
                                        label += `(${context.parsed.x.toFixed(4)}, ${context.parsed.y.toFixed(4)})`;
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }
