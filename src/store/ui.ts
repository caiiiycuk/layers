import { createSlice } from "@reduxjs/toolkit";

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
    layersCount: number,
    pointers: Pointers,
} = {
    scale: 1,
    layer: 0,
    layersCount: 0,
    pointers: {},
};

export const uiSlice = createSlice({
    name: "ui",
    initialState,
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
        pointerDown: (state, payload: { payload: PointerBaseProps }) => {
            state.pointers[payload.payload.id] = { active: true, ...payload.payload };
        },
        pointerMove: (state, payload: { payload: PointerBaseProps }) => {
            if (state.pointers[payload.payload.id]) {
                state.pointers[payload.payload.id].x = payload.payload.x;
                state.pointers[payload.payload.id].y = payload.payload.y;
            }
        },
        pointerUp: (state, payload: { payload: number }) => {
            delete state.pointers[payload.payload];
        }
    },
});
