import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { marked } from 'marked';
import { minify } from 'htmlfy';
dotenv.config();
import mongoose from 'mongoose';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import * as fs from 'fs';

import {
    getCurrentDate,
    getCurrentTime,
    getCurrentDateTime,
    dailyAdvice,
    slugify
} from './helpers.js';

const app = express();
const port = 3000;

const siteName = "Jagten på den Perfekte Kajkage";
const localDatabase = `${__dirname}/database.json`;

const databaseUri = process.env.CONNECTION_STRING;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Schema
const Schema = mongoose.Schema;

const BlogPost = new Schema({
    pageslug: String,
    postdate: String,
    dateeaten: String,
    posttitle: String,
    postimage: String,
    bakery: String,
    city: String,
    zipcode: String,
    tier: String,
    postexcerpt: String,
    postcontent: String
});

const Post = mongoose.model('BlogPost', BlogPost);

app.post("/create-post", (req, res) => {
    let parsedPostContent = marked.parse(req.body.postcontent);
    parsedPostContent = minify(parsedPostContent);
    console.log(parsedPostContent);

    // const newPost = new Post({
    //     pageslug: slugify(req.body.posttitle),
    //     postdate: getCurrentDateTime(),
    //     posttitle: req.body.posttitle,
    //     postimage: `${__dirname}/public/img/kajkage_nytorv-konditori.webp`,
    //     bakery: req.body.bakery,
    //     city: req.body.city,
    //     zipcode: req.body.zipcode,
    //     tier: req.body.tier,
    //     postexcerpt: req.body.postexcerpt,
    //     postcontent: parsedPostContent
    // });
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
    fs.readFile(localDatabase, 'utf8', (err, data) => {
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

mongoose.connect(databaseUri, clientOptions)
.then(() => {
    console.log("Connected to database");

    app.listen(port, () => {
        console.log(`Server running on port ${port}.`);
    });
})
.catch(() => {
    console.log("Connection to database failed");
});