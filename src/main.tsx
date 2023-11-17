import { render } from "preact";
import "./index.css";
import { store } from "./store";
import { Provider } from "react-redux";
import { Debug } from "./debug";
import { Layer, LayerDescription, LayerOnChange } from "./Layer";
import { uiSlice } from "./store/ui";


const publicStoreApi = {
    setVisible: (visible: boolean) => {
        store.dispatch(uiSlice.actions.setVisible(visible));
    },
};

(window as any).createDebugLayer = function(root: HTMLDivElement) {
    render(<>
        <Provider store={store}>
            <Debug />
        </Provider>
    </>, root);

    return {
        ...publicStoreApi,
    };
};

(window as any).createLayers = function(root: HTMLDivElement, layers: LayerDescription[], onChange: LayerOnChange) {
    render(<>
        <Provider store={store}>
            <Layer description={layers[0]} onChange={onChange} />
        </Provider>
    </>, root);

    return {
        ...publicStoreApi,
    };
};
