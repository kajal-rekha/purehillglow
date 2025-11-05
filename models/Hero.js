import mongoose from "mongoose";
const Schema = mongoose.Schema;

const heroSchema = new Schema(
    {
        title: {
            en: {
                type: String,
                required: true,
            },
            bn: {
                type: String,
                required: true,
            },
        },

        imageURL: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Hero = mongoose.models.Hero || mongoose.model("Hero", heroSchema);

export default Hero;
