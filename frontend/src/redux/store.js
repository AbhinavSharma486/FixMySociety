import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./user/userSlice.js";
import themeReducer from "./theme/themeSlice.js";
import adminReducer from "./admin/adminSlice.js";
import complaintReducer from "./complaint/complaintSlice.js";

const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
  admin: adminReducer,
  complaint: complaintReducer
});

const persistConfig = {
  key: 'root',
  storage,
  version: 1
};

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);