var correct;
var num_done = 0;
var num_correct = 0;
var chart_1;
var chart_2;

function initialize_chart(id, label) {
    const labels = Array(30).fill().map((element, index) => index + 1);
    const data = {
      labels: labels,
      datasets: [{
        label: label,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [],
      }]
    };

    const config = {
      type: 'line',
      data,
      options: {responsive:true,
                maintainAspectRatio: false}
    };

    var myChart = new Chart(
      document.getElementById(id),
      config
    );
    return myChart;
}

function initialize_charts() {
  chart_1 = initialize_chart("chart1", "Stock Price 1")
  chart_2 = initialize_chart("chart2", "Stock Price 2")
  reset();
}

function fill_charts(real, fake) {
  if(Math.random() > .5) {
    chart_1.data.datasets[0].data = fake;
    chart_2.data.datasets[0].data = real;
    correct = "right";
  }
  else {
    chart_1.data.datasets[0].data = real;
    chart_2.data.datasets[0].data = fake;
    correct = "left";
  }
  chart_1.update();
  chart_2.update();
}

var f = [];
function factorial (n) {
  if (n == 0 || n == 1)
    return 1;
  if (f[n] > 0)
    return f[n];
  return f[n] = factorial(n-1) * n;
}

//One ended p-value
function get_p_value(p, n, x) {
  return factorial(n) / (factorial(n - x) * factorial(x)) * Math.pow(p, x) * Math.pow(1 - p, n - x);
}

function answer_chosen() {
  document.getElementById("instructions").innerHTML = "Click anywhere to continue";
  document.getElementById("p-value").innerHTML = Math.round(get_p_value(num_correct / num_done, num_done, Math.floor(.5 * num_done)) * 2 * 100) / 100;
  document.getElementById("accuracy").innerHTML = num_correct + "/" + num_done + " (" + Math.round(num_correct / num_done * 100 * 100) / 100 + "%)";
  document.getElementById("chart1").removeEventListener("click", select_left);
  document.getElementById("chart2").removeEventListener("click", select_right);
  setTimeout(display_continue, 200);
}

function select_left() {
  if(correct == "left") {
    display_correct();
    num_correct++;
  }
  else {
    display_wrong();
  }
  num_done++;
  answer_chosen();
}

function select_right() {
  if(correct == "right") {
    display_correct();
    num_correct++;
  }
  else {
    display_wrong();
  }
  num_done++;
  answer_chosen();
}

function get_data() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/get-real-fake-data", true);
  xhr.responseType = "json";
  xhr.onload = function() {
    fill_charts(xhr.response[2], xhr.response[3]);
    document.getElementById("chart1").addEventListener("click", select_left);
    document.getElementById("chart2").addEventListener("click", select_right);
    document.getElementById("correct").innerHTML = (xhr.response[0] + ", " + xhr.response[1]);
  };
  xhr.send();
}

function reset() {
  document.body.style.backgroundColor = "white";
  get_data();
  document.getElementById("body").removeEventListener("click", reset);
  document.getElementById("instructions").innerHTML = "Select the real stock graph";
}

function display_continue(num_done, num_correct) {
  document.getElementById("body").addEventListener("click", reset);
}

function display_correct() {
  document.body.style.backgroundColor = "green";
  document.getElementById("correct").innerHTML = "Correct!";
}

function display_wrong() {
  document.body.style.backgroundColor = "red";
  document.getElementById("correct").innerHTML = "Wrong!";
}