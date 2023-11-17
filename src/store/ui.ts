import { createSlice } from "@reduxjs/toolkit";

export const uiSlice = createSlice({
    name: "ui",
    initialState: {
        scale: 1,
        visible: true,
    },
    reducers: {
        setVisible: (state, payload: { payload: boolean }) => {
            state.visible = payload.payload;
        },
    },
});
