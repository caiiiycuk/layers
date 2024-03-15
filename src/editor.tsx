import { useDispatch, useSelector } from "react-redux";
import { State } from "./store";
import { useEffect, useState } from "preact/hooks";
import { lastUid, uiSlice } from "./store/ui";
import { editorSlice } from "./store/editor";
import {
    BoxRem, Control, ControlTag, InstanceProps, Layer,
    Layout, LayoutTag, Tag, allLayoutTags, allTags, isControlTag, isLayoutTag,
} from "./types";
import { ButtonEditor } from "./controls/button";
import { RowColEditor } from "./layout/row-col";
import { BoxRemEditor } from "./editors";
import { SensorEditor } from "./layout/sensor";

export function Editor() {
    const [tab, setTab] = useState<"layers" | "json" | "options">("layers");
    const activeHead = useSelector((state: State) => state.ui.activeHead);
    const selectedUid = useSelector((state: State) => state.editor.selectedUid);
    const editorLayerIndex = useSelector((state: State) => state.editor.layerIndex);
    const layerIndex = useSelector((state: State) => state.ui.layer);
    const layers = useSelector((state: State) => state.ui.layers);
    const dispatch = useDispatch();
    useEffect(() => {
        if (activeHead !== null && selectedUid !== activeHead) {
            if (editorLayerIndex !== layerIndex) {
                dispatch(editorSlice.actions.setLayerIndex(layerIndex));
            }
            dispatch(editorSlice.actions.selectUid(activeHead));

            if (layerIndex >= 0 && layerIndex < layers.length) {
                const layer = layers[layerIndex];
                const path: number[] = [];

                function lookup(c: Layout & InstanceProps, uid: number, path: number[]): boolean {
                    if (c.uid === uid) {
                        return true;
                    }

                    if (c.layout) {
                        for (let i = 0; i < c.layout.length; ++i) {
                            path.push(i);
                            if (lookup(c.layout[i] as (Layout & InstanceProps), uid, path)) {
                                return true;
                            } else {
                                path.pop();
                            }
                        }
                    }

                    return false;
                }

                if (lookup(layer as any, activeHead, path)) {
                    dispatch(editorSlice.actions.resetPath(path));
                }
            }
        }
    }, [activeHead, selectedUid, layerIndex, layers, editorLayerIndex]);

    useEffect(() => {
        return () => {
            dispatch(editorSlice.actions.resetPath([]));
            dispatch(editorSlice.actions.selectUid(-1));
        };
    }, []);

    return <div class="w-full h-full flex flex-col">
        <div role="tablist" class="tabs tabs-bordered">
            <a role="tab" class={"tab " + (tab === "layers" ? "tab-active" : "")}
                onClick={() => setTab("layers")}>Layers</a>
            <a role="tab" class={"tab " + (tab === "json" ? "tab-active" : "")}
                onClick={() => setTab("json")}>JSON</a>
            <a role="tab" class={"tab " + (tab === "options" ? "tab-active" : "")}
                onClick={() => setTab("options")}>Options</a>
        </div>
        {tab === "layers" && <LayersTab></LayersTab>}
        {tab === "json" && <JsonTab></JsonTab>}
        {tab === "options" && <OptionsTab></OptionsTab>}
    </div >;
}

export function JsonTab() {
    const dispatch = useDispatch();
    const layers = useSelector((state: State) => state.ui.layers);
    const [json, setJson] = useState<string>(JSON.stringify(layers, null, 2));
    return <div class="flex flex-col gap-2 flex-grow">
        <textarea
            class="textarea textarea-bordered font-mono text-xs flex-grow"
            placeholder="" value={json}
            onChange={(e) => setJson(e.currentTarget.value)}>
        </textarea>
        <div class="join mb-2 mr-2 self-end">
            <button class="btn btn-sm join-item btn-warning"
                onClick={() => setJson(JSON.stringify(layers, null, 2))}>Reset</button>
            <button class="btn btn-sm join-item btn-primary"
                onClick={() => {
                    const newLayers = JSON.parse(json);
                    if (newLayers) {
                        dispatch(uiSlice.actions.setLayers(newLayers));
                    }
                }}>Apply</button>
            <button class="btn btn-sm join-item btn-success"
                onClick={() => {
                    navigator.clipboard.writeText(json);
                }}>Copy</button>
        </div>
    </div>;
}

export function OptionsTab() {
    const dispatch = useDispatch();
    const scale = useSelector((state: State) => state.ui.scale);
    return <div class="my-4 mx-4 flex flex-col gap-2 flex-grow">
        <div class="flex flex-row gap-2">
            <div>Scale</div>
            <input type="range" min="0" max="200" value={Math.round(scale * 100)}
                class="range"
                onChange={(e) => {
                    const newScale = Number.parseInt(e.currentTarget.value);
                    if (newScale) {
                        dispatch(uiSlice.actions.setScale(newScale / 100));
                    }
                }} />
            <div>{scale}x</div>
        </div>
    </div>;
}

