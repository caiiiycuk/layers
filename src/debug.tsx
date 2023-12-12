import { Layer, LayerOnChange, LayersApi } from "./types";
import { useDispatch, useSelector } from "react-redux";
import { State } from "./store";
import { uiSlice } from "./store/ui";
import { Layers } from "./Layer";

declare const api: LayersApi;

const debugLayers: Layer[] = [{
    left: 2,
    top: 2,
    right: 2,
    bottom: 2,
    layout:
        [{
            tag: "col",
            items: [{
                tag: "button",
                label: "A",
                action: 1,
            }, {
                tag: "row",
                items: [{
                    tag: "button",
                    label: "B",
                    action: 5,
                }, {
                    tag: "button",
                    label: "D",
                    action: 7,
                }],
            }, {
                tag: "gap",
            }, {
                tag: "button",
                label: "C",
                action: 6,
            }],
        }],
    // controls: [,
    // {
    //     tag: "joy-arrows",
    //     up: 0,
    //     down: 1,
    //     left: 2,
    //     right: 3,
    // },],
    // layout: {
    //     tag: "absolute",
    //     leftTop: [
    //         [20, 20],
    //         [80, 80]
    //     ],
    // },
}, {
    right: 2,
    top: 2,
    layout: [{
        tag: "abs",
        right: 0,
        item: {
            tag: "button",
            label: "A",
            action: 1,
        },
    }],
}];

const debugOnChange: LayerOnChange = {
    action: (code, active) => {
        if (code === 1 && active) {
            api.setLayer(api.getLayer() + 1);
        }
        console.log("button", code, active ? "active" : "not-active");
    },
};

export function Debug() {
    const scale = useSelector((state: State) => state.ui.scale);
    const layer = useSelector((state: State) => state.ui.layer);
    const dispatch = useDispatch();
    return <>
        <input type="range" min={1} max={50} value={scale * 10} step={1}
            onChange={(e) => dispatch(uiSlice.actions.setScale(Number.parseInt(e.currentTarget.value) / 10))}
            class="range" />
        <p>Layer: {layer} Scale: {scale}</p>
        <div class="relative h-full">
            <Layers layers={debugLayers} onChange={debugOnChange} />
        </div>
    </>;
}
