import { useSelector } from "react-redux";
import { Align, InstanceProps, LayoutBase } from "../types";
import { State } from "../store";
import { boxToPosition } from "../style";

export interface Anchor extends LayoutBase {
    tag: "anchor",
    halign?: Align,
    valign?: Align,
};

export function Anchor(props: Anchor & InstanceProps) {
    const activeClass =
        useSelector((state: State) => state.ui.active[props.uid!] > 0) ? "border-primary border-2 " : "";
    const scale = useSelector((state: State) => state.ui.scale);
    return <div class={activeClass} style={boxToPosition({
        scale: scale + "",
    }, props)}>
        {props.layout.map(props.createComponent)}
    </div>;
}
