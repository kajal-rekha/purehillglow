import Category from "@/models/Category";

//=================== Create Category ======================//
export const createCategory = async (req) => {
    try {
        const { name, image } = await req.json();
        if (!name || !image) {
            return Response.json(
                { error: "All fields are required" },
                {
                    status: 400,
                }
            );
        }

        const category = await Category.create({ name, image });
        return Response.json(category, { status: 201 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
};

//======== Get All Categories =========//
export const getAllCategories = async () => {
    try {
        const categories = await Category.find();
        return Response.json(categories, {
            status: 200,
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
};

//========== Get Single Category ===========//
export const getACategory = async (id) => {
    try {
        const category = await Category.findById(id);

        if (!category) {
            return Response.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }
        return Response.json(category, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
};

//======== Update Category ========//
export const updateCategory = async (req, id) => {
    try {
        const { name, image } = await req.json();
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, image },
            { new: true }
        );
        if (!updatedCategory) {
            return Response.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }
        return Response.json(updatedCategory, { status: 200 });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
};

//========= Delete Category ============//
export const deleteCategory = async (id) => {
    try {
        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return Response.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }
        return Response.json(
            { message: "Category deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
};
