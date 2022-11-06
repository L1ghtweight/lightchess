import axios from "axios"
import * as ChessJS from "chess.js"
import { useContext, useEffect, useState, useRef } from "react"
import { useParams } from "react-router"
import { Chessboard } from "react-chessboard"
import { AppContext } from "../App"
import { Grid } from "@mui/material"
import GameInfo from "./GameInfo"
import Timer from "./Timer"
import useSound from "use-sound"
import moveSfx from "./../components/static/sounds/Move.mp3"
import captureSfx from "./../components/static/sounds/Capture.mp3"
import CheckmateSfx from "./../components/static/sounds/Checkmate.mp3"
import parsePgn from "./PgnParser"
import GameEndDialog from "./GameEndDialog.js"
import { Typography, Button } from "@mui/material"
import * as React from "react"
import PropTypes from "prop-types"
import Avatar from "@mui/material/Avatar"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemAvatar from "@mui/material/ListItemAvatar"
import ListItemText from "@mui/material/ListItemText"
import DialogTitle from "@mui/material/DialogTitle"
import Dialog from "@mui/material/Dialog"
import PersonIcon from "@mui/icons-material/Person"
import AddIcon from "@mui/icons-material/Add"
import { blue } from "@mui/material/colors"

function Board() {
    const { socket, userMap, username: myUsername } = useContext(AppContext)
    const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess // For VS code intellisence to work
    const [game, setGame] = useState(new Chess())
    const [position, setPosition] = useState(game.fen())
    const [boardOrientation, setBoardOrientation] = useState("white")

    const [opponentTimeInfo, setOpponentTimeInfo] = useState("05:00")
    const [myTimeInfo, setMyTimeInfo] = useState("05:00")

    const [pgnMoves, setPgnMoves] = useState([])
    const [gameEndMessage, setGameEndMessage] = useState("")
    const [isGameOver, setIsGameOver] = useState(false)

    const { opponent_socket_id, mycolor } = useParams()
    const [opponentUserName] = useState(
        userMap.get(opponent_socket_id)?.username
    )

    const myTimer = useRef()
    const opponentTimer = useRef()

    const [playMoveSfx] = useSound(moveSfx)
    const [playCheckmateSfx] = useSound(CheckmateSfx)

    const [open, setOpen] = React.useState(false)

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = (value) => {
        setOpen(false)
    }

    function gameEndHandler(resigned) {
        setIsGameOver(true)
        var gameResult = ""

        //TODO: Make sure this shows correct result, for all 4 cases:
        // - Checkmate
        // - Resign
        // - Timeover
        // - Draw

        if (resigned) {
            gameResult += myUsername + " Lost"
        } else if (game.isCheckmate()) {
            if (game.inCheck() && game.turn() === boardOrientation) {
                // player lost, opponent won
                gameResult += game.turn() + " Lost"
            } else {
                const opponent = game.turn() === "w" ? "b" : "w"
                gameResult += opponent + " Lost"
            }
        } else if (game.isDraw()) {
            gameResult += "Game Drawn"
            if (game.isInsufficientMaterial()) {
            } else if (game.isStalemate()) {
            } else if (game.isThreefoldRepetition()) {
            }
        }

        socket.emit("game_over", {
            to: opponent_socket_id,
            gameResult,
        })
        console.log("game over")

        // send gameResult through "game_over"

        // update game table
        setGameEndMessage(gameResult)
        handleClickOpen()
        myTimer.current.stopTimer()
        opponentTimer.current.stopTimer()
        console.log(gameResult)
        addGame()
    }

    const areYouWinningSon = () => {
        if (boardOrientation[0] != game.turn()) {
            return true
        }
        return false
    }

    const addGame = async () => {
        try {
            // TODO: set game values properly
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/games`, {
                whiteUserName: mycolor == 1 ? opponentUserName : myUsername,
                blackUserName: mycolor == 1 ? myUsername : opponentUserName,
                winnerUserName: areYouWinningSon
                    ? myUsername
                    : opponentUserName,
                loserUserName: areYouWinningSon ? opponentUserName : myUsername,
                pgn: game.pgn(),
            })
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        console.log("Opponent is ", opponentUserName)
        if (mycolor == 1) setBoardOrientation("black")

        socket.on("send_move", (data) => {
            console.log(data.move)
            game.move(data.move)
            setPosition(game.fen())

            // timer
            myTimer.current.stopTimer()
            opponentTimer.current.startTimer()
            setPgnMoves(parsePgn(game.pgn()))

            // TODO: checkmate sound does not seem to play
            // if (game.isGameOver()) {
            //     playCheckmateSfx()
            //     console.log("checkmate sound played")
            // } else {
            playMoveSfx()
            // }

            if (game.isGameOver()) {
                gameEndHandler()
                // TODO: create a gameResult to send to opponent
            }
            // TODO: sync time
        })

        socket.on("game_over", (data) => {
            setIsGameOver(true)
            setGameEndMessage("Placeholder") // Doesn't call gameEndHandler(), doesn't set message
            // TODO: Make this player call game_over as well.
            handleClickOpen()
            console.log("Game over!", data)
        })

        function convertTimeToString(time) {
            var time_ = time.toString()
            if (time < 10) time_ = "0" + time_

            return time_
        }

        const interval = setInterval(() => {
            // assuming I am white
            const blackTime =
                convertTimeToString(myTimer.current.getMinutes()) +
                ":" +
                convertTimeToString(myTimer.current.getSeconds())
            setOpponentTimeInfo(blackTime)

            const opponentTime =
                convertTimeToString(opponentTimer.current.getMinutes()) +
                ":" +
                convertTimeToString(opponentTimer.current.getSeconds())
            setMyTimeInfo(opponentTime)

            if (
                !isGameOver &&
                myTimer.current.getMinutes() === 0 &&
                myTimer.current.getSeconds() === 0
            ) {
                console.log(isGameOver)
                gameEndHandler(true)
            }
        }, 500)

        return () => {
            socket.off("send_move")
            clearInterval(interval)
        }
    }, [isGameOver])

    function sendMove(move) {
        console.log("Sending Move", move)
        socket.emit("send_move", { to: opponent_socket_id, move })
    }

    function onDrop(sourceSquare, targetSquare) {
        if (isGameOver) {
            console.log("Game is already over")
            return
        } else if (game.turn() !== boardOrientation[0]) {
            console.log("Not your turn!")
            return
        }

        var move = { from: sourceSquare, to: targetSquare }
        var result = game.move(move)

        if (result == null) {
            move = { from: sourceSquare, to: targetSquare, promotion: "q" }
            result = game.move(move)

            if (result == null) {
                console.log("Invalid move")
                return
            }
        }
        // if valid move

        playMoveSfx()

        myTimer.current.startTimer()
        opponentTimer.current.stopTimer()

        setPgnMoves(parsePgn(game.pgn()))
        console.log(parsePgn(game.pgn()))

        setPosition(game.fen())
        sendMove(move)
        console.log(isGameOver)

        if (game.isGameOver()) {
            gameEndHandler()
        }
    }

    function onSquareClick(square) {
        console.log(square)
    }

    return (
        <Grid
            container
            sx={{ mt: 5 }}
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={3}
        >
            <Grid item>
                <GameEndDialog
                    open={open}
                    onClose={handleClose}
                    gameEndMessage={gameEndMessage}
                />
            </Grid>
            <Grid item>
                <Chessboard
                    id="BasicBoard"
                    showBoardNotation="true"
                    position={position}
                    onPieceDrop={onDrop}
                    boardOrientation={boardOrientation}
                    arePremovesAllowed="true"
                    clearPremovesOnRightClick="true"
                    onSquareClick={onSquareClick}
                    boardWidth="720"
                />
            </Grid>
            <Grid item>
                <GameInfo
                    gameEndHandler={gameEndHandler}
                    opponentUserName={opponentUserName}
                    myUsername={myUsername}
                    opponentTimeInfo={opponentTimeInfo}
                    myTimeInfo={myTimeInfo}
                    pgnMoves={pgnMoves}
                    mySide={boardOrientation[0]}
                    turn={game.turn()}
                    gameOver={isGameOver}
                />
            </Grid>
            <Timer
                initialMinute={0}
                initialSeconds={10}
                isTicking={0}
                ref={opponentTimer}
            />
            <Timer
                initialMinute={0}
                initialSeconds={10}
                isTicking={0}
                ref={myTimer}
            />
        </Grid>
    )
}

export default Board
