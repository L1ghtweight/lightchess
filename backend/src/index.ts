import express from 'express';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/Database";
import router from "./routes/index";
import grouter from './routes/grouter'
import session from "express-session";
import passport from 'passport';


dotenv.config();
const app = express();

(async ()=>{
    try {
        await db.sync()
        await db.authenticate();
        console.log('Database Connected...');
    } catch (error) {
        console.error(error);
    }
})()


// app.use(cors({ credentials:true, origin: true }));
// app.use(cors());
app.use(cors({
    origin : true,
    credentials : true
}))
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize())
// app.use(passport.session())
app.use(session({
  secret: 'keyboard cat',
  resave: false, // don't save session if unmodified
  saveUninitialized: false // don't create session until something stored
}));
passport.authenticate('session')
app.use(router);
app.use(grouter)

app.listen(5000, ()=> console.log('Server running at port 5000'));
