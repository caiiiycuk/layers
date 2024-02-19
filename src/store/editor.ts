import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState: {
    layerIndex: number | null,
    layoutPath: number[],
} = {
    layerIndex: null,
    layoutPath: [],
};

export const editorSlice = createSlice({
    name: "editor",
    initialState,
    reducers: {
        setLayerIndex(state, payload: PayloadAction<number | null>) {
            state.layerIndex = payload.payload;
            state.layoutPath = [];
        },
        pushPath(state, payload: PayloadAction<number>) {
            state.layoutPath.push(payload.payload);
        },
        popPath(state) {
            state.layoutPath.splice(state.layoutPath.length - 1, 1);
        },
    },
});
