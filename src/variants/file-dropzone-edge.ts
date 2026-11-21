/** Local edge measurement. Probes share the same inherited CSS roles as the drawn edge.
 * Attribute writes do not change any observed box. No ancestor observer or perpetual frame loop. */
export function observeFileDropzoneEdge(zone: HTMLElement, edge: SVGRectElement, probes: HTMLElement[], platform = {
  style: (node: Element) => getComputedStyle(node),
  resize: (callback: ResizeObserverCallback) => typeof ResizeObserver === "undefined" ? { observe: (_node: Element, _options?: ResizeObserverOptions) => {}, disconnect: () => {} } : new ResizeObserver(callback),
  request: (callback: FrameRequestCallback) => requestAnimationFrame(callback),
  cancel: (frame: number) => cancelAnimationFrame(frame),
}) {
  let alive = true, frame: number | null = null;
  const running = new Set<string>();
  const fit = () => {
    if (!alive) return;
    const edgeStyle = platform.style(edge), zoneStyle = platform.style(zone);
    const stroke = Number.parseFloat(edgeStyle.strokeWidth);
    const dashes = edgeStyle.strokeDasharray.split(/[ ,]+/).map(Number.parseFloat);
    const period = dashes.reduce((sum, value) => sum + value, 0) * (dashes.length % 2 ? 2 : 1);
    const width = zone.offsetWidth - stroke, height = zone.offsetHeight - stroke;
    const radius = Math.max(0, Math.min(Number.parseFloat(zoneStyle.borderTopLeftRadius) - stroke / 2, width / 2, height / 2));
    if (![stroke, period, width, height, radius].every(Number.isFinite) || stroke <= 0 || period <= 0 || width <= 0 || height <= 0 || dashes.some(value => !Number.isFinite(value) || value < 0)) return;
    const perimeter = 2 * (width + height) - 8 * radius + 2 * Math.PI * radius;
    const pathLength = Math.max(8, Math.round(perimeter / period)) * period;
    if (!Number.isFinite(pathLength) || pathLength <= 0) return;
    edge.setAttribute('rx', String(radius));
    edge.setAttribute('pathLength', String(pathLength));
  };
  const tick = () => { frame = null; if (!alive) return; fit(); if (running.size) schedule(); };
  const schedule = () => { if (alive && frame === null) frame = platform.request(tick); };
  const key = (event: Event) => {
    const e = event as TransitionEvent;
    if (e.target === zone && e.propertyName.includes('radius')) return 'zone:' + e.propertyName;
    if (e.target === edge && ['stroke-dasharray', 'stroke-width'].includes(e.propertyName)) return 'edge:' + e.propertyName;
    return null;
  };
  const start = (event: Event) => { const id = key(event); if (alive && id) { running.add(id); schedule(); } };
  const stop = (event: Event) => { const id = key(event); if (alive && id) { running.delete(id); schedule(); } };
  const observer = platform.resize(() => schedule());
  for (const node of [zone, ...probes]) observer.observe(node, { box: 'border-box' });
  for (const node of [zone, edge]) { node.addEventListener('transitionrun', start); node.addEventListener('transitionend', stop); node.addEventListener('transitioncancel', stop); }
  fit();
  return () => {
    alive = false; running.clear(); observer.disconnect();
    if (frame !== null) platform.cancel(frame); frame = null;
    for (const node of [zone, edge]) { node.removeEventListener('transitionrun', start); node.removeEventListener('transitionend', stop); node.removeEventListener('transitioncancel', stop); }
  };
}
