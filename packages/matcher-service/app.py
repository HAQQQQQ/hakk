from flask import Flask

app = Flask(__name__)

@app.route("/", methods=["GET"])
def index():
    print('In Python Api!')
    return "Matcher service is running!"

if __name__ == "__main__":
    app.run(debug=True, port=5000)
