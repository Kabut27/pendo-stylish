"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Namba inayoongezeka taratibu (count-up) badala ya kutokea ghafla - hufanya
 * dashibodi ionekane hai. Nyepesi: haitumii maktaba yoyote ya nje.
 */
export default function CountUp({ value = 0, duration = 700, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number(value) || 0;
    startRef.current = null;

    let raf;
    function step(ts) {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span>
      {prefix}
      {Math.round(display).toLocaleString("sw-TZ")}
      {suffix}
    </span>
  );
}
