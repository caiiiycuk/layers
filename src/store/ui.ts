import { createSlice } from "@reduxjs/toolkit";

export const uiSlice = createSlice({
    name: "ui",
    initialState: {
        scale: 1,
        layer: 0,
        layersCount: 0,
    },
    reducers: {
        setScale: (state, payload: { payload: number }) => {
            state.scale = payload.payload;
        },
        setLayer: (state, payload: { payload: number }) => {
            state.layer = payload.payload % state.layersCount;
        },
        setLayersCount: (state, payload: { payload: number }) => {
            state.layersCount = payload.payload;
        },
    },
});
