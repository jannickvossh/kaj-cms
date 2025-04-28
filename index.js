import express from "express";
import bodyParser from "body-parser";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

import {
    dailyAdvice
} from "./helpers.js";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs", { 
        dailyAdvice: dailyAdvice()
    });
});

app.post("/submit", (req, res) => {
    console.log(req.body);
    res.send(`Tak skal du have, ${req.body.firstname} ${req.body.lastname}!`);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});