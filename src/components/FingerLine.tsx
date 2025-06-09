import { Path, usePathValue } from "@shopify/react-native-skia";
import { PropsWithChildren, useState } from "react";
import {
  Easing,
  interpolate,
  runOnJS,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useEffectOnce } from "../hooks/useEffectOnce";

export type Point = {
  x: number;
  y: number;
  timestamp: number;
};

type FingerLineProps = PropsWithChildren<{
  line: SharedValue<Point[]>;
  shouldFadeOut?: boolean;
  onFadeOut?: () => void;
}>;

const FADE_OUT_DURATION = 5000;
const FADE_OUT_DELAY = 1000;

const FingerLine = ({
  line,
  children,
  shouldFadeOut = true,
}: FingerLineProps) => {
  const [isFadedOut, setIsFadedOut] = useState(false);

  const fadeOut = useSharedValue(1);

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

  useEffectOnce(() => {
    if (!shouldFadeOut) return;

    setTimeout(() => {
      fadeOut.value = withTiming(
        0,
        {
          duration: FADE_OUT_DURATION,
          easing: Easing.inOut(Easing.ease),
        },
        (finished) => {
          if (finished) {
            runOnJS(setIsFadedOut)(true);
          }
        }
      );
    }, FADE_OUT_DELAY);
  });

  const strokeWidth = useDerivedValue(() => {
    return interpolate(fadeOut.value, [1, 0], [80, 0]);
  });

  if (isFadedOut) return null;

  return (
    <Path
      path={path}
      strokeWidth={strokeWidth}
      style="stroke"
      strokeCap="round"
      strokeJoin="round"
    >
      {children}
    </Path>
  );
};

export default FingerLine;
