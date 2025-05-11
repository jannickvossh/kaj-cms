import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
    username: String,
    fullname: String,
    password: String,
    authtoken: String
});

const User = mongoose.model("User", UserSchema);

export default User;