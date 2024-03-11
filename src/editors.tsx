import { BoxRem, alignValues } from "./types";

const defaultAlign = "start";

export function FieldEditor(props: {
    field: string,
    props: any,
    onChange: (props: any) => void,
    label?: string,
    type?: "string" | "number" | "url",
    default?: any,
}) {
    return <div class="flex flex-row flex-wrap gap-2 items-center">
        {props.label ?? (props.field[0].toUpperCase() + props.field.substring(1))}
        <input type={props.type === "number" ? "number" : "text"}
            class={"input input-bordered input-sm " +
                (props.type === "url" ? "w-96 " : "w-16 ")}
            value={(props.props[props.field] ?? props.default ?? "") + ""}
            onChange={(e) => {
                if (props.type === "number") {
                    const value = Number.parseInt(e.currentTarget.value);
                    if (value) {
                        const newProps: any = structuredClone(props.props);
                        newProps[props.field] = value;
                        props.onChange(newProps);
                    }
                } else {
                    const newProps: any = structuredClone(props.props);
                    newProps[props.field] = e.currentTarget.value;
                    props.onChange(newProps);
                }
            }} />
    </div>;
}

export function BoxRemEditor<T extends BoxRem>(props: {
    component: T,
    onChange: (newProps: T) => void,
}) {
    function updateBox(key: "left" | "top" | "right" | "bottom", value: string) {
        const newComponent = structuredClone(props.component);
        if (value.length >= 0 && Number.parseInt(value) >= 0) {
            newComponent[key] = Number.parseInt(value);
        } else {
            delete newComponent[key];
        }
        props.onChange(newComponent);
    }
    return <div class="join">
        <input type="number" class="input input-bordered input-xs w-16 join-item" value={props.component.left ?? ""}
            onChange={(e) => updateBox("left", e.currentTarget.value)} />
        <input type="number" class="input input-bordered input-xs w-16 join-item" value={props.component.right ?? ""}
            onChange={(e) => updateBox("right", e.currentTarget.value)} />
        <input type="number" class="input input-bordered input-xs w-16 join-item" value={props.component.top ?? ""}
            onChange={(e) => updateBox("top", e.currentTarget.value)} />
        <input type="number" class="input input-bordered input-xs w-16 join-item" value={props.component.bottom ?? ""}
            onChange={(e) => updateBox("bottom", e.currentTarget.value)} />
    </div>;
}

export function AlignSelect<T>(props: {
    component: T,
    field: string,
    onChange: (newProps: T) => void,
}) {
    const { component, field, onChange } = props;
    return <select
        class="select select-sm select-bordered" value={(component as any)[field] ?? defaultAlign}
        onChange={(e) => {
            const newComponent = structuredClone(component);
            (newComponent as any)[field] = e.currentTarget.value;
            onChange(newComponent);
        }}>
        {alignValues.map((v) => {
            return <option value={v}>{v}</option>;
        })}
    </select>;
}
