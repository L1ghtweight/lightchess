import { BrowserRouter, Route, Switch } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import PgnViewer from "./components/PgnViewer";
import Board from "./components/Chessboard";
import { io } from "socket.io-client";
import React from "react";
import { useState } from "react";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import { ThemeProvider } from "@mui/material/styles";

export const AppContext = React.createContext();

const socket = io("ws://localhost:5000", { autoConnect: false });

socket.on("message", (data) => {
  console.log("Got Data : ", data);
});

const initSocket = (name) => {
  if (socket.connected === true || name === "") return;
  socket.connect();
  console.log("Inited socket with", name);
  socket.emit("name", name, (response) => {
    console.log(response);
  });
};

function App() {
  const [userMap, setUserMap] = useState(new Map());
  const [userList, setUserList] = useState([]);

  const updateUserList = () => {
    socket.emit("getusers", "args", (usermap) => {
      let newUserMap = new Map(Object.entries(usermap));
      let users = [];
      newUserMap.forEach((value, key) => {
        users.push({ id: key, name: value.name });
      });
      setUserMap(newUserMap);
      setUserList([...users]);
    });
  };

  return (
    <AppContext.Provider
      value={{
        userList,
        updateUserList,
        socket,
        initSocket,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Switch>
            <Route exact path="/">
              <SignIn />
            </Route>
            <Route exact path="/login">
              <SignIn />
            </Route>
            <Route path="/register">
              <SignUp />
            </Route>
            <Route path="/dashboard">
              <Navbar />
              <Dashboard />
            </Route>
            <Route path="/pgnviewer">
              <Navbar />
              <PgnViewer />
            </Route>
            <Route path="/play">
              <Navbar />
              <Board />
            </Route>
          </Switch>
        </BrowserRouter>
      </ThemeProvider>
    </AppContext.Provider>
  );
}

export default App;
