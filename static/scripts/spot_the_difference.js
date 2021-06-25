var correct;
var num_done = 0;
var num_correct = 0;
var chart_1;
var chart_2;
const alpha = alphavantage({ key: 'P82FZXGPGDWO4M1I' });

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

function fill_charts(data) {
  if(Math.random() > .5) {
    chart_1.data.datasets[0].data = data[1];
    chart_2.data.datasets[0].data = data[0];
    correct = "right";
  }
  else {
    chart_1.data.datasets[0].data = data[0];
    chart_2.data.datasets[0].data = data[1];
    correct = "left";
  }
  chart_1.data.labels = data[2];
  chart_2.data.labels = data[2];
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
  setTimeout(display_continue, 500);
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

function random_ticker() {
  var http = new XMLHttpRequest();
  http.open("GET", "https://cloud.iexapis.com/stable/ref-data/symbols?token=pk_7ca0abb335474d08baeddfba070af8e3", true);
  http.responseType = "json";
  http.onload = function() { 
    get_data(http.response[Math.floor(Math.random() * http.response.length)]["symbol"]);
  };
  http.send(null);
}

function gaussian() {
  var u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function random_data(start_price, avg_percent_change, std_percent_change) {
  out = [start_price];
  for(var i = 1; i < 30; i++) {
    out.push(out[i - 1] + out[i - 1] * (gaussian() * std_percent_change + avg_percent_change));
  }
  return out;
}

function get_percent_deltas(data) {
  var out = [];
  for(var i = 1; i < data.length; i++) {
    out.push((data[i] - data[i - 1]) / data[i - 1]);
  }
  return out;
}

function mean(array) {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return mean;
}

function std (array) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

function get_data(ticker) {
  alpha.data.daily(ticker, "full", "json", 1).then((d) => {
    var length = Object.keys(d["Time Series (Daily)"]).length;
    var start_index = Math.floor(Math.random() * (length - 31));
    var count = 0;
    var real_data = [];
    var dates = []
    for(var key in d["Time Series (Daily)"]) {
      if(count >= start_index + 30) {
        date = key;
        break;
      }
      if(count >= start_index) {
        dates.unshift(key);
        real_data.unshift(parseInt(d["Time Series (Daily)"][key]["1. open"]));
      }
      count++;
    }
    var percent_deltas = get_percent_deltas(real_data);
    fill_charts([real_data, random_data(real_data[0], mean(percent_deltas), std(percent_deltas)), dates]);
    document.getElementById("chart1").addEventListener("click", select_left);
    document.getElementById("chart2").addEventListener("click", select_right);
    document.getElementById("correct").innerHTML = (ticker);
  });

}
function reset() {
  document.body.style.backgroundColor = "white";
  random_ticker();
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
