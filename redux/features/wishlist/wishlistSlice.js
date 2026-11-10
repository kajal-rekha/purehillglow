import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    wishlistItems: [],
};

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {
        toggleWishlist: (state, action) => {
            const product = action.payload;
            if (!product?._id) return;

            const existingIndex = state.wishlistItems.findIndex(
                (item) => item._id === product._id
            );

            if (existingIndex >= 0) {
                state.wishlistItems.splice(existingIndex, 1);
            } else {
                state.wishlistItems.push(product);
            }
        },

        removeFromWishlist: (state, action) => {
            const productId =
                typeof action.payload === "object" && action.payload !== null
                    ? action.payload._id
                    : action.payload;
            state.wishlistItems = state.wishlistItems.filter(
                (item) => item._id !== productId
            );
        },

        clearWishlist: (state) => {
            state.wishlistItems = [];
        },
    },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } =
    wishlistSlice.actions;

export default wishlistSlice.reducer;
