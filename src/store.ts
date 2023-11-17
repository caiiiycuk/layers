import { configureStore } from "@reduxjs/toolkit";
import { uiSlice } from "./store/ui";

export const store = configureStore({
    reducer: {
        ui: uiSlice.reducer,
    },
});

export type State = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
