import { BoxRem } from "./types";

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
