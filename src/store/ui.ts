import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Layer } from "../types";

export interface PointerBaseProps {
    id: string,
    x: number,
    y: number,
}

export interface Pointer extends PointerBaseProps {
    active: boolean,
}

export type Pointers = { [id: string]: Pointer };

const initialState: {
    scale: number,
    layer: number,
    layers: Layer[],
    pointers: Pointers,
    editor: boolean,
} = {
    scale: 1,
    layer: 0,
    layers: [],
    pointers: {},
    editor: true,
};

export const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setScale: (state, payload: PayloadAction<number>) => {
            state.scale = payload.payload;
        },
        setLayer: (state, payload: PayloadAction<number>) => {
            if (state.layers.length > 0) {
                state.layer = payload.payload % state.layers.length;
            }
            state.pointers = {};
        },
        setLayers: (state, payload: PayloadAction<Layer[]>) => {
            Object.assign(state, { layers: payload.payload });
            state.pointers = {};
        },
        pointerDown: (state, payload: PayloadAction<PointerBaseProps>) => {
            state.pointers[payload.payload.id] = { active: true, ...payload.payload };
        },
        pointerMove: (state, payload: PayloadAction<PointerBaseProps>) => {
            if (state.pointers[payload.payload.id]) {
                state.pointers[payload.payload.id].x = payload.payload.x;
                state.pointers[payload.payload.id].y = payload.payload.y;
            }
        },
        pointerUp: (state, payload: PayloadAction<number>) => {
            delete state.pointers[payload.payload];
        },
    },
});
