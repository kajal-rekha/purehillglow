import {
    combineReducers,
    configureStore,
    createListenerMiddleware,
} from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import {
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    persistStore,
    PURGE,
    REGISTER,
    REHYDRATE,
} from "redux-persist";

import storage from "redux-persist/lib/storage";
import authReducer from "./features/auth/authSlice";
import cartReducer, {
    addToCart,
    decreaseCart,
    increaseCart,
} from "./features/cart/cartSlice";
import languageSlice from "./features/language/languageSlice";
import orderSlice from "./features/order/orderSlice";
import wishlistReducer, {
    toggleWishlist,
} from "./features/wishlist/wishlistSlice";

const listenerMiddleware = createListenerMiddleware();

const getProductName = (product, language) => {
    const name = product?.name;
    if (typeof name === "string") return name;
    return language === "bn"
        ? name?.bn || name?.en || "পণ্য"
        : name?.en || name?.bn || "Product";
};

listenerMiddleware.startListening({
    actionCreator: addToCart,
    effect: (action, listenerApi) => {
        const language = listenerApi.getState().language.language;
        const productName = getProductName(action.payload, language);
        toast.success(
            language === "bn"
                ? `${productName} কার্টে যোগ করা হয়েছে`
                : `${productName} added to cart`
        );
    },
});

listenerMiddleware.startListening({
    actionCreator: increaseCart,
    effect: (action, listenerApi) => {
        const language = listenerApi.getState().language.language;
        const productName = getProductName(action.payload, language);
        toast.success(
            language === "bn"
                ? `${productName}-এর পরিমাণ বাড়ানো হয়েছে`
                : `${productName} quantity increased`
        );
    },
});

listenerMiddleware.startListening({
    actionCreator: decreaseCart,
    effect: (action, listenerApi) => {
        const language = listenerApi.getState().language.language;
        const productName = getProductName(action.payload, language);
        toast.error(
            language === "bn"
                ? `${productName}-এর পরিমাণ কমানো হয়েছে`
                : `${productName} quantity decreased`
        );
    },
});

listenerMiddleware.startListening({
    actionCreator: toggleWishlist,
    effect: (action, listenerApi) => {
        const state = listenerApi.getState();
        const language = state.language.language;
        const productName = getProductName(action.payload, language);
        const isAdded = state.wishlist?.wishlistItems?.some(
            (item) => item._id === action.payload?._id
        );
        if (isAdded) {
            toast.success(
                language === "bn"
                    ? `${productName} উইশলিস্টে যোগ করা হয়েছে`
                    : `${productName} added to wishlist`
            );
        } else {
            toast.success(
                language === "bn"
                    ? `${productName} উইশলিস্ট থেকে সরানো হয়েছে`
                    : `${productName} removed from wishlist`
            );
        }
    },
});

const persistConfig = {
    key: "root",
    version: 1,
    storage,
};

const rootReducer = combineReducers({
    auth: authReducer,
    cart: cartReducer,
    language: languageSlice,
    order: orderSlice,
    wishlist: wishlistReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }).prepend(listenerMiddleware.middleware),
});

export const persistor = persistStore(store);
