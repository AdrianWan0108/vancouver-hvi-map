import mapIcon from "../assets/map_icon.png";

export default function LeftPanelBrand() {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={mapIcon}
        alt="HeatScope Van icon"
        className="size-20 shrink-0 object-contain"
      />
      <div className="min-w-0">
        <h1 className="text-[1.4rem] font-semibold leading-none tracking-[-0.05em] text-foreground">
          <span className="text-[#f26b1d]">Heat</span>
          <span className="text-foreground">Scope Van</span>
        </h1>
      </div>
    </div>
  );
}
