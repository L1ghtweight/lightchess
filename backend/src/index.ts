import express from 'express';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/Database";
import router from "./routes/index";
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


app.use(cors({
    origin : true,
    credentials : true
}))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:false}))


app.use(router);

app.listen(5000, ()=> console.log('Server running at port 5000'));
