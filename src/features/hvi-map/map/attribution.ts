export function collapseCompactAttributionControl(container: ParentNode): void {
  const attribution = container.querySelector<HTMLElement>(".maplibregl-ctrl-attrib")
  if (!attribution?.classList.contains("maplibregl-compact")) return

  attribution.classList.remove("maplibregl-compact-show")
  attribution.removeAttribute("open")
}
