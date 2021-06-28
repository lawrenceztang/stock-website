var index = 29;
var bought_index = -1;
var money_made = 0;
var list_data = [];
var time_held = 0;
var roi = 1;
var annualized_roi = 1;
var hold_roi = 1;
var hold_annualized_roi = 1;
const alpha = alphavantage({ key: 'P82FZXGPGDWO4M1I' });
var start_index;
var myChart;

function buy_sell_toggle() {
  if(bought_index == -1) {
    buy_stock();
    document.getElementById("buy_sell").style.backgroundColor = "red";
    document.getElementById("buy_sell").innerHTML = "Sell";
  }
  else {
    sell_stock();
    document.getElementById("annualized_roi_display").innerHTML = Math.round(annualized_roi * 100 * 100) / 100 + "%";
    document.getElementById("buy_sell").style.backgroundColor = "green";
    document.getElementById("buy_sell").innerHTML = "Buy";
  }
}

function buy_stock() {
  bought_index = index;
  myChart.data.datasets[0].backgroundColor[29] = 'rgb(0, 255, 0)';
}

function sell_stock() {
  money_made += get_open(index) - get_open(bought_index);
  time_held += index - bought_index;
  roi *= get_open(index) / get_open(bought_index);
  annualized_roi = Math.pow(roi, 1 / (time_held / 365)) - 1;
  bought_index = -1;
  myChart.data.datasets[0].backgroundColor[29] = 'rgb(255, 0, 0)';
}

function update_hold_roi() {
  hold_roi = (get_open(index) - get_open(0)) / get_open(0);
  hold_annualized_roi = Math.pow(1 + hold_roi, 1 / (index / 365)) - 1;
}

function display_hold_roi() {
    document.getElementById("hold_annualized_roi_display").innerHTML = Math.round(hold_annualized_roi * 100 * 100) / 100 + "%";
}

function display_current_price() {
  document.getElementById("current-price").innerHTML = Math.round(get_open(index) * 100) / 100;
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

}

function run(ticker, date, interval) {
  if(interval == "(Daily)") {
    alpha.data.daily(ticker, "full", "json", 1).then((d) => {
      play(ticker, date, d, interval);
    });
  }
  else if(interval == "(5min)") {
    alpha.data.intraday(ticker, "full", "json", "5min").then((d) => {
      play(ticker, date, d, interval);
    });
  }
}

function play(ticker, date, d, interval) {

  for(var key in d["Time Series " + interval]) {
    list_data.push([key, d["Time Series " + interval][key]["1. open"]]);
  }
  console.log(list_data);

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
              maintainAspectRatio: false}
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

  setInterval(function() {
    index++;

    if(index + 30 >= list_data.length) {
      done();
    }

    x = []
    y = []
    for(let j = index - 29; j <= index; j++) {
      x.push(get_open(j));
      y.push(get_date(j));
    }

    myChart.data.datasets[0].backgroundColor.shift();
    myChart.data.datasets[0].backgroundColor.push('rgb(0, 0, 255)');

    myChart.data.datasets[0].data = x;
    myChart.data.labels = y;
    myChart.update();

    update_hold_roi();
    display_hold_roi();
    display_current_price();
  }, 1000);
}