import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState: {
    layerIndex: number | null,
    layoutPath: number[],
    selectedUid: number,
} = {
    layerIndex: null,
    layoutPath: [],
    selectedUid: -1,
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
        resetPath(state, payload: PayloadAction<number[]>) {
            state.layoutPath.splice(0, state.layoutPath.length);
            for (const next of payload.payload) {
                state.layoutPath.push(next);
            }
        },
        selectUid(state, payload: PayloadAction<number>) {
            state.selectedUid = payload.payload;
        },
    },
});
