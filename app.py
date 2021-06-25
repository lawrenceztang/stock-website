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

@app.route("/nav.html")
def test():
    return render_template("nav.html")

@app.route("/spot-the-difference")
def spot_the_difference():
    return render_template("spot_the_difference.html")

@app.route("/")
def game_options():
    return render_template("game_options.html")

@app.route("/stock-sim", methods=["POST"])
def stock_sim():
    ticker = request.form["ticker"]
    year = request.form["year"]
    #check is valid - TODO
    return render_template("stock_game.html", ticker=ticker, date=year)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
