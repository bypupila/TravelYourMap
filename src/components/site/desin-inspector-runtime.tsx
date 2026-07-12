"use client";

import { useEffect } from "react";
import { initDesinInspector } from "@desin-ai/inspector";
import { getReactSourceInfo } from "@desin-ai/inspector-react";

export function DesinInspectorRuntime({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const inspector = initDesinInspector({
      enabled: true,
      framework: "react",
      sourceResolver: getReactSourceInfo,
    });

    return () => {
      inspector.dispose();
    };
  }, [enabled]);

  return null;
}
