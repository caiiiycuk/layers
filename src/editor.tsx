import { useDispatch, useSelector } from "react-redux";
import { State } from "./store";
import { useState } from "preact/hooks";
import { uiSlice } from "./store/ui";
import { editorSlice } from "./store/editor";
import { BoxRem, Control, Instance, Layer, Layout, Tag, allLayoutTags, allTags, isLayoutTag } from "./types";

export function Editor() {
    const [tab, setTab] = useState<"layers" | "json">("layers");

    return <div class="w-full h-full flex flex-col">
        <div role="tablist" class="tabs tabs-bordered">
            <a role="tab" class={"tab " + (tab === "layers" ? "tab-active" : "")}
                onClick={() => setTab("layers")}>Layers</a>
            <a role="tab" class={"tab " + (tab === "json" ? "tab-active" : "")}
                onClick={() => setTab("json")}>JSON</a>
        </div>
        {tab === "layers" && <LayersTab></LayersTab>}
        {tab === "json" && <JsonTab></JsonTab>}
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
    const [newTag, setNewTag] = useState<Tag>(allLayoutTags[0]);
    const layer = layers[layersIndex];
    function layoutOnPath(layer: Layer, path: number[]): { tag: Tag | "layer", layout: (Layout | Control)[] } {
        let tag: Tag | "layer" = "layer";
        let layout: (Layout | Control)[] = layer.layout;
        for (const next of path) {
            const nextLayout = (layout[next] as Layout);
            tag = nextLayout.tag;
            layout = nextLayout.layout;
        }
        return { tag, layout };
    }
    function updateLayer(layer: Layer) {
        const newLayers = [...layers];
        newLayers[layersIndex] = layer;
        dispatch(uiSlice.actions.setLayers(newLayers));
    }
    function updateBox(key: "left" | "top" | "right" | "bottom", value: string) {
        const newLayer = { ...layer };
        if (value.length > 0) {
            newLayer[key] = Number.parseInt(value) ?? undefined;
        } else {
            delete newLayer[key];
        }
        updateLayer(newLayer);
    }
    function deleteOnPath(index: number) {
        const newLayer = structuredClone(layer);
        const layout = layoutOnPath(newLayer, layoutPath).layout;
        layout.splice(index, 1);
        updateLayer(newLayer);
    }
    function createOnPath() {
        const newLayer = structuredClone(layer);
        const layout = layoutOnPath(newLayer, layoutPath).layout;
        switch (newTag) {
            case "col":
            case "row":
            case "abs":
            case "gap":
                layout.push({ tag: newTag, layout: [] });
                break;
            case "button":
                layout.push({ tag: newTag, action: 0 });
                break;
            case "joy-arrows":
                layout.push({ tag: newTag, up: 0, down: 0, left: 0, right: 0 });
                break;
        }
        updateLayer(newLayer);
    }
    const { tag, layout } = layoutOnPath(layer, layoutPath);
    return <div class="flex flex-col gap-2">
        <div class="flex flex-row gap-4 items-center bg-base-300">
            <button class="btn btn-sm btn-ghost self-start"
                onClick={() => {
                    dispatch(editorSlice.actions.setLayerIndex(null));
                    dispatch(uiSlice.actions.deactivate(selectedUid));
                    dispatch(editorSlice.actions.selectUid(-1));
                }}>&lt;- Back</button>
            <p>Layer №{layersIndex}</p>
        </div>
        <div class="flex flex-col mx-4 gap-2">
            <p>Margins</p>
            <div class="flex flex-row gap-2 items-baseline mx-4">
                <p>l:</p>
                <input type="number" class="input input-bordered input-xs w-16" value={layer.left ?? ""}
                    onChange={(e) => updateBox("left", e.currentTarget.value)} />
                <p>r:</p>
                <input type="number" class="input input-bordered input-xs w-16" value={layer.right ?? ""}
                    onChange={(e) => updateBox("right", e.currentTarget.value)} />
                <p>t:</p>
                <input type="number" class="input input-bordered input-xs w-16" value={layer.top ?? ""}
                    onChange={(e) => updateBox("top", e.currentTarget.value)} />
                <p>b:</p>
                <input type="number" class="input input-bordered input-xs w-16" value={layer.bottom ?? ""}
                    onChange={(e) => updateBox("bottom", e.currentTarget.value)} />
            </div>
            <div class="flex flex-row items-center bg-base-200 -mx-4 mt-2">
                {layoutPath.length > 0 && <button class="btn btn-sm btn-ghost self-start"
                    onClick={() => {
                        dispatch(editorSlice.actions.popPath());
                        dispatch(uiSlice.actions.deactivate(selectedUid));
                        dispatch(editorSlice.actions.selectUid(-1));
                    }}>&lt;- Back</button>}
                <p class="ml-4">Layout ({layoutPath.length > 0 ? "base:" + layoutPath.join(":") : "base"}) ({tag})</p>
            </div>
            <div class="overflow-x-auto">
                <table class="table">
                    <thead>
                        <tr>
                            <th class="w-24">№</th>
                            <th>Layout</th>
                            <th>Editor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(tag === "layer" || isLayoutTag(tag)) &&
                            layout.map((l: (Layout | Control) & Partial<Instance>, i) => {
                                const selectClick = () => {
                                    dispatch(uiSlice.actions.deactivate(selectedUid));
                                    dispatch(uiSlice.actions.activate(l.uid ?? 0));
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
                                            {
                                                (() => {
                                                    switch (l.tag) {
                                                        case "row":
                                                        case "col":
                                                            return <ColRowView item={l} index={i} />;
                                                    }
                                                    return null;
                                                })()
                                            }
                                            <button class="btn btn-xs join-item hover:btn-error"
                                                onClick={() => deleteOnPath(i)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>;
                            })}
                        {(tag === "layer" || isLayoutTag(tag)) && <tr>
                            <th></th>
                            <td>
                                <select class="select select-xs" value={newTag}
                                    onChange={(e) => setNewTag(e.currentTarget.value as Tag)}>
                                    {(tag === "layer" ? allLayoutTags : allTags).map((tag) => {
                                        return <option value={tag}>{tag}</option>;
                                    })}
                                </select>
                            </td>
                            <td><button class="btn btn-xs" onClick={() => {
                                createOnPath();
                                dispatch(editorSlice.actions.pushPath(layout.length));
                            }}>Add</button></td>
                        </tr>}
                    </tbody>
                </table>
            </div>
        </div>
    </div>;
}

function ColRowView(props: { item: Layout & { tag: "row" | "col" }, index: number }) {
    const dispatch = useDispatch();
    return <>
        <button class="btn btn-xs join-item hover:btn-primary"
            onClick={() => {
                dispatch(editorSlice.actions.pushPath(props.index));
            }}>Open</button>
    </>;
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
