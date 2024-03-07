import { useSelector } from "react-redux";
import { Align, InstanceProps, LayoutBase, alignValues } from "../types";
import { State } from "../store";
import { boxToPosition } from "../style";

const defaultAlign = "start";

export interface RowProps extends LayoutBase {
    tag: "row",
    align?: Align,
};

export interface ColProps extends LayoutBase {
    tag: "col",
    align?: Align,
};

export function RowCol(props: (RowProps | ColProps) & InstanceProps & {
    options?: { nested: boolean }
}) {
    const { options } = props;
    const activeClass =
        useSelector((state: State) => state.ui.active[props.uid!]) ? "border-primary border-2 " : "";
    const scale = useSelector((state: State) => state.ui.scale);
    const style: any = options?.nested ? null : boxToPosition({
        scale: scale + "",
        alignItems: props.align ?? "start",
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
    return <div class="flex flex-row gap-2 items-center">
        Align:
        <select
            class="select select-sm" value={layout.align ?? defaultAlign}
            onChange={(e) => {
                const newLayout = structuredClone(layout);
                newLayout.align = e.currentTarget.value as Align;
                onChange(newLayout);
            }}>
            {alignValues.map((v) => {
                return <option value={v}>{v}</option>;
            })}
        </select>
    </div>;
}
