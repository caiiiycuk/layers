import { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { Button } from "./controls/button";
import { useDispatch, useSelector } from "react-redux";
import { State } from "./store";
import { Control, InstanceProps, Layer, LayerOnChange, Layout, isLayoutTag, pointerZoneClass } from "./types";
import { uiSlice } from "./store/ui";
import { RowCol } from "./layout/row-col";
import { Anchor } from "./layout/anchor";
import { Sensor } from "./layout/sensor";
import { isActive } from "./style";

interface BoundsInfo {
    rect: DOMRect,
    visible: DOMRect[],
};

function LayerComponent(props: {
    layer: Layer,
    onChange: LayerOnChange,
}) {
    const dispatch = useDispatch();
    const layerRef = useRef<HTMLDivElement>(null);
    const { layer, onChange } = props;
    const padding = {
        left: layer.left ?? 0,
        right: layer.right ?? 0,
        top: layer.top ?? 0,
        bottom: layer.bottom ?? 0,
    };

    useEffect(() => {
        const layer = layerRef?.current;
        if (layer) {
            const boundsInfo: BoundsInfo = {
                rect: layer.getBoundingClientRect(),
                visible: [],
            };

            let isPointerDown = false;
            const onPointerDown = (e: PointerEvent) => {
                dispatch(uiSlice.actions.pointerDown({
                    id: e.pointerId + "",
                    x: e.clientX,
                    y: e.clientY,
                }));

                if (!filterPointerEvent(e, boundsInfo) && !isPointerDown) {
                    isPointerDown = true;
                    onChange.pointer(relX(e, boundsInfo), relY(e, boundsInfo), "down");
                }
            };

            const onPointerMove = (e: PointerEvent) => {
                dispatch(uiSlice.actions.pointerMove({
                    id: e.pointerId + "",
                    x: e.clientX,
                    y: e.clientY,
                }));

                if (!filterPointerEvent(e, boundsInfo)) {
                    onChange.pointer(relX(e, boundsInfo), relY(e, boundsInfo), "move");
                }
            };

            const onPointerUp = (e: PointerEvent) => {
                dispatch(uiSlice.actions.pointerUp(e.pointerId));

                if (isPointerDown) {
                    isPointerDown = false;
                    onChange.pointer(relX(e, boundsInfo), relY(e, boundsInfo), "up");
                }
            };

            layer.addEventListener("pointerdown", onPointerDown);
            layer.addEventListener("pointermove", onPointerMove);
            layer.addEventListener("pointerup", onPointerUp);
            layer.addEventListener("pointercancel", onPointerUp);
            layer.addEventListener("pointerleave", onPointerUp);

            const sizeObserver = new ResizeObserver(() => {
                boundsInfo.rect = layer.getBoundingClientRect();
                boundsInfo.visible = [];
                searchVisibleRects(layer, boundsInfo);
            });

            sizeObserver.observe(layer);

            return () => {
                sizeObserver.unobserve(layer);
                layer.removeEventListener("pointerdown", onPointerDown);
                layer.removeEventListener("pointermove", onPointerMove);
                layer.removeEventListener("pointerup", onPointerUp);
                layer.removeEventListener("pointercancel", onPointerUp);
                layer.removeEventListener("pointerleave", onPointerUp);
            };
        }
    }, [layerRef]);

    function createComponent(c: (Control | Layout) & Partial<InstanceProps>) {
        const instanceProps: InstanceProps = {
            uid: c.uid!,
            createComponent,
        };
        if (isLayoutTag(c.tag)) {
            return createLayout(c as Layout, { nested: true });
        }
        c = c as Control & Partial<InstanceProps>;
        switch (c.tag) {
            case "button": {
                return <Button
                    {...instanceProps}
                    {...c} />;
            }
        }
        throw new Error("Can't create control " + JSON.stringify(c, null, 2));
    }

    function createLayout(layout: Layout & Partial<InstanceProps>,
                          options?: { nested: boolean }): JSX.Element | null {
        const activeClass =
            useSelector((state: State) => isActive(state, layout.uid)) ? "border-primary border-2 " : "";
        switch (layout.tag) {
            case "col":
            case "row":
                return <RowCol {...layout as any}
                    options={options}
                    createComponent={createComponent} />;
            case "gap": {
                return <div class={activeClass + "w-12 h-12"}></div>;
            }
            case "anchor": {
                return <Anchor {...layout as any}
                    createComponent={createComponent} />;
            }
            case "stack": {
                return <div class={activeClass}>
                    {layout.layout.map(createComponent)}
                </div>;
            }
            case "sensor": {
                return <Sensor {...layout as any}
                    createComponent={createComponent} />;
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

function searchVisibleRects(el: Element, boundsInfo: BoundsInfo) {
    if (el.classList.contains(pointerZoneClass)) {
        boundsInfo.visible.push(el.getBoundingClientRect());
    }

    for (const next of el.children) {
        searchVisibleRects(next, boundsInfo);
    }
}

function filterPointerEvent(e: PointerEvent, boundsInfo: BoundsInfo) {
    for (const next of boundsInfo.visible) {
        if (e.clientX >= next.left && e.clientY >= next.top &&
            e.clientX <= next.right && e.clientY <= next.bottom) {
            return true;
        }
    }

    return false;
}

function relX(e: PointerEvent, boundsInfo: BoundsInfo) {
    return (e.clientX - boundsInfo.rect.left) / boundsInfo.rect.width;
}

function relY(e: PointerEvent, boundsInfo: BoundsInfo) {
    return (e.clientY - boundsInfo.rect.top) / boundsInfo.rect.height;
}
