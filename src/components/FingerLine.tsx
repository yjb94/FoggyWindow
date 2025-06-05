import { Path, usePathValue } from "@shopify/react-native-skia";
import { PropsWithChildren } from "react";
import {
  SharedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useEffectOnce } from "../hooks/useEffectOnce";

export type Point = {
  x: number;
  y: number;
  timestamp: number;
};

const FADE_DURATION = 10000;

type FingerLineProps = PropsWithChildren<{
  line: SharedValue<Point[]>;
  shouldFade?: boolean;
}>;

const FingerLine = ({ line, shouldFade = true, children }: FingerLineProps) => {
  const path = usePathValue((path) => {
    "worklet";
    if (line.value.length === 0) return path;

    let isFirstPoint = true;
    for (let i = 0; i < line.value.length; i++) {
      const point = line.value[i];
      if (isFirstPoint) {
        path.moveTo(point.x, point.y);
        isFirstPoint = false;
      } else {
        path.lineTo(point.x, point.y);
        path.moveTo(point.x, point.y);
      }
    }

    return path;
  });

  const opacity = useSharedValue(1);

  useEffectOnce(() => {
    if (!shouldFade) return;

    opacity.value = withTiming(0, {
      duration: FADE_DURATION,
    });
  });

  return (
    <Path
      path={path}
      strokeWidth={80}
      style="stroke"
      strokeCap="round"
      strokeJoin="round"
      color="black"
      opacity={opacity}
    >
      {children}
    </Path>
  );
};

export default FingerLine;
