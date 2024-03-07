import { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { JoyRing } from "./controls/joy-ring";
import { Button } from "./controls/button";
import { useDispatch, useSelector } from "react-redux";
import { State } from "./store";
import { Control, InstanceProps, Layer, LayerOnChange, Layout } from "./types";
import { uiSlice } from "./store/ui";
import { boxToPosition } from "./style";
import { RowCol } from "./layout/row-col";

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
    const [actionCount, setActionCount] = useState<{ [code: string]: number }>({});


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

    function actionChange(code: string, _active: boolean) {
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

    function createComponent(c: (Control | Layout) & Partial<InstanceProps>) {
        const instanceProps: InstanceProps = {
            uid: c.uid!,
            actionChange,
            createComponent,
        };
        switch (c.tag) {
            case "button": {
                return <Button
                    {...instanceProps}
                    {...c} />;
            }
            case "joy-arrows": {
                const active: boolean[] = [false, false, false, false];
                const codes = [c.up, c.down, c.left, c.right];
                const forwardRange = c.forwardRange ?? 0.2;
                const backwardRange = c.backwardRange ?? 0.2;
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
            case "stack":
            case "row": {
                return createLayout(c, { nested: true });
            };
        }
    }

    function createLayout(layout: Layout & Partial<InstanceProps>,
                          options?: { nested: boolean }): JSX.Element | null {
        const activeClass =
            useSelector((state: State) => state.ui.active[layout.uid!]) ? "border-primary border-2 " : "";
        switch (layout.tag) {
            case "col":
            case "row":
                return <RowCol {...layout as any}
                    options={options}
                    createComponent={createComponent} />;
            case "gap": {
                return <div class={activeClass + "w-12 h-12"}></div>;
            }
            case "abs": {
                return <div class={activeClass} style={boxToPosition({
                    scale: scale + "",
                }, layout)}>
                    {layout.layout.map(createComponent)}
                </div>;
            }
            case "stack": {
                return <div class={activeClass}>
                    {layout.layout.map(createComponent)}
                </div>;
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
