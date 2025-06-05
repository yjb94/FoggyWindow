import { Group, Line, vec } from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

export type RainDropProps = {
  defaultX: number;
  defaultY: number;
  width: number;
  length: number;
  speed: number;
  slope: number;
};

const RainDrop = ({
  defaultX,
  defaultY,
  length,
  width,
  speed,
  slope,
}: RainDropProps) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const dropX = useSharedValue(defaultX);
  const dropY = useSharedValue(defaultY);
  const isSettled = useSharedValue(false);

  const animatedY = useDerivedValue(() => {
    if (isSettled.value) return dropY.value;

    const nextY = dropY.value + speed / 100;
    const nextX = dropX.value + (speed / 100) * slope;

    // reset drop
    if (nextY >= windowHeight) {
      isSettled.value = true;
      dropY.value = 0;
      dropX.value =
        Math.random() * (windowWidth + Math.abs(slope) * windowHeight);
      isSettled.value = false;
      return dropY.value;
    }

    dropY.value = nextY;
    dropX.value = nextX;
    return dropY.value;
  });

  const animatedX = useDerivedValue(() => {
    return dropX.value;
  });

  const p1 = useDerivedValue(() => vec(animatedX.value, animatedY.value));
  const p2 = useDerivedValue(() => {
    const endX = animatedX.value + length * slope;
    const endY = animatedY.value + length;
    return vec(endX, endY);
  });

  return (
    <Group>
      <Line
        p1={p1}
        p2={p2}
        color="rgba(255, 255, 255, 0.5)"
        strokeWidth={width}
      />
    </Group>
  );
};

export default RainDrop;
