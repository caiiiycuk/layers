export type EdgeMatrixProps = {
    tag: "edge-matrix",
    size: number,
    rows: {
        action: number[],
    }[],
};

export function EdgeMatrix(props: EdgeMatrixProps) {
    return <div class="absolute bg-red-100 left-0 top-0 right-0 bottom-0 pointer-events-none">
        {JSON.stringify(props, null, 2)}
    </div>;
}

export function EdgeMatrixEditor(props: {
    control: EdgeMatrixProps,
    onChange: (props: EdgeMatrixProps) => void,
}) {
    const { control, onChange } = props;
    return <div class="flex flex-col gap-2">
        <div>
            Size:&nbsp;<input class="input input-sm input-bordered w-12"
                value={control.size}
                onChange={(e) => {
                    const newSize = Number.parseInt(e.currentTarget.value);
                    if (newSize) {
                        const newControl = structuredClone(control);
                        newControl.size = newSize;
                        onChange(newControl);
                    }
                }}></input>
        </div>
        <div class="flex flex-col gap-2">
            {control.rows.map((r, i) => {
                return <div class="flex flex-row gap-2 items-center">
                    <p>Actions:</p>
                    <div class="join">
                        <button class="btn btn-sm join-item" onClick={() => {
                            const newControl = structuredClone(control);
                            newControl.rows[i].action.push(0);
                            onChange(newControl);
                        }}>Add</button>
                        {r.action.length > 0 && <button class="btn btn-sm join-item" onClick={() => {
                            const newControl = structuredClone(control);
                            newControl.rows[i].action.pop();
                            onChange(newControl);
                        }}>Delete</button>}
                    </div>
                    {r.action.map((a) => {
                        return <input class="input input-sm input-bordered w-12" value={a} />;
                    })}
                </div>;
            })}
        </div>
        <button class="btn btn-sm join-item" onClick={() => {
            const newControl = structuredClone(control);
            newControl.rows.push({ action: [] });
            onChange(newControl);
        }}>Add row</button>
    </div>;
}
