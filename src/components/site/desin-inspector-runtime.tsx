"use client";

import { useEffect } from "react";

export function DesinInspectorRuntime({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let disposed = false;
    let inspector: { dispose(): void } | undefined;

    void import("@design-bypupila/inspector").then(({ initDesinInspector }) => {
      if (disposed) {
        return;
      }

      inspector = initDesinInspector({ enabled: true, framework: "react" });
    });

    return () => {
      disposed = true;
      inspector?.dispose();
    };
  }, [enabled]);

  return null;
}
