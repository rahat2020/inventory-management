import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./app/appSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { invoicesApi } from "./api/invoicesApi";
import { productsApi } from "./api/productsApi";
import { categoriesApi } from "./api/categoriesApi";
import { stockMovementsApi } from "./api/stockMovementsApi";
import { globalApi } from "./api/globalApi";
import { ordersApi } from "./api/ordersApi";
import { analyticsApi } from "./api/analyticsApi";
import { suppliersApi } from "./api/suppliersApi";
import { customersApi } from "./api/customersApi";

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
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [stockMovementsApi.reducerPath]: stockMovementsApi.reducer,
    [globalApi.reducerPath]: globalApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [suppliersApi.reducerPath]: suppliersApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(
      invoicesApi.middleware,
      productsApi.middleware,
      categoriesApi.middleware,
      stockMovementsApi.middleware,
      globalApi.middleware,
      ordersApi.middleware,
      analyticsApi.middleware,
      suppliersApi.middleware,
      customersApi.middleware
    ),
});

export const persistor = persistStore(store);
export default store;
