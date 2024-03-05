export interface Instance {
    uid: number,
}

export interface BoxRem {
    left?: number,
    right?: number,
    top?: number,
    bottom?: number,
}

export type Control = {
    tag: "joy-arrows",
    up: number,
    down: number,
    left: number,
    right: number,
    forwardRange?: number,
    backwardRange?: number,
} | {
    tag: "button",
    label?: string,
    icon?: string,
    action: number,
};

export type Align = "start" | "end" | "center";

export type Layout = {
    tag: "row",
    layout: (Control | Layout)[],
    align?: Align,
} & BoxRem | {
    tag: "col",
    layout: (Control | Layout)[],
    align?: Align,
} & BoxRem | {
    tag: "abs",
    layout: (Control | Layout)[],
} & BoxRem | {
    tag: "gap",
    layout: (Control | Layout)[],
};

export type LayoutTag = Layout["tag"];
export type ControlTag = Control["tag"];
export type Tag = LayoutTag | ControlTag;
export const allLayoutTags: LayoutTag[] = ["row", "col", "abs", "gap"];
export const allControlTags: ControlTag[] = ["joy-arrows", "button"];
export const allTags: Tag[] = [...allLayoutTags, ...allControlTags];

export function isLayoutTag(tag: Tag) {
    return allLayoutTags.indexOf(tag as LayoutTag) >= 0;
}

export function isControlTag(tag: Tag) {
    return allControlTags.indexOf(tag as ControlTag) >= 0;
}

export interface LayerOnChange {
    action: (code: number, active: boolean) => void;
}

export interface Layer extends BoxRem {
    layout: Layout[],
}

export interface LayersApi {
    setScale: (scale: number) => void,
    setLayer: (layer: number) => void,
    getLayer: () => number,
    getVisible: () => void,
    setVisible: (visible: boolean) => void,
    mountEditor: (el: HTMLElement) => void,
    unmountEditor: () => void,
}
