import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userAndToken: null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.userAndToken = action.payload;
        },
        signup: (state, action) => {
            state.userAndToken = action.payload;
        },

        logout: (state) => {
            state.userAndToken = null;
        },
    },
});

export const { login, signup, logout } = authSlice.actions;
export default authSlice.reducer;
