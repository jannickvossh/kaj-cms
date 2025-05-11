import mongoose from 'mongoose';

const BlogPostSchema = mongoose.Schema({
    pageslug: String,
    postdate: String,
    posttime: String,
    posttitle: String,
    postimage: String,
    bakery: String,
    city: String,
    zipcode: String,
    tier: String,
    postexcerpt: String,
    postcontent: String
});

const BlogPost = mongoose.model("BlogPost", BlogPostSchema);

export default BlogPost;