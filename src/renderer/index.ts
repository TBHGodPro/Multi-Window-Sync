function connect(x: number, y: number, div: HTMLElement) {
  // distance
  const length = Math.sqrt(x * x + y * y);

  // center
  const cx = x / 2 - length / 2;
  const cy = y / 2;

  // angle
  const angle = Math.atan2(-y, -x) * (180 / Math.PI);

  // adjust style
  div.style.left = cx + 'px';
  div.style.top = cy + 'px';
  div.style.width = length + 'px';
  div.style.transform = 'rotate(' + angle + 'deg)';
}

let pos: { x: number; y: number } = { x: 0, y: 0 };

const positions: Map<
  number,
  {
    pos: { x: number; y: number };
    el: HTMLElement;
  }
> = new Map();

window.ipc.onPosition((id, winPos) => {
  let div: HTMLElement;
  if (!positions.has(id)) {
    div = document.createElement('div');
    div.className = 'line';
    document.body.appendChild(div);
    positions.set(id, {
      pos: winPos,
      el: div,
    });
  } else {
    const win = positions.get(id);
    div = win.el;
    win.pos = winPos;
  }

  connect(winPos.x - pos.x, winPos.y - pos.y, div);
});

window.ipc.onRemove(id => {
  positions.get(id)?.el?.remove();
  positions.delete(id);
});

window.electronWindow.onMove(newPos => {
  pos = newPos;

  positions.forEach(win => {
    connect(win.pos.x - pos.x, win.pos.y - pos.y, win.el);
  });
});

setInterval(() => {
  const newPos = window.electronWindow.getPosition();

  if (pos.x !== newPos.x || pos.y !== newPos.y) {
    pos = newPos;
    window.electronWindow.update(pos);
  }
});
