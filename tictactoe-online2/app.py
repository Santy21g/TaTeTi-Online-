from flask import Flask, request, jsonify, render_template
from game import TicTacToe
from player import Random_computer_player
import time
import os  # 🔹 Importamos 'os' para obtener el puerto de Railway

app = Flask(__name__)
game = TicTacToe()
computer = Random_computer_player("O")  # 🔹 IA que juega como "O"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/play", methods=["POST"])
def play():
    data = request.json
    position = data.get("position")

    if game.make_move(position, "X"):  # 🔹 Movimiento del jugador (instantáneo)
        if game.current_winner:
            return jsonify({"board": game.board, "winner": "X"})

        return jsonify({"board": game.board, "current_player": "O"})  # 🔹 Ahora enviamos el turno

    return jsonify({"error": "Movimiento inválido"}), 400

@app.route("/ai-play", methods=["POST"])
def ai_play():
    time.sleep(0.5)  # 🔹 La IA "piensa" antes de jugar

    ai_move = computer.get_move(game)  # 🔹 La IA elige su movimiento
    game.make_move(ai_move, "O")  # 🔹 La IA marca su jugada

    if game.current_winner:
        return jsonify({"board": game.board, "winner": "O"})

    return jsonify({"board": game.board, "current_player": "X"})  # 🔹 Turno vuelve al jugador

@app.route("/board", methods=["GET"])
def get_board():
    return jsonify({
        "board": game.board,
        "current_player": game.current_player  # 🔹 Enviamos el turno actual
    })

@app.route("/restart", methods=["POST"])
def restart():
    global game  # 🔹 Reinicializa el objeto del juego
    game = TicTacToe()  # 🔹 Crea un nuevo juego vacío
    return jsonify({"board": game.board, "current_player": "X"})  # 🔹 Comienza con el jugador X

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))  # 🔹 Obtiene el puerto de Railway, por defecto usa 8080
    app.run(host="0.0.0.0", port=port)