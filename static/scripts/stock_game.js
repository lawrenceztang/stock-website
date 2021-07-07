var NUM_POINTS = 30;
var index = 29;
var bought = false;
var bought_indexes = [];
var sold_indexes = [];
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

var algo_dict = {"none": "none", "dip": dip_algorithm, "rise": rise_algorithm, "support": support_resistance_algorithm};

function sma(n) {
  var sum = 0;
  for(var i = index - n + 1; i <= index; i++) {
    sum += get_price(i);
  }
  sum /= n;
  return sum;
}

function support_resistance_algorithm() {
  if(get_price(index) < sma(30)) {
    buy_stock();
  }
  if(get_price(index) > sma(30)) {
    sell_stock();
  }
}

function dip_algorithm() {
  if(get_price(index) < get_price(index - 1)) {
    buy_stock();
  }
  else {
    sell_stock();
  }
}

function rise_algorithm() {
  if(get_price(index) > get_price(index - 1)) {
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
  if(!bought) {
    bought = true;
    bought_indexes.push(index);
    if(display) {
      display_annotations();
      document.getElementById("buy_sell").style.backgroundColor = "red";
      document.getElementById("buy_sell").innerHTML = "Sell";
      myChart.update();
    }
  }
}

function sell_stock() {
  if(bought) {
    bought = false;
    sold_indexes.push(index);
    if(display) {
      display_annotations();
      document.getElementById("buy_sell").style.backgroundColor = "green";
      document.getElementById("buy_sell").innerHTML = "Buy";
      myChart.update();
    }
  }
}

function update_roi() {
  if(bought) {
    money_made += get_price(index) - get_price(index - 1);
    time_held++;

    roi *= get_price(index) / get_price(index - 1);
    annualized_roi = Math.pow(roi, 1 / (time_held / divisor[interval])) - 1;
  }
}

function update_hold_roi() {
  hold_roi = (get_price(index) - get_price(29)) / get_price(29);
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
  document.getElementById("current-price").innerHTML = Math.round(get_price(index) * 100) / 100;
}

function display_time_held() {
  document.getElementById("time_held_display").innerHTML = time_held;
}

function display_roi() {
  document.getElementById("roi_display").innerHTML = Math.round((roi - 1) * 100 * 100) / 100 + "%";
}

function display_annotations() {
  var annotations = {};
  for(const index of bought_indexes) {
    if(myChart.data.labels.includes(get_date(index))) {
      annotations[index] = 
      {
        type: 'line',
        xMin: get_date(index),
        xMax: get_date(index),
        borderColor: 'rgba(150, 200, 150, .8)',
        borderWidth: 2,
        label: {content: "Bought", enabled: true, backgroundColor: 'rgba(150, 200, 150, .8)'}
      };
    }
 }

 for(const index of sold_indexes) {
  if(myChart.data.labels.includes(get_date(index))) {
    annotations[index] = 
    {
      type: 'line',
      xMin: get_date(index),
      xMax: get_date(index),
      borderColor: 'rgba(200, 150, 150, .8)',
      borderWidth: 2,
      label: {content: "Sold", enabled: true, backgroundColor: 'rgba(200, 150, 150, .8)'}
    };
  }
}

 myChart.config.options.plugins.annotation.annotations = annotations;
}

function get_date(index) {
  return list_data[start_index - index][0];
}

function get_price(index) {
  return parseFloat(list_data[start_index - index][1]);
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
      borderColor: 'rgb(150, 150, 214)', 
      data: [],
    }]
  };

  const config = {
    type: 'line',
    data,
    options: 
      {
        responsive:true,
        maintainAspectRatio: false,
        animations: false,
        elements: {point: {radius: 1}},

        plugins: {
          annotation: {
            drawTime: "afterDatasetsDraw",
            annotations: {}
          }
        }
      }
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
    x.push(get_price(j));
    y.push(get_date(j));
  }

  myChart.data.datasets[0].data = x;
  myChart.data.labels = y;
  display_annotations();
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