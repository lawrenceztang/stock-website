import os

from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, Flask, jsonify
)
import csv
import json
import random
import numpy as np
import sys

app = Flask(__name__)

def random_data(mean_start, std_start, mean_delta_percent, std_delta_percent):
    data = [random.gauss(mean_start, std_start)]
    for i in range(29):
        data.append(data[len(data) - 1] + data[len(data) - 1] * random.gauss(mean_delta_percent, std_delta_percent))
    return data

def get_delta_percents(list):
    out = []
    for i in range(1, len(list)):
        out.append((float(list[i]) - float(list[i - 1])) / float(list[i - 1]))
    return out

thirty_day_dataset = []
THIRTY_DAY_FILE_NAME = "30-day-stocks-small.csv"
def make_dataset():
    with open(THIRTY_DAY_FILE_NAME) as file:
        i = 0
        for line in file:
            if i >= 1000:
                break
            stripped = line.strip()
            lst = stripped.split(",")
            prices = list(map(float, lst[2:]))
            thirty_day_dataset.append([lst[0], lst[1], prices])
            i += 1

@app.route("/nav.html")
def test():
    return render_template("nav.html")

@app.route("/spot-the-difference")
def spot_the_difference():
    return render_template("spot_the_difference.html")

@app.route("/get-real-fake-data")
def get_real_fake_data():
    if len(thirty_day_dataset) == 0:
        make_dataset()
    data = thirty_day_dataset[random.randint(0, len(thirty_day_dataset))]
    real_data = data[2]
    delta_percents = get_delta_percents(real_data)
    fake_data = random_data(real_data[0], 0, np.mean(delta_percents), np.std(delta_percents))
    return jsonify([data[0], data[1], real_data, fake_data])

@app.route("/")
def game_options():
    return render_template("game_options.html")

@app.route("/stock-sim", methods=["POST"])
def stock_sim():
    ticker = request.form["ticker"]
    year = request.form["year"]
    interval = request.form["interval"]
    print(request.form, file=sys.stderr)
    #check is valid - TODO
    return render_template("stock_game.html", ticker=ticker, date=year, interval=interval)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
