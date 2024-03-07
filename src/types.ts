import { ButtonProps } from "./controls/button";
import { ColProps, RowProps } from "./layout/row-col";

export interface InstanceProps {
    uid: number,
    actionChange: (code: string, active: boolean) => void,
    createComponent: (c: (Control | Layout) & Partial<InstanceProps>) => JSX.Element | null,
}

export interface BoxRem {
    left?: number,
    right?: number,
    top?: number,
    bottom?: number,
}

export type Control = {
    tag: "joy-arrows",
    up: string,
    down: string,
    left: string,
    right: string,
    forwardRange?: number,
    backwardRange?: number,
} | ButtonProps;

export const alignValues = ["start", "end", "center"] as const;
export type Align = typeof alignValues[number];

export interface LayoutBase extends BoxRem {
    layout: (Control | Layout)[],
}

export type Layout = RowProps | ColProps | {
    tag: "abs",
    layout: (Control | Layout)[],
} & BoxRem | {
    tag: "gap",
    layout: (Control | Layout)[],
} & BoxRem | {
    tag: "stack",
    layout: (Control | Layout)[],
};

export type LayoutTag = Layout["tag"];
export type ControlTag = Control["tag"];
export type Tag = LayoutTag | ControlTag;
export const allLayoutTags: LayoutTag[] = ["row", "col", "abs", "gap", "stack"];
export const allControlTags: ControlTag[] = ["joy-arrows", "button"];
export const allTags: Tag[] = [...allLayoutTags, ...allControlTags];

export function isLayoutTag(tag: Tag | string) {
    return allLayoutTags.indexOf(tag as LayoutTag) >= 0;
}

export function isControlTag(tag: Tag | string) {
    return allControlTags.indexOf(tag as ControlTag) >= 0;
}

export interface LayerOnChange {
    action: (code: string, active: boolean) => void;
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
