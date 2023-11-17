import { useRef } from "preact/hooks";
import { JoyRing } from "./controls/joy-ring";
import { useSelector } from "react-redux";
import { State } from "./store";

export type Control = {
    tag: "joy-arrows",
    up: number,
    down: number,
    left: number,
    right: number,
    forwardRange?: number,
    backwardRange?: number,
}
export interface LayerDescription {
    controls: Control[],
}
export interface LayerOnChange {
    button: (code: number, pressed: boolean) => void;
}


export function Layer(props: {
    description: LayerDescription,
    onChange: LayerOnChange
}) {
    // TODO move out
    const visible = useSelector((state: State) => state.ui.visible);
    const layerRef = useRef<HTMLDivElement>(null);
    const { description, onChange } = props;
    const pressedCounter: { [code: number]: number } = {};

    if (!visible) {
        return null;
    }

    function buttonChange(code: number, press: boolean) {
        if (pressedCounter[code] === undefined) {
            pressedCounter[code] = 0;
        }

        const pressed = pressedCounter[code] > 0;
        pressedCounter[code] += press ? 1 : -1;
        const newPressed = pressedCounter[code] > 0;

        if (pressed != newPressed) {
            onChange.button(code, newPressed);
        }
    }

    return <div ref={layerRef} class="w-full h-full">
        {description.controls.map((c) => {
            switch (c.tag) {
                case "joy-arrows": {
                    const pressed: boolean[] = [false, false, false, false];
                    const codes = [c.up, c.down, c.left, c.right];
                    const forwardRange = c.forwardRange ?? 0.2;
                    const backwardRange = c.backwardRange ?? 0.2;
                    return <JoyRing layerRef={layerRef} onChange={(active, angle, distance) => {
                        const newPressed = [false, false, false, false];
                        if (active && distance >= 0.25) {
                            if (angle >= 0 && angle <= forwardRange ||
                                angle >= Math.PI * 2 - forwardRange && angle <= Math.PI * 2) {
                                newPressed[0] = true;
                            } else if (angle >= Math.PI - backwardRange &&
                                angle <= Math.PI + backwardRange) {
                                newPressed[1] = true;
                            } else {
                                if (angle >= 0 && angle <= Math.PI) {
                                    newPressed[2] = true;
                                } else {
                                    newPressed[3] = true;
                                }
                                if (angle >= Math.PI / 2 && angle <= 3 / 2 * Math.PI) {
                                    newPressed[1] = true;
                                } else {
                                    newPressed[0] = true;
                                }
                            }
                        }

                        for (let i = 0; i < 4; ++i) {
                            if (pressed[i] != newPressed[i]) {
                                buttonChange(codes[i], newPressed[i]);
                                pressed[i] = newPressed[i];
                            }
                        }
                    }} />;
                } break;
                default: {
                    console.error("Unknown control tag", c);
                }
            }
            return null;
        })}
    </div>;
}
