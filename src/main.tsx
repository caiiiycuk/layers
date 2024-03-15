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
    _onChange: LayerOnChange) => {
    const store = createStore();
    store.dispatch(uiSlice.actions.setLayers(layers));
    root.style.userSelect = "none";
    root.style.touchAction = "none";
    const active: { [code: string]: boolean } = {};
    const onChange: LayerOnChange = {
        action: (code: string, newActive: boolean) => {
            if ((active[code] ?? false) !== newActive) {
                active[code] = newActive;
                _onChange.action(code, newActive);
            }
        },
        pointer: (x: number, y: number, event: "down" | "up" | "move") => {
            if (store.getState().ui.pointerEventConsumers === 0) {
                _onChange.pointer(x, y, event);
            }
        },
    };
    store.subscribe(() => {
        const uidAction = store.getState().ui.uidAction;
        const active = store.getState().ui.active;
        for (const next of Object.keys(uidAction)) {
            const actionActive = (active[next as any] ?? 0) > 0;
            for (const action of uidAction[next as any]) {
                onChange.action(action, actionActive);
            }
        }
    });
    render(<Provider store={store}>
        <Layers onChange={onChange} />
    </Provider>, root);
    let editorRoot: HTMLElement | null = null;
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
            if (editorRoot !== null) {
                throw new Error("Editor already mounted");
            }
            editorRoot = el;
            store.dispatch(uiSlice.actions.setEditor(true));
            render(<Provider store={store}>
                <Editor />
            </Provider>, editorRoot);
        },
        unmountEditor: () => {
            if (editorRoot) {
                store.dispatch(uiSlice.actions.setEditor(false));
                render(null, editorRoot);
                editorRoot = null;
            }
        },
    };

    return api;
};
