import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();
import { marked } from 'marked';
import { minify } from 'htmlfy';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import mongoose from 'mongoose';

import BlogPost from './models/blogpost.model.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

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

const databaseUri = process.env.CONNECTION_STRING;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

app.post("/create-post", async (req, res) => {
    try {
        let parsedPostContent = marked.parse(req.body.postcontent);
        parsedPostContent = minify(parsedPostContent);

        let slugifiedPostTitle = slugify(req.body.posttitle);

        const posts = await BlogPost.find({ posttitle: req.body.posttitle });

        if (posts.length > 0) {
            slugifiedPostTitle += `-${posts.length}`;
        }

        await BlogPost.create({
            pageslug: slugifiedPostTitle,
            postdate: getCurrentDateTime(),
            posttitle: req.body.posttitle,
            postimage: `${__dirname}/public/img/kajkage_nytorv-konditori.webp`,
            bakery: req.body.bakery,
            city: req.body.city,
            zipcode: req.body.zipcode,
            tier: req.body.tier,
            postexcerpt: req.body.postexcerpt,
            postcontent: parsedPostContent
        });

    } catch (err) {
        console.log(err);
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

app.get("/blog/:pageslug", async (req, res) => {
    const post = await BlogPost.find({ pageslug: req.params.pageslug });

    if (post.length > 0) {
        console.log(post[0].pageslug);
        res.render("templates/post.ejs", {
            pageslug: post[0].pageslug,
            postdate: post[0].postdate,
            posttitle: post[0].posttitle,
            postimage: post[0].postimage,
            bakery: post[0].bakery,
            city: post[0].city,
            zipcode: post[0].zipcode,
            tier: post[0].tier,
            postexcerpt: post[0].postexcerpt,
            postcontent: post[0].postcontent
        });
    } else {
        res.render("page-404.ejs", {});
    }
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