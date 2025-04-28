import express from "express";
import bodyParser from "body-parser";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

import {
    getCurrentDate,
    getCurrentTime,
    getCurrentDateTime,
    dailyAdvice
} from "./helpers.js";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const siteName = "Jagten på den Perfekte Kajkage"
let testPosts = [
    "post-1", "post-2", "post-3",
    "post-4", "post-5", "post-6"
];

app.get("/", (req, res) => {
    res.render("home.ejs", {
        pageTitle: `${siteName}`,
        dailyAdvice: dailyAdvice()
    });
});

app.get("/blog/:pageSlug", (req, res) => {
    if (testPosts.includes(req.params.pageSlug)) {
        res.render("./templates/post.ejs", {
            pageSlug: req.params.pageSlug,
            dateTime: getCurrentDateTime()
        });
    } else {
        res.render("page-404.ejs", {});
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});