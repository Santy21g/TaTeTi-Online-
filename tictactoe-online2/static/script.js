async function makeMove(position) {
    let response = await fetch("/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position })
    });

    let data = await response.json();
    updateBoard(data.board);

    if (data.winner) {
        mostrarMensaje("ganador", data.winner);
        resaltarGanador(data.winning_positions);
        return;
    } else if (data.tie) {
        mostrarMensaje("empate");
        return;
    }

    setTimeout(async () => {
        response = await fetch("/ai-play", { method: "POST" });
        data = await response.json();
        updateBoard(data.board);

        if (data.winner) {
            mostrarMensaje("perdedor");
            resaltarGanador(data.winning_positions);
        } else if (data.tie) {
            mostrarMensaje("empate");
        }
    }, 100);
}

async function updateBoard() {
    const response = await fetch("/board");
    const data = await response.json();

    const cells = document.querySelectorAll(".cell");
    data.board.forEach((value, index) => {
        cells[index].textContent = value;
        if (value !== "") {
            marcarCasilla(index);
        }
    });

    actualizarTurno(data.current_player);
}

window.onload = updateBoard;

document.getElementById("restart").addEventListener("click", async () => {
    await fetch("/restart", { method: "POST" });

    document.querySelectorAll(".cell").forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("ganadora");
    });

    updateBoard();

    const mensaje = document.getElementById("mensaje-resultado");
    mensaje.style.opacity = "0";
    mensaje.style.transform = "scale(0.8)";
    setTimeout(() => {
        mensaje.style.display = "none";
    }, 500);
});

function mostrarMensaje(resultado, jugador = "") {
    const mensaje = document.getElementById("mensaje-resultado");

    if (resultado === "ganador") {
        mensaje.textContent = `¡${jugador} ha ganado!`;
    } else if (resultado === "perdedor") {
        mensaje.textContent = "Has perdido, ¡inténtalo de nuevo!";
    } else if (resultado === "empate") {
        mensaje.textContent = "¡Es un empate! Buen juego.";
    }

    mensaje.style.display = "block";
    mensaje.style.opacity = "1";
    mensaje.style.transform = "scale(1)";
}

function resaltarGanador(posiciones) {
    posiciones.forEach(index => {
        document.querySelectorAll(".cell")[index].classList.add("ganadora");
    });
}

function marcarCasilla(index) {
    document.querySelectorAll(".cell")[index].classList.add("marcada");
    setTimeout(() => {
        document.querySelectorAll(".cell")[index].classList.remove("marcada");
    }, 200);
}

function actualizarTurno(jugador) {
    document.getElementById("turno-actual").textContent = `Turno de ${jugador}`;
}

document.getElementById("restart").addEventListener("click", async () => {
    const board = document.querySelector(".board");
    board.classList.add("fade-out");

    setTimeout(async () => {
        await fetch("/restart", { method: "POST" });
        updateBoard();
        board.classList.remove("fade-out");
    }, 500);
});