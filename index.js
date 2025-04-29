import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { marked } from 'marked';
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
    dailyAdvice
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
const ObjectId = Schema.ObjectId;

const Post = new Schema({
    objectid: ObjectId,
    postId: Number,
    pageSlug: String,
    postDate: String,
    dataEaten: String,
    postTitle: String,
    postImage: String,
    bakery: String,
    city: String,
    zipCode: String,
    tier: String,
    postExcerpt: String,
    postContent: String
});

mongoose.model('Post', Post);

app.post("/create-post", (req, res) => {
    if (req.body.postcontent) {
        let parsedPostContent = marked.parse(req.body.postcontent);
        console.log(parsedPostContent);
    }
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

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});