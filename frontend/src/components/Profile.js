import { useLocation, useHistory } from "react-router-dom"
import { useCallback } from "react"
import axios from "axios"
import { config } from "../config/config_env"
import { Container, Grid } from "@mui/material"
import { useEffect, useState } from "react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import Chart from "react-apexcharts"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import { CardActionArea } from "@mui/material"
import Typography from "@mui/material/Typography"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableRow from "@mui/material/TableRow"
import Paper from "@mui/material/Paper"
import Link from "@mui/material/Link"
import { HistoryOutlined } from "@material-ui/icons"

ChartJS.register(ArcElement, Tooltip, Legend)

function Profile(props) {
    const [, updateState] = useState()
    const forceUpdate = useCallback(() => updateState({}), [])
    const location = useLocation()
    const history = useHistory()
    const username = location.pathname.split("/").at(-1)

    // Needed for date calculation
    var DateDiff = {
        inMinutes: function (d1, d2) {
            var t2 = d2.getTime()
            var t1 = d1.getTime()

            return Math.floor((t2 - t1) / (60 * 1000))
        },

        inHours: function (d1, d2) {
            var t2 = d2.getTime()
            var t1 = d1.getTime()

            return Math.floor((t2 - t1) / (60 * 60 * 1000))
        },

        inDays: function (d1, d2) {
            var t2 = d2.getTime()
            var t1 = d1.getTime()

            return Math.floor((t2 - t1) / (24 * 3600 * 1000))
        },

        inWeeks: function (d1, d2) {
            var t2 = d2.getTime()
            var t1 = d1.getTime()

            return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7))
        },

        inMonths: function (d1, d2) {
            var d1Y = d1.getFullYear()
            var d2Y = d2.getFullYear()
            var d1M = d1.getMonth()
            var d2M = d2.getMonth()

            return d2M + 12 * d2Y - (d1M + 12 * d1Y)
        },

        inYears: function (d1, d2) {
            return d2.getFullYear() - d1.getFullYear()
        },
    }

    const [pieChartData, setPieChartData] = useState({
        labels: ["Wins", "Losses", "Draws"],
        datasets: [
            {
                label: "Game History",
                data: [0, 0, 0],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                ],
                borderWidth: 1,
            },
        ],
    })

    const [lineChartOptions, setLineChartOptions] = useState({
        chart: {
            id: "elo",
        },
        xaxis: {
            categories: [],
        },
        stroke: {
            curve: "smooth",
        },
        fill: {
            type: "solid",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.9,
                stops: [0, 90, 100],
            },
        },
    })

    const [lineChartSeries, setLineChartSeries] = useState([
        {
            name: "elo",
            data: [],
        },
    ])

    const [leftTableData, setLeftTableData] = useState([])
    const [rightTableData, setRightTableData] = useState([])

    useEffect(() => {
        async function getUserInfo() {
            const response = await axios.get(
                `${config.backend}/api/user/${username}`
            )

            const gameHistory = [
                response.data.wins,
                response.data.losses,
                response.data.draws,
            ]

            setPieChartData({
                labels: ["Wins", "Losses", "Draws"],
                datasets: [
                    {
                        label: "Game History",
                        data: gameHistory,
                        backgroundColor: [
                            "rgb(145, 184, 102)",
                            "rgb(219, 113, 113)",
                            "rgb(211, 227, 246)",
                        ],
                        borderWidth: 2,
                    },
                ],
            })

            var eloHistory = response.data.elo_history.split(",")
            for (let i = 0; i < eloHistory.length; i++) {
                eloHistory[i] = parseInt(eloHistory[i])
            }
            const minELO = Math.min(...eloHistory)
            const maxELO = Math.max(...eloHistory)

            setLineChartSeries([
                {
                    name: "elo",
                    data: eloHistory,
                },
            ])

            // set left table data

            function createData(title, num) {
                return { title, num }
            }
            const ltData = []
            ltData.push(
                createData(
                    "Total games played",
                    parseInt(response.data.wins) +
                        parseInt(response.data.losses) +
                        parseInt(response.data.draws)
                )
            )
            ltData.push(createData("Won", response.data.wins))
            ltData.push(createData("Lost", response.data.losses))
            ltData.push(createData("Drawn", response.data.draws))
            ltData.push(createData("Won as WHITE", response.data.winAsWhite))
            ltData.push(createData("Won as BLACK", response.data.winAsBlack))
            ltData.push(createData("Highest Rating", maxELO))
            ltData.push(createData("Lowest Rating", minELO))

            setLeftTableData(ltData)

            // set right table data

            const games = await axios.get(
                `${config.backend}/api/user/${username}/games`
            )

            var gameInfo = games.data
            gameInfo = gameInfo.reverse()

            function genData(
                id,
                whiteUserName,
                blackUserName,
                winnerUserName,
                loserUserName,
                pgn
            ) {
                return {
                    id,
                    whiteUserName,
                    blackUserName,
                    winnerUserName,
                    loserUserName,
                    pgn,
                }
            }
            while (gameInfo.length < 5) {
                gameInfo.push(genData("--", "--", "--", "--", "--", "--"))
            }

            function createRtData(result, opponent, ratingChange, PGN, date) {
                return { result, opponent, ratingChange, PGN, date }
            }

            const rtData = []

            for (let i = 0; i < gameInfo.length; i++) {
                var result = ""
                if (gameInfo[i].winnerUserName === "--") result = "--"
                else if (gameInfo[i].winnerUserName === username) result = "1-0"
                else if (gameInfo[i].winnerUserName !== username) result = "0-1"

                var opponent =
                    gameInfo[i].whiteUserName === username
                        ? gameInfo[i].blackUserName
                        : gameInfo[i].whiteUserName

                var ratingChange = "ratingChange"

                // process date
                var date = gameInfo[i].createdAt

                const now = new Date()
                const gameDate = new Date(date)

                const daysPassed = DateDiff.inDays(gameDate, now)
                const weeksPassed = DateDiff.inWeeks(gameDate, now)
                const yearsPassed = DateDiff.inYears(gameDate, now)
                const minutesPassed = DateDiff.inMinutes(gameDate, now)
                const hoursPassed = DateDiff.inHours(gameDate, now)

                var dateString = ""
                if (yearsPassed > 0) {
                    dateString = yearsPassed + " years ago"
                } else if (weeksPassed > 0) {
                    dateString = weeksPassed + " weeks ago"
                } else if (daysPassed > 0) {
                    dateString = daysPassed + " days ago"
                } else if (hoursPassed > 0) {
                    dateString = hoursPassed + " hours ago"
                } else {
                    dateString = minutesPassed + " minutes ago"
                }

                rtData.push(
                    createRtData(
                        result,
                        opponent,
                        ratingChange,
                        gameInfo[i].pgn,
                        dateString
                    )
                )
            }

            setRightTableData(rtData)
        }

        getUserInfo()
    }, [])

    return (
        <Container component="main" alignItems="center">
            <Typography align="center" variant="h3" gutterBottom>
                {username}
            </Typography>

            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableBody>
                        <TableRow>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <Paper
                                    container
                                    spacing={0}
                                    direction="column"
                                    alignItems="center"
                                    justifyContent="center"
                                    elevation={3}
                                    align="center"
                                    sx={{ width: 300 }}
                                >
                                    <TableContainer>
                                        <Table
                                            sx={{ width: 300 }}
                                            size="small"
                                            aria-label="a dense table"
                                            align="center"
                                        >
                                            <TableBody>
                                                {leftTableData.map((row) => (
                                                    <TableRow
                                                        key={row.name}
                                                        sx={{
                                                            "&:last-child td, &:last-child th":
                                                                {
                                                                    border: 0,
                                                                },
                                                        }}
                                                    >
                                                        <TableCell
                                                            component="th"
                                                            scope="row"
                                                        >
                                                            {row.title}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {row.num}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </TableCell>
                            <TableCell>
                                <Pie
                                    data={pieChartData}
                                    width={350}
                                    height={350}
                                    options={{ maintainAspectRatio: false }}
                                />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
            >
                <Grid item>
                    <Paper
                        container
                        spacing={0}
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                        elevation={3}
                        align="center"
                        sx={{ width: 1200, maxHeight: 200, overflow: "auto" }}
                    >
                        <TableContainer>
                            <Table
                                sx={{
                                    width: 1200,
                                    maxHeight: 200,
                                    tableLayout: "fixed",
                                }}
                                size="small"
                                aria-label="a dense table"
                                align="center"
                            >
                                <TableHead
                                    sx={{
                                        display: "table-header-group",
                                    }}
                                >
                                    <TableRow>
                                        <TableCell align="left">
                                            Result
                                        </TableCell>
                                        <TableCell align="left">
                                            Opponent
                                        </TableCell>
                                        <TableCell align="left">
                                            Rating Change
                                        </TableCell>
                                        <TableCell align="left">PGN</TableCell>
                                        <TableCell align="left">
                                            Time Played
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rightTableData.map((row) => (
                                        <TableRow
                                            // key={row.name}
                                            sx={{
                                                "&:last-child td, &:last-child th":
                                                    {
                                                        border: 0,
                                                    },
                                            }}
                                        >
                                            <TableCell
                                                component="th"
                                                scope="row"
                                                align="left"
                                            >
                                                {row.result}
                                            </TableCell>
                                            <TableCell align="left">
                                                <Link
                                                    underline="hover"
                                                    onClick={() => {
                                                        history.push(
                                                            "/user/" +
                                                                row.opponent
                                                        )
                                                        history.go(0)
                                                    }}
                                                >
                                                    {row.opponent}
                                                </Link>
                                            </TableCell>
                                            <TableCell align="left">
                                                {row.ratingChange}
                                            </TableCell>
                                            <TableCell align="left">
                                                {row.PGN !== "--" ? (
                                                    <Link
                                                        underline="hover"
                                                        onClick={() => {
                                                            history.push({
                                                                pathname:
                                                                    "/pgnviewer",
                                                                pgn: row.PGN,
                                                            })
                                                        }}
                                                    >
                                                        {"View"}
                                                    </Link>
                                                ) : (
                                                    "--"
                                                )}
                                            </TableCell>
                                            <TableCell align="left">
                                                {row.date}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item mt={10}>
                    <Card sx={{ maxWidth: 720 }}>
                        <Chart
                            options={lineChartOptions}
                            series={lineChartSeries}
                            type="line"
                            width="720"
                        />
                        <CardActionArea>
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    variant="h5"
                                    component="div"
                                >
                                    Rating Graph
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    )
}

export default Profile
