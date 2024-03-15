import { useDispatch, useSelector } from "react-redux";
import { boxToPosition, isActive } from "../style";
import { InstanceProps, LayoutBase, pointerZoneClass } from "../types";
import { State } from "../store";
import { BoxRemEditor, FieldEditor } from "../editors";
import { defaultSize } from "../defaults";
import { useEffect, useRef, useState } from "preact/hooks";
import { uiSlice } from "../store/ui";

export interface SensorProps extends LayoutBase {
    tag: "sensor",
    size?: number,
}

export function Sensor(props: SensorProps & InstanceProps) {
    const uid = props.uid;
    const zoneRef = useRef<HTMLDivElement>(null);
    const scale = useSelector((state: State) => state.ui.scale);
    const pointers = useSelector((state: State) => state.ui.pointers);
    const active = useSelector((state: State) => isActive(state, props.uid));
    const [poinerId, setPointerId] = useState<string | null>(null);
    const [slotIndex, setSlotIndex] = useState<number | null>(null);
    const dispatch = useDispatch();
    const slotCount = Math.max(props.layout.length, 1);
    const angle = 2 * Math.PI / slotCount;


    // Math.round(angle / slotAngle)

    const size = props.size ?? defaultSize;
    const ringSize = size * 3;
    const style: any = boxToPosition({
        scale: scale + "",
    }, props);
    style.width = ringSize + "rem";
    style.height = ringSize + "rem";

    useEffect(() => {
        if (zoneRef.current === null) {
            return;
        }

        const zone = zoneRef.current;

        let newActive = active;
        let newPointer = null;
        let newSlotIndex = null;
        if (active) {
            if (poinerId != null) {
                const values = Object.values(pointers);
                for (const next of values) {
                    if (next.id === poinerId) {
                        newPointer = next;
                        break;
                    }
                }
                if (newPointer === null) {
                    newActive = false;
                } else {
                    const rect = zone.getBoundingClientRect();
                    const centerPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                    const nippleAngle = calcAngle(newPointer, centerPos);
                    newSlotIndex = Math.max(Math.min(props.layout.length - 1,
                        Math.floor(Math.PI + nippleAngle / angle + 0.5)), 0);
                }
            }
        } else {
            const values = Object.values(pointers);

            if (values.length > 0) {
                const rect = zone.getBoundingClientRect();
                for (const next of values) {
                    const { x, y } = next;
                    if (x >= rect.left && x <= rect.right &&
                        y >= rect.top && y <= rect.bottom) {
                        newActive = true;
                        newPointer = next;
                        break;
                    }
                }
            }
        }

        if (newActive !== active) {
            dispatch(newActive ? uiSlice.actions.activate(uid) : uiSlice.actions.deactivate(uid));
            dispatch(newActive ? uiSlice.actions.consumePointerEvent() : uiSlice.actions.relasePointerEvent());
        }

        const newPointerId = newPointer ? newPointer.id : null;
        if (newPointerId != poinerId) {
            setPointerId(newPointerId);
        }

        if (newSlotIndex != slotIndex) {
            if (slotIndex !== null) {
                dispatch(uiSlice.actions.deactivate((props.layout[slotIndex] as any).uid));
            }
            if (newSlotIndex !== null) {
                dispatch(uiSlice.actions.activate((props.layout[newSlotIndex] as any).uid));
            }
            setSlotIndex(newSlotIndex);
        }
    }, [zoneRef, pointers, active, poinerId, uid, angle, slotIndex]);

    return <div
        style={style}>
        <div
            ref={zoneRef}
            style={{
                left: (ringSize - size) / 2 + "rem", top: (ringSize - size) / 2 + "rem",
                width: size + "rem", height: size + "rem",
            }}
            class={"absolute btn btn-circle pointer-events-none " +
                pointerZoneClass +
                (active ? " bg-primary text-primary-content" : " ")}></div>
        {active && props.layout.map((c, i) => {
            const innerSize = ((c as any).size ?? size);
            return <div
                class="absolute pointer-events-none"
                style={{
                    left: (Math.cos(i * angle) * size + (ringSize - innerSize) / 2) + "rem",
                    top: (Math.sin(i * angle) * size + (ringSize - innerSize) / 2) + "rem",
                }}>
                {props.createComponent(c)}
            </div>;
        })}
    </div>;
}

export function SensorEditor(props: {
    layout: SensorProps,
    onChange: (props: SensorProps) => void,
}) {
    const { layout, onChange } = props;
    return <div class="flex flex-row gap-4 items-center">
        <div>Pos</div>
        <BoxRemEditor component={layout} onChange={onChange} />
        <FieldEditor field="size" props={layout} onChange={onChange} default={defaultSize} type="number" />
    </div>;
}


function calcAngle(p1: { x: number, y: number }, p2: { x: number, y: number }) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    return Math.atan2(dy, dx);
}

// function calcDistance(p1: { x: number, y: number }, p2: { x: number, y: number }) {
//     const dx = p2.x - p1.x;
//     const dy = p2.y - p1.y;

//     return Math.sqrt((dx * dx) + (dy * dy));
// }
