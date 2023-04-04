# LightChess
An online chess platform featuring multiple game formats, a matchmaking algorithm, and an integrated rating system where Players can compete against each 
other and track their progress through our leaderboards, creating an engaging and rewarding experience for chess enthusiasts.

# Tech Stack
  <p align="center">
    <a href=""><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"></a>
    <a href=""><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"></a>
    <a href=""><img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge"></a>
    <a href=""><img src="https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white"></a>
    <a href=""><img src="https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white"></a>
    <a href=""><img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101"></a>
   </p>
   
# Other Dependencies
## Frontend
- [Material UI](https://mui.com/)
- [axios](https://axios-http.com/)
- [chess.js](https://github.com/jhlywa/chess.js)
- [react-chessboard](https://github.com/Clariity/react-chessboard)
- [react-chartjs-2](https://react-chartjs-2.js.org/)
- [react-apexcharts](https://apexcharts.com/docs/react-charts/)
- [pgn-viewer](https://github.com/mliebelt/PgnViewerJS)

## Backend, Authentication and Database
- [JWT](https://jwt.io/)
- [passport](https://www.passportjs.org/)

# Features

# Development

```bash
git clone https://github.com/L1ghtweight/lightchess
cd lightchess
```

## Environment variables

```conf
DB_URL="mariadb:.."
```


## Starting dev servers

```bash
cd frontend
npm install
cd ../backend/
npm install
```

Start both backend and frontend with `npm start`


# Production build

```bash
cd frontend
npm run build
cd ../backend
npm run build
```

now run the build with `npm run production`
