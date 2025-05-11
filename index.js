import express from 'express';
import bodyParser from 'body-parser';
import fileUploadPkg from 'express-fileupload';
const fileUpload = fileUploadPkg;
import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') dotenv.config();;
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
    getDateTimeStamp,
    slugify,
    generateAuthToken
} from './helpers.js';

const app = express();
const port = process.env.PORT || 3000;

const siteName = "Jagten på den Perfekte Kajkage";

let loggedIn = false;

const databaseUri = process.env.CONNECTION_STRING;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.post("/create-post", async (req, res) => {
    let parsedPostContent = marked.parse(req.body.postcontent);
    parsedPostContent = minify(parsedPostContent);

    let slugifiedPostTitle = slugify(req.body.posttitle);

    const posts = await BlogPost.find({ posttitle: req.body.posttitle });

    if (posts.length > 0) {
        slugifiedPostTitle += `-${posts.length}`;
    }

    const { postimage } = req.files;
    let postImageName;
    if (postimage) {
        console.log(`${__dirname}/uploads/${postimage.name}`);
        postimage.mv(`${__dirname}/uploads/${postimage.name}`);
        postImageName = postimage.name;
    }

    await BlogPost.create({
        pageslug: slugifiedPostTitle,
        postdate: getCurrentDate(),
        posttime: getCurrentTime(),
        datetimestamp: getDateTimeStamp(),
        posttitle: req.body.posttitle,
        postimage: postImageName,
        bakery: req.body.bakery,
        city: req.body.city,
        zipcode: req.body.zipcode,
        tier: req.body.tier,
        postexcerpt: req.body.postexcerpt,
        postcontent: parsedPostContent
    });

    res.redirect(`/indlaeg/${slugifiedPostTitle}`);
});

app.post("/sign-up", async (req, res) => {
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
});

app.post("/log-in", async (req, res) => {
    const user = await User.find({ username: req.body.username });

    if (user.length > 0) {
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (!err) {
                res
                    .cookie(
                        'authenticationToken',
                        user[0].authtoken,
                        {
                            expires: new Date(Date.now() + 24 * 3600000 * 365),
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
        res.redirect("/log-ind");
    }
});

app.post("/log-out", (req, res) => {
    console.log(req.cookies.authenticationToken);
    if (req.cookies.authenticationToken) {
        res
            .clearCookie('authenticationToken')
            .redirect("/");
    }
});

app.get("/", async (req, res) => {
    const user = await User.find({ authtoken: req.cookies.authenticationToken });

    let posts;
    const post = await BlogPost.find({});
    if (post.length > 0) {
        posts = post;
    }

    if (user.length > 0) {

        const userInfo = {
            username: user[0].username,
            fullName: user[0].fullname
        };
        loggedIn = true;

        res.render("home.ejs", {
            pageTitle: `${siteName}`,
            loggedIn,
            userInfo,
            posts
        });
    } else {
        res.render("home.ejs", {
            pageTitle: `${siteName}`,
            posts
        });
    }
});

app.get("/opret-indlaeg", async (req, res) => {
    const user = await User.find({ authtoken: req.cookies.authenticationToken });

    if (user.length > 0) {
        const userInfo = {
            username: user[0].username,
            fullName: user[0].fullname
        };
        loggedIn = true;

        res.render("create-post.ejs", {
            pageTitle: `Opret indlæg - ${siteName}`,
            loggedIn,
            userInfo
        });
    } else {
        res.redirect("/");
    }
});

app.get("/opret-bruger", (req, res) => {
    if (!req.cookies.authenticationToken) {
        res.render("signup.ejs", {
            pageTitle: `Opret bruger - ${siteName}`,
        });
    } else {
        res.redirect("/");
    }
});

app.get("/log-ind", (req, res) => {
    if (!req.cookies.authenticationToken) {
        res.render("login.ejs", {
            pageTitle: `Log ind - ${siteName}`,
        });
    } else {
        res.redirect("/");
    }
});

app.get("/indlaeg/:pageslug", async (req, res) => {
    const post = await BlogPost.find({ pageslug: req.params.pageslug });

    if (post.length > 0) {
        const user = await User.find({ authtoken: req.cookies.authenticationToken });

        if (user.length > 0) {
            const userInfo = {
                username: user[0].username,
                fullName: user[0].fullname
            };
            loggedIn = true;

            res.render("templates/post.ejs", {
                pageTitle: `${post[0].posttitle} - ${siteName}`,
                pageslug: post[0].pageslug,
                postdate: post[0].postdate,
                posttitle: post[0].posttitle,
                postimage: post[0].postimage,
                bakery: post[0].bakery,
                city: post[0].city,
                zipcode: post[0].zipcode,
                tier: post[0].tier,
                postexcerpt: post[0].postexcerpt,
                postcontent: post[0].postcontent,
                loggedIn,
                userInfo
            });
        } else {
            res.render("templates/post.ejs", {
                pageTitle: `${post[0].posttitle} - ${siteName}`,
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
        }
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