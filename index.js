import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();
import { marked } from 'marked';
import { minify } from 'htmlfy';
import nodeHtmlMarkdownPkg from 'node-html-markdown';
const { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } = nodeHtmlMarkdownPkg;
import mongoose from 'mongoose';
import cookieParserPkg from 'cookie-parser';
const cookieParser = cookieParserPkg;

import bcrypt from 'bcrypt';
const saltRounds = 10;

import BlogPost from './models/blogpost.model.js';
import User from './models/user.model.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import {
    getCurrentDate,
    getCurrentTime,
    getCurrentDateTime,
    dailyAdvice,
    slugify,
    generateAuthToken,
    generateExpDate
} from './helpers.js';

const app = express();
const port = 3000;

const siteName = "Jagten på den Perfekte Kajkage";

let loggedIn = false;

const databaseUri = process.env.CONNECTION_STRING;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

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
            postimage: `kajkage_nytorv-konditori.webp`,
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

app.post("/edit-post", async (req, res) => {
    try {
        const post = await BlogPost.find({ pageslug: req.body.editslug });

        if (!post.length > 0) {
            console.log("No post found with that name");
            return
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/sign-up", async (req, res) => {
    try {
        const user = await User.find({ username: req.body.username });

        if (!user.length > 0) {
            const encryptedPassword = bcrypt.hashSync(req.body.password, saltRounds);

            let authToken = generateAuthToken(64);
            const existingTokens = await User.find({ authtoken: authToken });

            while (existingTokens.length > 0) {
                authToken = generateAuthToken(64);
            }

            await User.create({
                username: req.body.username,
                fullname: req.body.fullname,
                password: encryptedPassword,
                authtoken: authToken
            });

            res.redirect("/");
        } else {
            console.log("Der findes allerede en bruger med dette brugernavn.");
            res.redirect("/opret-bruger");
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/log-in", async (req, res) => {
    try {
        const user = await User.find({ username: req.body.username });

        if (user.length > 0) {
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (!err) {
                    res
                        .cookie(
                            'authenticationToken',
                            user[0].authtoken,
                            {
                                expires: generateExpDate(365),
                                httpOnly: true
                            }
                        )
                        .redirect("/");
                } else {
                    console.log(err);
                }
            });
        } else {
            console.log("Der findes ingen bruger med dette brugernavn.");
            res.redirect("/login");
        }
    } catch (err) {
        console.log(err);
    }
});

app.get("/", async (req, res) => {
    if (req.cookies.authenticationToken) {
        const user = await User.find({ authtoken: req.cookies.authenticationToken });

        if (user.length > 0) {
            const userInfo = {
                username: user[0].username,
                fullName: user[0].fullname
            };
            loggedIn = true;

            res.render("home.ejs", {
                pageTitle: `${siteName}`,
                dailyAdvice: dailyAdvice(),
                loggedIn,
                userInfo
            });
        }
    } else {
        res.render("home.ejs", {
            pageTitle: `${siteName}`,
            dailyAdvice: dailyAdvice()
        });
    }
});

app.get("/opret-indlaeg", (req, res) => {
    res.render("create-post.ejs", {});
});

app.get("/rediger-indlaeg", async (req, res) => {
    const post = await BlogPost.find({ pageslug: req.query.editslug });

    if (post.length > 0) {
        let contentInMarkdown = NodeHtmlMarkdown.translate(post[0].postcontent);

        res.render("edit-post.ejs", {
            pageslug: post[0].pageslug,
            postdate: post[0].postdate,
            posttitle: post[0].posttitle,
            postimage: post[0].postimage,
            bakery: post[0].bakery,
            city: post[0].city,
            zipcode: post[0].zipcode,
            tier: post[0].tier,
            postexcerpt: post[0].postexcerpt,
            postcontent: contentInMarkdown
        });
    }
});

app.get("/opret-bruger", (req, res) => {
    res.render("signup.ejs", {});
});

app.get("/log-ind", (req, res) => {
    res.render("login.ejs", {});
});

app.get("/blog/:pageslug", async (req, res) => {
    const post = await BlogPost.find({ pageslug: req.params.pageslug });

    if (post.length > 0) {
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