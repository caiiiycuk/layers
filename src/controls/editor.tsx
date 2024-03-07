
export function FieldEditor(props: {
    field: string,
    props: any,
    onChange: (props: any) => void,
    label?: string,
    type?: "string" | "number",
    default?: any,
}) {
    return <div class="flex flex-row gap-2 items-center">
        {props.label ?? (props.field[0].toUpperCase() + props.field.substring(1))}
        <input class="input input-bordered w-16 input-sm"
            value={(props.props[props.field] ?? props.default) + ""}
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