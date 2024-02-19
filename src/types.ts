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
    items: (Control | Layout)[],
    align?: Align,
} & BoxRem | {
    tag: "col",
    items: (Control | Layout)[],
    align?: Align,
} & BoxRem | {
    tag: "abs",
    item: Control,
} & BoxRem | {
    tag: "gap",
};

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