export function LayersTab() {
    const layersIndex = useSelector((state: State) => state.editor.layerIndex);
    return <div>
        {layersIndex === null && <LayersView />}
        {layersIndex !== null && <LayerView />}
    </div>;
}

export function LayersView() {
    const dispatch = useDispatch();
    const layers = useSelector((state: State) => state.ui.layers);
    const layer = useSelector((state: State) => state.ui.layer);
    function selectLayer(i: number) {
        dispatch(uiSlice.actions.setLayer(i));
        dispatch(editorSlice.actions.setLayerIndex(i));
    };
    return <div class="overflow-x-auto">
        <table class="table">
            <thead>
                <tr>
                    <th>№</th>
                    <th>Layer Definition</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {layers.map((l, i) => {
                    const selectClick = () => {
                        dispatch(uiSlice.actions.setLayer(i));
                    };
                    return <tr class={i === layer ? "bg-base-200" : ""}>
                        <th class="w-24 cursor-pointer" onClick={selectClick}>{i}</th>
                        <td class="cursor-pointer" onClick={selectClick}>
                            <span class="font-bold inline-block">{l.layout.map((l) => l.tag).join(":")}</span>
                            <br />
                            {boxStr(l)}
                        </td>
                        <td>
                            <div class="join">
                                <button class="btn btn-xs join-item hover:btn-primary"
                                    onClick={() => selectLayer(i)}>Open</button>
                                <button class="btn btn-xs join-item hover:btn-error"
                                    onClick={() => {
                                        const newLayers = [...layers];
                                        newLayers.splice(i, 1);
                                        dispatch(uiSlice.actions.setLayers(newLayers));
                                    }}>Delete</button>
                            </div>
                        </td>
                    </tr>;
                })}
                <tr>
                    <th></th>
                    <td></td>
                    <td><button class="btn btn-xs" onClick={() => {
                        dispatch(uiSlice.actions.setLayers([...layers, { layout: [] }]));
                        selectLayer(layers.length);
                    }}>Add</button></td>
                </tr>
            </tbody>
        </table>
    </div>;
}

