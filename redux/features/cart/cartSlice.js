import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cartItems: [],
};

const cartSlice = createSlice({
    name: "cart",
    initialState,

    reducers: {
        addToCart: (state, action) => {
            const newItem = action.payload;

            const price = parseFloat(newItem.price) || 0;
            const quantity = parseInt(newItem.cartQuantity, 10) || 1;

            const existingItem = state.cartItems.find(
                (item) => item._id === newItem._id
            );

            if (existingItem) {
                existingItem.cartQuantity += quantity;
            } else {
                state.cartItems.push({
                    ...newItem,
                    price,
                    cartQuantity: quantity,
                });
            }
        },

        increaseCart: (state, action) => {
            const itemIndex = state.cartItems.findIndex(
                (item) => item._id === action.payload._id
            );
            if (itemIndex >= 0) {
                state.cartItems[itemIndex].cartQuantity += 1;
            } else {
                const newItem = { ...action.payload, cartQuantity: 1 };
                state.cartItems.push(newItem);
            }
        },

        decreaseCart: (state, action) => {
            const itemIndex = state.cartItems.findIndex(
                (item) => item._id === action.payload._id
            );
            if (itemIndex >= 0) {
                if (state.cartItems[itemIndex].cartQuantity > 1) {
                    state.cartItems[itemIndex].cartQuantity -= 1;
                } else {
                    state.cartItems = state.cartItems.filter(
                        (item) => item._id !== action.payload._id
                    );
                }
            }
        },

        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter(
                (item) => item._id !== action.payload
            );
        },

        clearCart: (state) => {
            state.cartItems = [];
        },
    },
});

export const {
    addToCart,
    increaseCart,
    decreaseCart,
    removeFromCart,
    clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
