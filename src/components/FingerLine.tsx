import { Path, usePathValue } from "@shopify/react-native-skia";
import { PropsWithChildren } from "react";
import { SharedValue } from "react-native-reanimated";

export type Point = {
  x: number;
  y: number;
  timestamp: number;
};

type FingerLineProps = PropsWithChildren<{
  line: SharedValue<Point[]>;
}>;

const FingerLine = ({ line, children }: FingerLineProps) => {
  const path = usePathValue((path) => {
    "worklet";
    if (line.value.length > 0) {
      path.moveTo(line.value[0].x, line.value[0].y);
      for (let i = 1; i < line.value.length; i++) {
        path.lineTo(line.value[i].x, line.value[i].y);
        path.moveTo(line.value[i].x, line.value[i].y);
      }
    }

    return path;
  });

  return (
    <Path
      path={path}
      strokeWidth={80}
      style="stroke"
      strokeCap="round"
      strokeJoin="round"
      color="black"
    >
      {children}
    </Path>
  );
};

export default FingerLine;
