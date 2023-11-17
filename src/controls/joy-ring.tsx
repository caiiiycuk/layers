import { Ref, useEffect, useRef } from "preact/hooks";
import { useSelector } from "react-redux";
import { State } from "../store";
import { createNippleHandler } from "./nipple/nipple";

export function JoyRing(props: {
    layerRef: Ref<HTMLDivElement>,
    onChange: (active: boolean, angle: number, distance: number) => void,
}) {
    const layerRef = props.layerRef;
    const sensorRef = useRef<HTMLDivElement>(null);
    const nippleRef = useRef<HTMLDivElement>(null);
    const scale = useSelector((state: State) => state.ui.scale);

    useEffect(() => {
        const sensor = sensorRef.current;
        const nipple = nippleRef.current;
        const layer = layerRef.current;

        if (sensor !== null && nipple !== null && layer !== null) {
            const handler = createNippleHandler(nipple, sensor, props.onChange);

            let pointerId: number | null = null;
            function onPoinerDown(e: PointerEvent) {
                if (pointerId === null) {
                    pointerId = e.pointerId;
                    handler.nippleStart(e.clientX, e.clientY);
                }
            }

            function onPoinerMove(e: PointerEvent) {
                if (pointerId == e.pointerId) {
                    handler.nippleUpdate(e.clientX, e.clientY);
                }
            }

            function onPoinerUp(e: PointerEvent) {
                if (pointerId == e.pointerId) {
                    handler.nippleEnd();
                    pointerId = null;
                }
            }

            layer.addEventListener("pointerdown", onPoinerDown);
            layer.addEventListener("pointermove", onPoinerMove);
            layer.addEventListener("pointerup", onPoinerUp);
            layer.addEventListener("pointercancel", onPoinerUp);

            return () => {
                layer.removeEventListener("pointerdown", onPoinerDown);
                layer.removeEventListener("pointermove", onPoinerMove);
                layer.removeEventListener("pointerup", onPoinerUp);
                layer.removeEventListener("pointercancel", onPoinerUp);
            };
        }
    }, [sensorRef, nippleRef, layerRef, props.onChange]);

    return <div class="w-48 h-48 relative" style={{ scale: scale }}>
        <div ref={sensorRef}
            class="absolute pointer-events-none rounded-full bg-neutral opacity-20 w-full h-full" />
        <div ref={nippleRef}
            class="absolute hidden pointer-events-none bg-neutral-content opacity-80 w-1/2 h-1/2 rounded-full" />
    </div>;
}
