"use client";

import { persistor, store } from "@/redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AuthInterceptor from "@/components/shared/AuthInterceptor";

const ReduxProvider = ({ children }) => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <AuthInterceptor>
                    {children}
                </AuthInterceptor>
            </PersistGate>
        </Provider>
    );
};

export default ReduxProvider;
