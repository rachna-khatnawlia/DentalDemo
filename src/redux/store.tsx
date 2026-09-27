import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./slice/authSlice";
import { persistReducer, persistStore } from "redux-persist";
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
  }

const persistedReducers = combineReducers({
    auth: authSlice,
  });
  
  // Merged rootReducer
  const rootReducer = combineReducers({
    persisted: persistReducer(persistConfig, persistedReducers), // Persisted reducers
  });

// Create the store
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware: any) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }),
  });

  
export const persistor = persistStore(store);


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, commen    ts: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
