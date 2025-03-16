import mongoose, { Schema } from "mongoose";

//schema
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "First Name is Required!"]
        },
        lastName: {
            type: String,
            required: [true, "Last Name is Required!"]
        },
        email: {
            type: String,
            required: [true, "Email is Required!"]
        },
        password: {
            type: String,
            required: [true, "Password is Required!"],
            minlength: [6, "Password length should be greater than 6 character"],
            select: false,
        },
        location: { type: String ,select: true},
        profileUrl: { type: String, select: true },
        profession: { type: String, select: true },
        friends: [{ type: Schema.Types.ObjectId, ref: "Users" }],
        views: [{ type: String }],
        verified: { type: Boolean, default: false },
    },
    {timestamps: true}
);

const Users = mongoose.model("Users", userSchema);

export default Users;