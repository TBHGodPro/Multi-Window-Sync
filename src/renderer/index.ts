const lineColor = 'green';
const lineThickness = 5;

function connect(x: number, y: number, div: HTMLElement) {
  // distance
  const length = Math.sqrt(x * x + y * y);

  // center
  const cx = x / 2 - length / 2;
  const cy = y / 2 - lineThickness / 2;

  // angle
  const angle = Math.atan2(-y, -x) * (180 / Math.PI);

  // adjust style
  div.style.left = cx + 'px';
  div.style.top = cy + 'px';
  div.style.width = length + 'px';
  div.style.transform = 'rotate(' + angle + 'deg)';
}

(async () => {
  let x = 0;
  let y = 0;

  const positions: Map<number, HTMLElement> = new Map();

  window.ipc.onPosition((id, winPos) => {
    let div: HTMLElement;
    if (!positions.has(id)) {
      div = document.createElement('div');
      div.className = 'line';
      document.body.appendChild(div);
      positions.set(id, div);
    } else div = positions.get(id);

    const pos = window.electronWindow.getPosition();
    const size = window.electronWindow.getSize();

    x = pos[0] + size[0] / 2;
    y = pos[1] + size[1] / 2;

    connect(winPos.x - x, winPos.y - y, div);
  });

  window.ipc.onRemove(id => {
    positions.get(id)?.remove();
    positions.delete(id);
  });

  while (true) {
    await new Promise(res => setTimeout(res, 0));

    const pos = window.electronWindow.getPosition();
    const size = window.electronWindow.getSize();

    x = pos[0] + size[0] / 2;
    y = pos[1] + size[1] / 2;

    window.ipc.sendPos({ x, y });
  }
})();
