import { usePathValue } from "@shopify/react-native-skia";
import { SharedValue } from "react-native-reanimated";
import { Point } from "../components/FingerLine";

export const useFingerLine = (line: SharedValue<Point[]>) => {
  return usePathValue((path) => {
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
};
