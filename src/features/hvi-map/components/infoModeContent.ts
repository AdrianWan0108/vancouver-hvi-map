import type { ZoomMode } from "../types/data";

export interface InfoGuideStep {
  title: string;
  description: string;
}

export interface InfoGuideContent {
  heading: string;
  intro: string;
  steps: [InfoGuideStep, InfoGuideStep, InfoGuideStep];
}

export function getInfoGuideContent(zoomMode: ZoomMode): InfoGuideContent {
  if (zoomMode === "region") {
    return {
      heading: "How to explore",
      intro: "Start from the regional view, then move into DA-level detail when you want a closer look.",
      steps: [
        {
          title: "Find a location",
          description:
            "Search for a region, DAUID, place, or address, or start from the regional map view.",
        },
        {
          title: "Move from region to detail",
          description:
            "Hover regions to preview summaries, click to keep one selected, or zoom in to enter DA view.",
        },
        {
          title: "Understand what you see",
          description:
            "Use the color scale and \"How HVI is built\" to interpret mapped heat-vulnerability patterns.",
        },
      ],
    };
  }

  return {
    heading: "How to explore",
    intro: "Use the map and panel together to inspect local heat-vulnerability patterns in more detail.",
    steps: [
      {
        title: "Inspect a DA",
        description:
          "Hover a DA to preview its summary, then click to keep it selected while exploring nearby areas.",
      },
      {
        title: "Compare layers and filters",
        description:
          "Switch layers, adjust filters, and use the legend to compare HVI, components, and indicators.",
      },
      {
        title: "Read the score",
        description:
          "Open component details and \"How HVI is built\" to see how Exposure, Sensitivity, and Adaptive Capacity shape each DA.",
      },
    ],
  };
}
