import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./app/appSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { invoicesApi } from "./api/invoicesApi";
import { productsApi } from "./api/productsApi";

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, appReducer);

const store = configureStore({
  reducer: {
    app: persistedReducer,
    [invoicesApi.reducerPath]: invoicesApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(invoicesApi.middleware, productsApi.middleware),
});

export const persistor = persistStore(store);
export default store;
