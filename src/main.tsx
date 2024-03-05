import { render } from "preact";
import "./index.css";
import { Provider } from "react-redux";
import { Instance, Layer, LayerOnChange, LayersApi, Layout } from "./types";
import { uiSlice } from "./store/ui";
import { createStore } from "./store";
import { Layers } from "./layer";
import { Editor } from "./editor";

(window as any).createLayers = (root: HTMLElement,
    layers: Layer[],
    onChange: LayerOnChange) => {
    const store = createStore();
    let uid = 0;
    function assingIds(layout: Layout & Partial<Instance>) {
        layout.uid = ++uid;
        switch (layout.tag) {
            case "row":
            case "col":
            case "abs": {
                for (const next of layout.layout) {
                    switch (next.tag) {
                        case "row":
                        case "col":
                        case "abs":
                        case "gap": {
                            assingIds(next);
                        } break;
                        case "joy-arrows":
                        case "button": {
                            (next as Partial<Instance>).uid = ++uid;
                        } break;
                    }
                }
            } break;
            case "gap": {
                // do nothing
            }
        }
    }
    for (const layer of layers) {
        for (const layout of layer.layout) {
            assingIds(layout);
        }
    }
    store.dispatch(uiSlice.actions.setLayers(layers));
    root.style.userSelect = "none";
    root.style.touchAction = "none";
    render(<Provider store={store}>
        <Layers onChange={onChange} />
    </Provider>, root);
    const editorRoot: HTMLElement | null = null;
    const api: LayersApi = {
        setScale: (scale: number) => {
            store.dispatch(uiSlice.actions.setScale(scale));
        },
        getLayer: () => {
            return store.getState().ui.layer;
        },
        setLayer: (layer: number) => {
            store.dispatch(uiSlice.actions.setLayer(layer));
        },
        getVisible: () => {
            return root.style.display === "block";
        },
        setVisible: (visible: boolean) => {
            root.style.display = visible ? "block" : "none";
        },
        mountEditor: (el: HTMLElement) => {
            api.unmountEditor();
            render(<Provider store={store}>
                <Editor />
            </Provider>, el);
        },
        unmountEditor: () => {
            if (editorRoot) {
                render(null, editorRoot);
            }
        },
    };

    return api;
};
