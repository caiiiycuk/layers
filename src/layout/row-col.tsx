import { useSelector } from "react-redux";
import { Align, InstanceProps, LayoutBase } from "../types";
import { State } from "../store";
import { boxToPosition } from "../style";
import { AlignSelect, BoxRemEditor } from "../editors";

export interface RowProps extends LayoutBase {
    tag: "row",
    align?: Align,
    justify?: Align,
};

export interface ColProps extends LayoutBase {
    tag: "col",
    align?: Align,
    justify?: Align,
};

export function RowCol(props: (RowProps | ColProps) & InstanceProps & {
    options?: { nested: boolean }
}) {
    const { options } = props;
    const activeClass =
        useSelector((state: State) => state.ui.active[props.uid!] > 0) ? "border-primary border-2 " : "";
    const scale = useSelector((state: State) => state.ui.scale);
    const style: any = options?.nested ? null : boxToPosition({
        scale: scale + "",
        alignItems: props.align ?? "start",
        justifyContent: props.justify ?? "start",
    }, props);
    return <div class={activeClass + "flex flex-" + props.tag} style={style} >
        {props.layout.map(props.createComponent)}
    </div>;
}

export function RowColEditor(props: {
    layout: RowProps | ColProps,
    onChange: (props: RowProps | ColProps) => void,
}) {
    const { layout, onChange } = props;
    return <div class="flex flex-row gap-4 items-center">
        <div>Pos</div>
        <BoxRemEditor component={layout} onChange={props.onChange}/>
        <div>Align</div>
        <AlignSelect component={layout} field={"align"} onChange={onChange} />
        <div>Justify</div>
        <AlignSelect component={layout} field={"justify"} onChange={onChange} />
    </div>;
}
