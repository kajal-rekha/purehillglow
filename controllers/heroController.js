import Hero from "@/models/Hero";

//========= Create Hero Section =========//
export const createHero = async (req, res) => {
    try {
        const { title, imageURL } = req.body;

        if (!title?.en || !title?.bn || !imageURL) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const hero = await Hero.create({
            title,
            imageURL,
        });

        res.status(201).json({
            message: "Hero Section created successfully",
            hero,
        });
    } catch (error) {
        console.error("Hero Create Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

//========= Get All Heros =========//
export const getAllHeros = async (req, res) => {
    try {
        const heroes = await Hero.find({});

        if (!heroes || heroes.length === 0) {
            return res.status(404).json({ error: "Hero data not found" });
        }

        res.status(200).json(heroes);
    } catch (error) {
        console.error("Hero Fetch  Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ======== Get A Hero ========//
export const getHero = async (req, res) => {
    try {
        const { id } = req.query;

        const hero = await Hero.findById(id);
        if (!hero) {
            return res.status(404).json({ error: "Hero not found" });
        }
        res.status(200).json(hero);
    } catch (error) {
        console.error("Hero Create Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ======== Delete A Hero ========//
export const deleteHero = async (req, res) => {
    try {
        const { id } = req.query;

        const deletedHero = await Hero.findByIdAndDelete(id);
        if (!deletedHero) {
            return res.status(404).json({ error: "Hero not found" });
        }
        res.status(200).json({
            message: "Hero deleted successfully",
            deletedHero,
        });
    } catch (error) {
        console.error("Hero Delete  Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ======== Update Hero ========//
export const updateHero = async (req, res) => {
    try {
        const { id } = req.query;
        const updates = req.body;

        const updatedHero = await Hero.findByIdAndUpdate(id, updates, {
            new: true,
        });

        if (!updatedHero) {
            return res.status(404).json({ error: "Hero not found" });
        }

        res.status(200).json({
            message: "Hero section updated successfully",
            updatedHero,
        });
    } catch (error) {
        console.error("Hero Update Error:", error.message);
        res.status(500).json({ message: "Failed to update hero section" });
    }
};
