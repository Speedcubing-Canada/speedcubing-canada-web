import { useState, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export const useBodyScrollable = () => {
  const [isScrollable, setIsScrollable] = useState(false);
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const checkScrollable = () => {
      const scrollable = document.body.scrollHeight > window.innerHeight;
      setIsScrollable(scrollable);
    };

    checkScrollable();
    window.addEventListener("resize", checkScrollable);

    return () => window.removeEventListener("resize", checkScrollable);
  }, [pathname]);

  return isScrollable;
};
