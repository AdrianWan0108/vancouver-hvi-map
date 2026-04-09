import starLogo from "../assets/star-logo-v5.png";

export default function LeftPanelLabLogo() {
  return (
    <img
      src={starLogo}
      alt="STAR research lab logo"
      className="h-auto max-h-16 w-full max-w-[7rem] object-contain"
      loading="lazy"
    />
  );
}
