import { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { JoyRing } from "./controls/joy-ring";
import { Button } from "./controls/button";
import { useDispatch, useSelector } from "react-redux";
import { State } from "./store";
import { BoxRem, Control, Instance, Layer, LayerOnChange, Layout } from "./types";
import { uiSlice } from "./store/ui";

function LayerComponent(props: {
    layer: Layer,
    onChange: LayerOnChange,
}) {
    const scale = useSelector((state: State) => state.ui.scale);
    const dispatch = useDispatch();
    const layerRef = useRef<HTMLDivElement>(null);
    const { layer, onChange } = props;
    const padding = {
        left: layer.left ?? 0,
        right: layer.right ?? 0,
        top: layer.top ?? 0,
        bottom: layer.bottom ?? 0,
    };
    const [actionCount, setActionCount] = useState<{ [code: number]: number }>({});


    useEffect(() => {
        const layer = layerRef?.current;
        if (layer) {
            const onPointerDown = (e: PointerEvent) => {
                dispatch(uiSlice.actions.pointerDown({
                    id: e.pointerId + "",
                    x: e.clientX,
                    y: e.clientY,
                }));
            };

            const onPointerMove = (e: PointerEvent) => {
                dispatch(uiSlice.actions.pointerMove({
                    id: e.pointerId + "",
                    x: e.clientX,
                    y: e.clientY,
                }));
            };

            const onPointerUp = (e: PointerEvent) => {
                dispatch(uiSlice.actions.pointerUp(e.pointerId));
            };

            layer.addEventListener("pointerdown", onPointerDown);
            layer.addEventListener("pointermove", onPointerMove);
            layer.addEventListener("pointerup", onPointerUp);
            layer.addEventListener("pointercancel", onPointerUp);
            layer.addEventListener("pointerleave", onPointerUp);

            return () => {
                layer.removeEventListener("pointerdown", onPointerDown);
                layer.removeEventListener("pointermove", onPointerMove);
                layer.removeEventListener("pointerup", onPointerUp);
                layer.removeEventListener("pointercancel", onPointerUp);
                layer.removeEventListener("pointerleave", onPointerUp);
            };
        }
    }, [layerRef]);

    function actionChange(code: number, _active: boolean) {
        if (actionCount[code] === undefined) {
            actionCount[code] = 0;
        }

        const active = actionCount[code] > 0;
        actionCount[code] += _active ? 1 : -1;
        const newActive = actionCount[code] > 0;

        if (active != newActive) {
            onChange.action(code, newActive);
            setActionCount({ ...actionCount });
        }
    }

    function createItem(i: (Control | Layout) & Partial<Instance>) {
        switch (i.tag) {
            case "button": {
                return <Button
                    uid={i.uid!}
                    {...i}
                    onButtonDown={() => {
                        actionChange(i.action, true);
                    }}
                    onButtonUp={() => {
                        actionChange(i.action, false);
                    }} />;
            }
            case "joy-arrows": {
                const active: boolean[] = [false, false, false, false];
                const codes = [i.up, i.down, i.left, i.right];
                const forwardRange = i.forwardRange ?? 0.2;
                const backwardRange = i.backwardRange ?? 0.2;
                return <JoyRing
                    layerRef={layerRef}
                    onChange={(joyActive, angle, distance) => {
                        const newActive = [false, false, false, false];
                        if (joyActive && distance >= 0.25) {
                            if (angle >= 0 && angle <= forwardRange ||
                                angle >= Math.PI * 2 - forwardRange && angle <= Math.PI * 2) {
                                newActive[0] = true;
                            } else if (angle >= Math.PI - backwardRange &&
                                angle <= Math.PI + backwardRange) {
                                newActive[1] = true;
                            } else {
                                if (angle >= 0 && angle <= Math.PI) {
                                    newActive[2] = true;
                                } else {
                                    newActive[3] = true;
                                }
                                if (angle >= Math.PI / 2 && angle <= 3 / 2 * Math.PI) {
                                    newActive[1] = true;
                                } else {
                                    newActive[0] = true;
                                }
                            }
                        }

                        for (let i = 0; i < 4; ++i) {
                            if (active[i] != newActive[i]) {
                                actionChange(codes[i], newActive[i]);
                                active[i] = newActive[i];
                            }
                        }
                    }} />;
            };
            case "gap":
            case "abs":
            case "col":
            case "row": {
                return createLayout(i, { nested: true });
            };
            default: {
                console.error("Unknown item tag", i);
            }
        }
        return null;
    }

    function position(style: any, pos: BoxRem | undefined) {
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
    }

    function createLayout(layout: Layout & Partial<Instance>,
                          options?: { nested: boolean }): JSX.Element | null {
        const activeClass =
            useSelector((state: State) => state.ui.active[layout.uid!]) ? "border-primary border-2 " : "";
        switch (layout.tag) {
            case "row": {
                const style: any = options?.nested ? null : position({
                    scale: scale + "",
                    alignItems: layout.align ?? "start",
                }, layout);
                return <div class={activeClass + "flex flex-row"} style={style}>
                    {layout.items.map(createItem)}
                </div>;
            }
            case "col": {
                const style: any = options?.nested ? null : position({
                    scale: scale + "",
                    alignItems: layout.align ?? "start",
                }, layout);
                return <div class={activeClass + "flex flex-col"} style={style}>
                    {layout.items.map(createItem)}
                </div>;
            }
            case "gap": {
                return <div class={activeClass + "w-12 h-12"}></div>;
            }
            case "abs": {
                return <div class={activeClass} style={position({
                    scale: scale + "",
                }, layout)}>{createItem(layout.item)}</div>;
            }
        }
    }

    return <div ref={layerRef} class="absolute" style={{
        top: padding.top + "rem",
        right: padding.right + "rem",
        bottom: padding.bottom + "rem",
        left: padding.left + "rem",
    }}>
        {layer.layout.map((i) => createLayout(i))}
    </div>;
}

export function Layers(props: {
    onChange: LayerOnChange,
}) {
    const layers = useSelector((state: State) => state.ui.layers);
    const layer = useSelector((state: State) => state.ui.layer);

    return layer >= 0 && layer < layers.length ?
        <LayerComponent layer={layers[layer]} onChange={props.onChange} /> :
        null;
}
