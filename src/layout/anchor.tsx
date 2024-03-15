import { useSelector } from "react-redux";
import { Align, InstanceProps, LayoutBase } from "../types";
import { State } from "../store";
import { boxToPosition, isActive } from "../style";

export interface AnchorProps extends LayoutBase {
    tag: "anchor",
    halign?: Align,
    valign?: Align,
};

export function Anchor(props: AnchorProps & InstanceProps) {
    const activeClass =
        useSelector((state: State) => isActive(state, props.uid)) ? "border-primary border-2 " : "";
    const scale = useSelector((state: State) => state.ui.scale);
    return <div class={activeClass} style={boxToPosition({
        scale: scale + "",
    }, props)}>
        {props.layout.map(props.createComponent)}
    </div>;
}
