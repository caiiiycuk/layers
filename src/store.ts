import { configureStore } from "@reduxjs/toolkit";
import { uiSlice } from "./store/ui";
import { editorSlice } from "./store/editor";

export function createStore() {
    return configureStore({
        reducer: {
            ui: uiSlice.reducer,
            editor: editorSlice.reducer,
        },
    });
}

export interface State {
    ui: ReturnType<typeof uiSlice.getInitialState>,
    editor: ReturnType<typeof editorSlice.getInitialState>
}
