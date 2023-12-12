import { render, JSX } from "preact";
import "./index.css";
import { Provider } from "react-redux";
import { Layer, LayerOnChange, LayersApi } from "./types";
import { uiSlice } from "./store/ui";
import { createStore } from "./store";
import { Debug } from "./debug";
import { Layers } from "./Layer";

function renderLayers(root: HTMLElement, el: JSX.Element): LayersApi {
    const store = createStore();
    root.style.userSelect = "none";
    root.style.touchAction = "none";
    render(<Provider store={store}>
        {el}
    </Provider>, root);
    return {
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
    };
};

(window as any).createLayers = (root: HTMLElement,
    layers: Layer[],
    onChange: LayerOnChange) => {
    return renderLayers(root, <Layers layers={layers} onChange={onChange} />);
};

(window as any).createDebugLayer = (root: HTMLElement) => {
    return renderLayers(root, <Debug />);
};