export function LayerView() {
    const dispatch = useDispatch();
    const layersIndex = useSelector((state: State) => state.editor.layerIndex)!;
    const layers = useSelector((state: State) => state.ui.layers);
    const layoutPath = useSelector((state: State) => state.editor.layoutPath);
    const selectedUid = useSelector((state: State) => state.editor.selectedUid);
    const layer = layers[layersIndex];
    function layoutOnPath(layer: Layer, path: number[]): {
        tag: Tag | "layer",
        layout: (Control | Layout)[] | null,
        component: Control | Layout | null,
        parent: Layout[] | null,
    } {
        let tag: Tag | "layer" = "layer";
        let component: Layout | Control | null = null;
        let parent: Layout[] | null = null;
        let layout: (Layout | Control)[] = layer.layout;
        for (const next of path) {
            parent = layout as Layout[];
            component = parent[next];
            tag = component.tag;
            layout = (component as Layout).layout;
        }
        return {
            tag,
            layout: layout ?? null,
            component: component ?? null,
            parent,
        };
    }
    function updateLayer(layer: Layer) {
        const newLayers = [...layers];
        newLayers[layersIndex] = layer;
        dispatch(uiSlice.actions.setLayers(newLayers));
    }
    function deleteOnPath(index: number) {
        const newLayer = structuredClone(layer);
        const layout = layoutOnPath(newLayer, layoutPath).layout;
        if (layout === null) {
            throw new Error("Unable to delete sub control in non layout state");
        }
        layout.splice(index, 1);
        updateLayer(newLayer);
    }
    function createOnPath(newTag: string) {
        const newLayer = structuredClone(layer);
        const layout = layoutOnPath(newLayer, layoutPath).layout;
        if (layout === null) {
            throw new Error("Unable to create sub control in non layout state");
        }
        if (isLayoutTag(newTag)) {
            layout.push({ tag: newTag as LayoutTag, layout: [] });
        } else {
            const tag = newTag as ControlTag;
            switch (tag) {
                case "button":
                    layout.push({ tag, action: "0" });
                    break;
                case "joy-arrows":
                    layout.push({ tag, up: "0", down: "0", left: "0", right: "0" });
                    break;
            }
        }
        updateLayer(newLayer);
    }
    function onControlChange(control: Control) {
        const newLayer = structuredClone(layer);
        const parent = layoutOnPath(newLayer, layoutPath).parent;
        if (parent === null) {
            throw new Error("Unable to update control in parent layout not found");
        }
        if ((parent[layoutPath[layoutPath.length - 1]] as Partial<InstanceProps>).uid !==
            (control as Partial<InstanceProps>).uid) {
            throw new Error("uid of old component does not match uid of new component");
        }
        parent[layoutPath[layoutPath.length - 1]] = control as any;
        updateLayer(newLayer);
    }
    function onLayoutChange(layout: Layout) {
        const newLayer = structuredClone(layer);
        const newPath = [...layoutPath];
        newPath.pop();

        const parent = layoutOnPath(newLayer, newPath).layout;
        if (parent === null) {
            throw new Error("Unable to update control in parent layout not found");
        }
        if ((parent[layoutPath[layoutPath.length - 1]] as Partial<InstanceProps>).uid !==
            (layout as Partial<InstanceProps>).uid) {
            throw new Error("uid of old component does not match uid of new component");
        }
        parent[layoutPath[layoutPath.length - 1]] = layout as any;
        updateLayer(newLayer);
    }
    const { tag, layout, component } = layoutOnPath(layer, layoutPath);
    return <div class="flex flex-col gap-2">
        <div class="flex flex-row gap-4 items-center bg-base-300">
            <button class="btn btn-sm btn-ghost self-start"
                onClick={() => {
                    dispatch(editorSlice.actions.setLayerIndex(null));
                    dispatch(editorSlice.actions.selectUid(-1));
                }}>&lt;- Back</button>
            <p>Layer №{layersIndex}</p>
        </div>
        <div class="flex flex-col mx-4 gap-2">
            <div class="flex flex-row flex-wrap gap-2 items-baseline">
                <div>Margins:</div>
                <BoxRemEditor component={layer} onChange={updateLayer} />
            </div>
            <div class="flex flex-row items-center bg-base-200 -mx-4 mt-2">
                {layoutPath.length > 0 && <button class="btn btn-sm btn-ghost self-start"
                    onClick={() => {
                        dispatch(editorSlice.actions.popPath());
                        dispatch(editorSlice.actions.selectUid(-1));
                    }}>&lt;- Back</button>}
                <p class="ml-4">Layout ({layoutPath.length > 0 ? "base:" + layoutPath.join(":") : "base"}) ({tag})</p>
            </div>
            <div class="overflow-x-auto">
                {isControlTag(tag) && (() => {
                    switch (tag as ControlTag) {
                        case "button": return <ButtonEditor
                            control={component as any}
                            onChange={onControlChange} />;
                    }
                })()}
                {(tag === "layer" || isLayoutTag(tag)) && <div class="flex flex-col gap-4">
                    <div class="font-bold">Properties</div>
                    <div class="mx-4">
                        {(() => {
                            switch (tag as LayoutTag) {
                                case "row":
                                case "col":
                                    return <RowColEditor layout={component as any}
                                        onChange={onLayoutChange} />;
                                case "sensor":
                                    return <SensorEditor layout={component as any}
                                        onChange={onLayoutChange} />;
                            }
                        })()}
                    </div>
                    <div class="font-bold">Layout Config</div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th class="w-24">№</th>
                                <th>Layout</th>
                                <th>Editor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {layout?.map((l: (Layout | Control) & Partial<InstanceProps>, i) => {
                                const selectClick = () => {
                                    dispatch(editorSlice.actions.selectUid(l.uid ?? 0));
                                };
                                return <tr class={l.uid === selectedUid ? "bg-base-200" : ""}>
                                    <th class="w-24 cursor-pointer" onClick={selectClick}>{i}</th>
                                    <td class="cursor-pointer" onClick={selectClick}>
                                        <div class="flex flex-row gap-2 items-center">
                                            <div class="flex-grow">
                                                <span class="font-bold">{l.tag}</span><br />{boxStr(l)}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="join">
                                            <button class="btn btn-xs join-item hover:btn-primary"
                                                onClick={() => {
                                                    selectClick();
                                                    dispatch(editorSlice.actions.pushPath(i));
                                                }}>
                                                Open
                                            </button>
                                            <button class="btn btn-xs join-item hover:btn-error"
                                                onClick={() => deleteOnPath(i)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>;
                            })}
                            <tr>
                                <th>New</th>
                                <td colSpan={2}>
                                    <div class="join flex-wrap items-center">
                                        {(tag === "layer" ? allLayoutTags : allTags).map((tag) => {
                                            return <div class="btn join-item btn-xs"
                                                onClick={() => {
                                                    createOnPath(tag);
                                                    const uid = lastUid();
                                                    dispatch(editorSlice.actions.selectUid(uid));
                                                    dispatch(editorSlice.actions.pushPath(layout?.length ?? 0));
                                                }}>
                                                {tag[0].toUpperCase() + tag.substring(1)}
                                            </div>;
                                        })}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>}
            </div>
        </div>
    </div>;
}

function boxStr(box: BoxRem | any) {
    function f(key: "left" | "right" | "top" | "bottom") {
        if (box[key] === undefined) {
            return "";
        } else {
            return key[0] + ": " + box[key];
        }
    }
    return [f("left"), f("top"), f("right"), f("bottom")].filter((l) => l.length > 0).join(" ");
}
