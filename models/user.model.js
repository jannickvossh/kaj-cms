import mongoose from 'mongoose';

const BlogUserSchema = mongoose.Schema({
    username: String,
    useremail: String,
    userpassword: String
});

const BlogUser = mongoose.model("BlogUser", BlogUserSchema);

export default BlogUser;