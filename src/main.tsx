import { render } from "preact";
import "./index.css";
import { Provider } from "react-redux";
import { Layer, LayerOnChange, LayersApi } from "./types";
import { uiSlice } from "./store/ui";
import { createStore } from "./store";
import { Layers } from "./layer";
import { Editor } from "./editor";

(window as any).createLayers = (root: HTMLElement,
    layers: Layer[],
    onChange: LayerOnChange) => {
    const store = createStore();
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
