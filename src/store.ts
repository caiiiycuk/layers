import { configureStore } from "@reduxjs/toolkit";
import { uiSlice } from "./store/ui";

export function createStore() {
    return configureStore({
        reducer: {
            ui: uiSlice.reducer,
        },
    });
}

export interface State {
    ui: ReturnType<typeof uiSlice.getInitialState>
}
