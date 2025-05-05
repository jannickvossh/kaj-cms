import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
    username: String,
    useremail: String,
    userpassword: String
});

const User = mongoose.model("User", UserSchema);

export default User;