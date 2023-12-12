interface NippleHandler {
    nippleStart: (x: number, y: number) => void,
    nippleUpdate: (x: number, y: number, maxDistance?: number) => void,
    nippleEnd: () => void,
}

interface Position {
    x: number;
    y: number;
}

export function createNippleHandler(
    nipple: HTMLDivElement,
    sensor: HTMLDivElement,
    onUpdate: (active: boolean, angle: number, distance: number) => void,
): NippleHandler {
    const { left, top, width, height } = sensor.getBoundingClientRect();
    const size = Math.max(width, height);
    let nippleSize: number = 0;
    const center = {
        x: left + width / 2,
        y: top + height / 2,
    };
    let sensorPos = { ...center };

    function updateSensor(pos: Position) {
        sensor.style.left = (pos.x - width / 2) + "px";
        sensor.style.top = (pos.y - height / 2) + "px";
    }

    updateSensor(sensorPos);

    function nippleStart(x: number, y: number) {
        sensorPos = { x, y };
        nipple.classList.remove("hidden");
        const { width, height } = nipple.getBoundingClientRect();
        nippleSize = Math.max(width, height);
        updateSensor(sensorPos);
        nippleUpdate(x, y);
    }

    function nippleUpdate(x: number, y: number, maxDistance?: number) {
        const pos = { x, y };
        const nippleAngle = angle(sensorPos, pos);
        const nippleDistance = Math.min(maxDistance ?? size, distance(sensorPos, pos));
        const normalizedAngle = nippleAngle < 0 ? -nippleAngle : Math.PI * 2 - nippleAngle;
        nipple.style.left = (sensorPos.x + Math.cos(nippleAngle) * nippleDistance - nippleSize / 2) + "px";
        nipple.style.top = (sensorPos.y + Math.sin(nippleAngle) * nippleDistance - nippleSize / 2) + "px";
        const topAngle = Math.PI * 2 - normalizedAngle + Math.PI / 2;
        onUpdate(true, topAngle > Math.PI * 2 ? topAngle - Math.PI * 2 : topAngle, nippleDistance / size);
    }

    function nippleEnd() {
        nipple.classList.add("hidden");
        sensorPos = { ...center };
        updateSensor(sensorPos);
        onUpdate(false, 0, 0);
    }

    return {
        nippleStart,
        nippleUpdate,
        nippleEnd,
    };
}

function angle(p1: Position, p2: Position) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    return Math.atan2(dy, dx);
}

function distance(p1: Position, p2: Position) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    return Math.sqrt((dx * dx) + (dy * dy));
}
