import { useEffect, useRef, useState } from "preact/hooks";
import { useSelector } from "react-redux";
import { State } from "../store";

export function Button(props: {
    label?: string,
    icon?: HTMLElement,
    onButtonDown: () => void,
    onButtonUp: () => void,
}) {
    const { label, icon, onButtonDown, onButtonUp } = props;
    const zoneRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLDivElement>(null);
    const pointers = useSelector((state: State) => state.ui.pointers);
    const [active, setActive] = useState<boolean>(false);

    useEffect(() => {
        if (zoneRef.current === null) {
            return;
        }

        const zone = zoneRef.current;
        const values = Object.values(pointers);

        let newActive = false;
        if (values.length > 0) {
            const rect = zone.getBoundingClientRect();
            for (const next of values) {
                const { x, y } = next;
                if (x >= rect.left && x <= rect.right &&
                    y >= rect.top && y <= rect.bottom) {
                        newActive = true;
                        break;
                }
            }
        }

        if (active !== newActive) {
            setActive(newActive);
            newActive ? onButtonDown() : onButtonUp();
        }
    }, [active, zoneRef, pointers, onButtonDown, onButtonUp]);

    useEffect(() => {
        const el = btnRef?.current;
        if (icon && el) {
            icon.style.pointerEvents = "none";
            icon.style.maxWidth = "2rem";
            icon.style.maxHeight = "2rem";
            el.appendChild(icon);
            return () => {
                el.removeChild(icon);
            };
        }
    }, [btnRef?.current, icon]);

    return <div class="cursor-pointer p-4" ref={zoneRef}>
        <div ref={btnRef} class={"btn btn-circle pointer-events-none " + (active ? "bg-primary text-primary-content" : " " )}>{label}</div>
    </div>;
}

