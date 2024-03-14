import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { InstanceProps, Layer, Layout, isControlTag } from "../types";

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
    active: { [uid: number]: number },
    activeHead: number | null,
} = {
    scale: 1,
    layer: 0,
    layers: [],
    pointers: {},
    editor: true,
    active: {},
    activeHead: null,
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
            assignIdsIfNeeded(payload.payload);
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
        activate: (state, payload: PayloadAction<number>) => {
            if (state.active[payload.payload] === undefined) {
                state.active[payload.payload] = 0;
            }
            state.active[payload.payload]++;
            state.activeHead = payload.payload;
        },
        deactivate: (state, payload: PayloadAction<number>) => {
            if (state.active[payload.payload] !== undefined && state.active[payload.payload] > 0) {
                state.active[payload.payload]--;
                if (state.active[payload.payload] === 0 && state.activeHead === payload.payload) {
                    state.activeHead = null;
                }
            }
        },
    },
});


let uid = 0;
function assingIds(layout: Layout & Partial<InstanceProps>) {
    if (!layout.uid) {
        layout.uid = ++uid;
    }
    for (const next of layout.layout) {
        if (isControlTag(next.tag)) {
            if (!(next as Partial<InstanceProps>).uid) {
                (next as Partial<InstanceProps>).uid = ++uid;
            }
        } else {
            assingIds(next as Layout);
        }
    }
}

function assignIdsIfNeeded(layers: Layer[]) {
    for (const layer of layers) {
        for (const layout of layer.layout) {
            assingIds(layout);
        }
    }
}

export function lastUid() {
    return uid;
}
