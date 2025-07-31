import { useMemo } from "react";

// Code borrowed from https://stackoverflow.com/questions/13382516/getting-scroll-bar-width-using-javascript/13382873#13382873
export const useScrollbarWidth = (): number => {
  const scrollbarWidth = useMemo(() => {
    // Creating invisible container
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.overflow = "scroll"; // Force scrollbar to appear
    document.body.appendChild(outer);

    // Measure inner element
    const inner = document.createElement("div");
    outer.appendChild(inner);

    // Calculate difference between container's full width and the child's width
    const width = outer.offsetWidth - inner.offsetWidth;

    // Remove temporary elements from the DOM
    outer.parentNode?.removeChild(outer);

    return width;
  }, []);

  return scrollbarWidth;
};
