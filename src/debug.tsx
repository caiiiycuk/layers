import { Layer } from "./Layer";

export function Debug() {
    return <>
        <Layer
            description={{
                controls: [{
                    tag: "joy-arrows",
                    up: 0,
                    down: 1,
                    left: 2,
                    right: 3,
                }],
            }}
            onChange={{
                button: (code, pressed) => {
                    console.log("button", code, pressed ? "pressed" : "released");
                },
            }}></Layer>
    </>;
}
