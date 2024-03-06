import { useEffect, useRef, useState } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { uiSlice } from "../store/ui";
import { InstanceProps } from "../types";

export interface ButtonProps {
    tag: "button",
    label?: string,
    icon?: string,
    action: string,
}

export function Button(props: ButtonProps & InstanceProps) {
    const { label, icon, actionChange, uid, action } = props;
    const onButtonDown = () => {
        actionChange(action, true);
    };
    const onButtonUp = () => {
        actionChange(action, false);
    };
    const zoneRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLDivElement>(null);
    const pointers = useSelector((state: State) => state.ui.pointers);
    const [pressed, setPressed] = useState<boolean>(false);
    const active = useSelector((state: State) => state.ui.active[uid]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (zoneRef.current === null) {
            return;
        }

        const zone = zoneRef.current;
        const values = Object.values(pointers);

        let newPressed = false;
        if (values.length > 0) {
            const rect = zone.getBoundingClientRect();
            for (const next of values) {
                const { x, y } = next;
                if (x >= rect.left && x <= rect.right &&
                    y >= rect.top && y <= rect.bottom) {
                    newPressed = true;
                    break;
                }
            }
        }

        if (pressed !== newPressed) {
            setPressed(newPressed);
            dispatch(newPressed ? uiSlice.actions.activate(uid) : uiSlice.actions.deactivate(uid));
            newPressed ? onButtonDown() : onButtonUp();
        }
    }, [pressed, zoneRef, pointers, onButtonDown, onButtonUp, uid]);

    useEffect(() => {
        const el = btnRef?.current;
        if (icon && el) {
            const img = document.createElement("img");
            img.src = icon;
            img.style.pointerEvents = "none";
            img.style.maxWidth = "2rem";
            img.style.maxHeight = "2rem";
            el.appendChild(img);
            return () => {
                el.removeChild(img);
            };
        }
    }, [btnRef?.current, icon]);

    return <div class="cursor-pointer p-4" ref={zoneRef}>
        <div ref={btnRef} class={"btn btn-circle pointer-events-none " +
            (active ? "bg-primary text-primary-content" : " ")}>{label}</div>
    </div>;
}

export function ButtonEditor(props: {
    control: ButtonProps,
    onChange: (props: ButtonProps) => void,
}) {
    const { control, onChange } = props;
    return <div class="flex flex-row gap-2 items-center">
        <div class="flex flex-row gap-2 items-center">
            Label
            <input class="input input-bordered w-16 input-sm"
                value={control.label ?? ""}
                onChange={(e) => {
                    const newControl = structuredClone(control);
                    newControl.label = e.currentTarget.value;
                    onChange(newControl);
                }} />
        </div>
        <div class="flex flex-row gap-2 items-center">
            Action
            <input class="input input-bordered w-16 input-sm"
                value={control.action}
                onChange={(e) => {
                    const newControl = structuredClone(control);
                    newControl.action = e.currentTarget.value;
                    onChange(newControl);
                }} />
        </div>
    </div>;
}
