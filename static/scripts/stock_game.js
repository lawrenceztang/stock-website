var NUM_POINTS = 30;
var index = 29;
var bought = false;
var money_made = 0;
var list_data = [];
var time_held = .001;
var roi = 1;
var annualized_roi = 1;
var hold_roi = 1;
var hold_annualized_roi = 1;
const alpha = alphavantage({ key: 'P82FZXGPGDWO4M1I' });
var start_index = 29;
var myChart;
var interval;
var playing = true;
var interval_timer;
var display = true;
var algorithm = "none";
var finished = false;

var std_change_hold;
var mean_change_hold;

var divisor = {"(Daily)": 365, "(5min)": 105120};

var algo_dict = {"none": "none", "dip": dip_algorithm, "rise": rise_algorithm};

function dip_algorithm() {
  if(get_open(index) < get_open(index - 1)) {
    buy_stock();
  }
  else {
    sell_stock();
  }
}

function rise_algorithm() {
  if(get_open(index) > get_open(index - 1)) {
    buy_stock();
  }
  else {
    sell_stock();
  }
}

function buy_sell_toggle() {
  if(!bought) {
    buy_stock();
  }
  else {
    sell_stock();
  }
}

function pause_play_toggle() {
  playing = !playing;
  if(playing) {
    document.getElementById("pause_play").innerHTML = "&#9612 &#9612";
    interval_timer = setInterval(step, 1000);
  }
  else {
    document.getElementById("pause_play").innerHTML = "&#9658";
    clearInterval(interval_timer);
  }
}

function skip() {
  display = false;
  clearInterval(interval_timer);
  while(!finished) {
    step();
  }
  update_display();
}

function buy_stock() {
  bought = true;
  if(display) {
    document.getElementById("buy_sell").style.backgroundColor = "red";
    document.getElementById("buy_sell").innerHTML = "Sell";
  }
}

function sell_stock() {
  bought = false;
  if(display) {
    document.getElementById("buy_sell").style.backgroundColor = "green";
    document.getElementById("buy_sell").innerHTML = "Buy";
  }
}

function update_roi() {
  if(bought) {
    money_made += get_open(index) - get_open(index - 1);
    time_held++;

    roi *= get_open(index) / get_open(index - 1);
    annualized_roi = Math.pow(roi, 1 / (time_held / divisor[interval])) - 1;
  }
}

function update_hold_roi() {
  hold_roi = (get_open(index) - get_open(29)) / get_open(29);
  hold_annualized_roi = Math.pow(1 + hold_roi, 1 / ((index - 29) / divisor[interval])) - 1;
}

function getStandardDeviation(array) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

function get_mean(array) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  return mean;
}

function get_std_change_hold() {
  var list = [];
  for(var i = 1; i < list_data.length; i++) {
    list.push((list_data[i] - list_data[i - 1]) / list_data[i - 1]);
  }
  std_change_hold = getStandardDeviation(list);
  mean_change_hold = get_mean(list);
}

function get_p_value() {
  
}

function display_annualized_roi() {
  document.getElementById("annualized_roi_display").innerHTML = Math.round(annualized_roi * 100 * 100) / 100 + "%";
}

function display_hold_roi() {
    document.getElementById("hold_annualized_roi_display").innerHTML = Math.round(hold_annualized_roi * 100 * 100) / 100 + "%";
}

function display_current_price() {
  document.getElementById("current-price").innerHTML = Math.round(get_open(index) * 100) / 100;
}

function display_time_held() {
  document.getElementById("time_held_display").innerHTML = time_held;
}

function display_roi() {
  document.getElementById("roi_display").innerHTML = Math.round((roi - 1) * 100 * 100) / 100 + "%";
}

function get_date(index) {
  return list_data[start_index - index][0];
}

function get_open(index) {
  return list_data[start_index - index][1];
}

function get_start_index(date) {
  for(var i = 0; i < list_data.length; i++) {
    if(date > parseInt(list_data[i][0].split(" "))) {
      return i;
    }
  }
  return list_data.length - 30;
}

function done() {
  clearInterval(interval_timer);
  finished = true;
}

function run(ticker, date, inter, algo) { 
  algorithm = algo_dict[algo];
  
  interval = inter;
  if(interval == "(Daily)") {
    alpha.data.daily(ticker, "full", "json", 1).then((d) => {
      play(ticker, date, d);
    });
  }
  else if(interval == "(5min)") {
    alpha.data.intraday(ticker, "full", "json", "5min").then((d) => {
      play(ticker, date, d);
    });
  }
}

function play(ticker, date, d) {

  for(var key in d["Time Series " + interval]) {
    list_data.push([key, d["Time Series " + interval][key]["4. close"]]);
  }

  const labels = [];
  const data = {
    labels: labels,
    datasets: [{
      label: 'Price of ' + ticker,
      backgroundColor: [],
      borderColor: 'rgb(191, 209, 214)', 
      data: [],
    }]
  };

  const config = {
    type: 'line',
    data,
    options: {responsive:true,
              maintainAspectRatio: false,
              animations: false,
              elements: {point: {radius: 1}}}
  };

  myChart = new Chart(
    document.getElementById('myChart'),
    config
  );

  start_index = get_start_index(date);

  var count = 30;
  while(count--) {
    myChart.data.datasets[0].backgroundColor.push('rgb(0, 0, 255)');
  }

  interval_timer = setInterval(step, 1000);
}

function update_display() {
  x = []
  y = []
  for(let j = index - 29; j <= index; j++) {
    x.push(get_open(j));
    y.push(get_date(j));
  }

  myChart.data.datasets[0].data = x;
  myChart.data.labels = y;
  myChart.update();

  display_hold_roi();
  display_current_price();
  display_roi();
  display_time_held();
  display_annualized_roi();
}

function step() {
  index++;

  if(index >= start_index) {
    done();
  }

  update_roi();
  update_hold_roi();

  if(algorithm != "none") {
    algorithm();
  }

  if(display) { 
    update_display();
  }
}