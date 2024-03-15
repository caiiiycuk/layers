import { State } from "./store";
import { BoxRem, Layout } from "./types";

export function boxToPosition(style: any, pos: BoxRem | undefined) {
    if (typeof pos?.left === "number") {
        style.left = pos.left + "rem";
    }

    if (typeof pos?.right === "number") {
        style.right = pos.right + "rem";
    }

    if (typeof pos?.top === "number") {
        style.top = pos.top + "rem";
    }

    if (typeof pos?.bottom === "number") {
        style.bottom = pos.bottom + "rem";
    }

    style.position = "absolute";

    if (style.justifyContent === "center") {
        style.transformorigin = "center";
    } else {
        style.transformorigin = (typeof pos?.right === "number" ? "right " : "left ") +
            (typeof pos?.bottom === "number" ? "bottom " : "top ");
    }

    return style;
};

export function isActive(state: State, uid?: number) {
    if (!uid) {
        return false;
    }

    if (state.ui.active[uid] > 0) {
        return true;
    }

    if (state.ui.editor && state.editor.layoutPath.length > 0 &&
        state.ui.layer >= 0 && state.ui.layer < state.ui.layers.length) {
        let layout: Layout[] = state.ui.layers[state.ui.layer].layout;
        for (const next of state.editor.layoutPath) {
            if (uid === (layout[next] as any).uid) {
                return true;
            }
            layout = layout[next].layout as Layout[];
        }
    }

    return false;
}
