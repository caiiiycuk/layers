import { BoxRem } from "./types";

export function boxToPosition(style: any, pos: BoxRem | undefined) {
    if (typeof pos?.left === "number") {
        style.left = pos.left + "rem";
    } else if (typeof pos?.right === "number") {
        style.right = pos.right + "rem";
    }

    if (typeof pos?.top === "number") {
        style.top = pos.top + "rem";
    } else if (typeof pos?.bottom === "number") {
        style.bottom = pos.bottom + "rem";
    }

    style.position = "absolute";

    style.transformOrigin = (typeof pos?.right === "number" ? "right " : "left ") +
        (typeof pos?.bottom === "number" ? "bottom " : "top ");

    return style;
};
