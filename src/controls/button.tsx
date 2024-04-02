import { useEffect, useRef, useState } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { uiSlice } from "../store/ui";
import { ControlBase, InstanceProps, pointerZoneClass } from "../types";
import { FieldEditor } from "../editors";
import { defaultSize } from "../defaults";
import { isActive } from "../style";

export interface ButtonProps extends ControlBase {
    tag: "button",
    label?: string,
    icon?: string,
    size?: number,
}

const domParser = new DOMParser();

export function Button(props: ButtonProps & InstanceProps) {
    const { label, uid } = props;
    const icon = props.icon ? props.icon.trim() : undefined;
    const size = props.size ?? defaultSize;
    const innerSize = Math.max(size - 1, 1);
    const zoneRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLDivElement>(null);
    const pointers = useSelector((state: State) => state.ui.pointers);
    const active = useSelector((state: State) => isActive(state, uid));
    const [myActive, setMyAcitve] = useState<boolean>(false);
    const dispatch = useDispatch();

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

        if (myActive !== newActive) {
            dispatch(newActive ? uiSlice.actions.activate(uid) : uiSlice.actions.deactivate(uid));
            setMyAcitve(newActive);
        }
    }, [zoneRef, pointers, myActive, uid]);

    useEffect(() => {
        const el = btnRef?.current;
        if (icon && el) {
            let iconEl: HTMLElement | SVGSVGElement | null = null;
            if (icon.startsWith("<svg")) {
                iconEl = domParser.parseFromString(icon, "image/svg+xml").querySelector("svg");
            } else {
                const img = document.createElement("img");
                img.src = icon;
                iconEl = img;
            }

            if (iconEl) {
                iconEl.style.pointerEvents = "none";
                iconEl.style.width = innerSize * 0.75 + "rem";
                iconEl.style.height = innerSize * 0.75 + "rem";
                el.appendChild(iconEl);
                return () => {
                    el.removeChild(iconEl!);
                };
            }
        }
    }, [btnRef?.current, icon]);

    return <div
        class={"cursor-pointer relative " + pointerZoneClass}
        style={{ width: size + "rem", height: size + "rem" }} ref={zoneRef}>
        <div ref={btnRef}
            style={{
                position: "absolute",
                left: ((size - innerSize) / 2) + "rem",
                top: ((size - innerSize) / 2) + "rem",
                width: innerSize + "rem",
                height: innerSize + "rem",
            }}
            class={"btn btn-circle pointer-events-none " +
                (active ? "bg-primary text-primary-content" : " ")}>{label}</div>
    </div>;
}

export function ButtonEditor(props: {
    control: ButtonProps,
    onChange: (props: ButtonProps) => void,
}) {
    const { control, onChange } = props;
    return <div class="flex flex-row flex-wrap gap-2 items-center">
        <FieldEditor field="label" props={control} onChange={onChange} default={""} />
        <FieldEditor field="size" props={control} onChange={onChange} default={defaultSize} type="number" />
        <FieldEditor field="action" props={control} onChange={onChange} />
        <FieldEditor field="icon" props={control} onChange={onChange} type="url" />
    </div>;
}
