import { Ref, useEffect, useRef } from "preact/hooks";
import { createNippleHandler } from "./nipple/nipple";
import { useSelector } from "react-redux";
import { State } from "../store";

export function JoyRing(props: {
    layerRef: Ref<HTMLDivElement>,
    onChange: (active: boolean, angle: number, distance: number) => void,
}) {
    const scale = useSelector((state: State) => state.ui.scale);
    const layerRef = props.layerRef;
    const sensorRef = useRef<HTMLDivElement>(null);
    const nippleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sensor = sensorRef.current;
        const nipple = nippleRef.current;
        const layer = layerRef.current;

        if (sensor !== null && nipple !== null && layer !== null) {
            const handler = createNippleHandler(nipple, sensor, props.onChange);
            let pointerId: number | null = null;
            function onPoinerDown(e: PointerEvent) {
                if (pointerId === null &&
                    (e.target === layer || e.target === nipple || e.target === sensor)) {
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

    return <>
        <div ref={sensorRef}
            class="w-48 h-48 absolute pointer-events-none rounded-full bg-neutral opacity-20"
            style={ "scale: " + scale }/>
        <div ref={nippleRef}
            class="absolute hidden pointer-events-none bg-neutral-content opacity-80 w-20 h-20 rounded-full"
            style={ "scale: " + scale } />
    </>;
}
