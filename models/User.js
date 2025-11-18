import bcrypt from "bcrypt";
import mongoose from "mongoose";
import validator from "validator";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: [validator.isEmail, "Invalid email format"],
        },
        password: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: false,
        },
        phone: {
            type: String,
            required: false,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
            required: true,
        },
    },
    { timestamps: true }
);

//============ Static method for signup ===========//
UserSchema.statics.signup = async function (
    username,
    email,
    password,
    image,
    address,
    phone
) {
    if (!username || !email || !password || !image || !address || !phone) {
        throw new Error("All fields must be filled");
    }

    if (!validator.isEmail(email)) {
        throw new Error("Invalied email");
    }

    if (!validator.isStrongPassword(password)) {
        throw new Error(
            "Password is not strong  (must contain 8+ chars, uppercase, lowercase, number and symbol)"
        );
    }
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    const user = await this.create({
        username,
        email,
        password: hashPass,
        image,
        address,
        phone,
    });

    return user;
};

//======= Static method for login ========//
UserSchema.statics.login = async function (email, password) {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    const user = await this.findOne({ email });

    if (!user) {
        throw new Error("Incorrect email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Incorrect email or password");
    }

    return user;
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
