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
const database = `${__dirname}/database.json`;
import * as fs from 'fs';

app.post("/create-post", (req, res) => {
    console.log(req.body);
});

app.get("/", (req, res) => {
    res.render("home.ejs", {
        pageTitle: `${siteName}`,
        dailyAdvice: dailyAdvice()
    });
});

app.get("/opret-indlaeg", (req, res) => {
    res.render("create-post.ejs", {});
});

app.get("/blog/:pageSlug", (req, res) => {
    fs.readFile(database, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        let parsedDatabase = JSON.parse(data);

        parsedDatabase.posts.forEach((post) => {
            if (req.params.pageSlug === post.postslug) {
                res.render("templates/post.ejs", {
                    pageSlug: post.postslug,
                    postId: post.postid,
                    postDate: post.postdate,
                    dataEaten: post.dateeaten,
                    postTitle: post.posttitle,
                    postImage: post.postimage,
                    bakery: post.bakery,
                    city: post.city,
                    zipCode: post.zipcode,
                    tier: post.tier,
                    postExcerpt: post.postexcerpt,
                    postContent: post.postcontent
                });
            } else {
                res.render("page-404.ejs", {});
            }
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});