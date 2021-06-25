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
}

function sell_stock() {
  money_made += get_open(index) - get_open(bought_index);
  time_held += index - bought_index;
  roi *= get_open(index) / get_open(bought_index);
  annualized_roi = Math.pow(roi, 1 / (time_held / 365)) - 1;
  bought_index = -1;
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
  return -1;
}

function done() {

}

function run(ticker, date) {
  alpha.data.daily(ticker, "full", "json", 1).then((d) => {

    for(var key in d["Time Series (Daily)"]) {
      list_data.push([key, d["Time Series (Daily)"][key]["1. open"]]);
    }

    const labels = [];
    const data = {
      labels: labels,
      datasets: [{
        label: 'Price of ' + ticker,
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
      document.getElementById('myChart'),
      config
    );

    start_index = get_start_index(date);

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

      myChart.data.datasets[0].data = x;
      myChart.data.labels = y;
      myChart.update();

      update_hold_roi();
      display_hold_roi();
      display_current_price();
    }, 1000);
  });
}
