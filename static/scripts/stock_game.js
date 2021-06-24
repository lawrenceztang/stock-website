var index = 29;
var bought_index = -1;
var money_made = 0;
var list_data;
var time_held = 0;
var roi = 1;
var annualized_roi = 1;
var hold_roi = 1;
var hold_annualized_roi = 1;

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
  money_made += list_data[index]["open"] - list_data[bought_index]["open"];
  time_held += index - bought_index;
  roi *= list_data[index]["open"] / list_data[bought_index]["open"];
  annualized_roi = Math.pow(roi, 1 / (time_held / 365)) - 1;
  bought_index = -1;
}

function update_hold_roi() {
  hold_roi = (list_data[index]["open"] - list_data[0]["open"]) / list_data[0]["open"];
  hold_annualized_roi = Math.pow(1 + hold_roi, 1 / (index / 365)) - 1;
}

function display_hold_roi() {
    document.getElementById("hold_annualized_roi_display").innerHTML = Math.round(hold_annualized_roi * 100 * 100) / 100 + "%";
}

function display_current_price() {
  document.getElementById("current-price").innerHTML = Math.round(list_data[index]["open"] * 100) / 100;
}

function run(in_data, ticker) {
  list_data = in_data;
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

  setInterval(function() {
    index++;
    x = []
    y = []
    for(let j = index - 29; j <= index; j++) {
      x.push(list_data[j]["open"]);
      y.push(list_data[j]["date"]);
    }

    myChart.data.datasets[0].data = x;
    myChart.data.labels = y;
    myChart.update();

    update_hold_roi();
    display_hold_roi();
    display_current_price();
  }, 1000);
}
