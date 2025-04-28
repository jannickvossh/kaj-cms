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

const siteName = "Jagten på den Perfekte Kajkage"

app.get("/", (req, res) => {
    res.render("home.ejs", {
        pageTitle: `${siteName}`,
        dailyAdvice: dailyAdvice()
    });
});

app.get("/blog/:pageSlug", (req, res) => {
    res.render("./templates/post.ejs", {
        pageSlug: req.params.pageSlug
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});