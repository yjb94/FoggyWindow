import {
  Blur,
  Canvas,
  Group,
  Image,
  Skia,
  useCanvasRef,
  useImage,
} from "@shopify/react-native-skia";
import React, { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Easing,
  runOnJS,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const IMAGE_WIDTH = 3500;
const IMAGE_HEIGHT = 1500;
const PADDING = 30;

const START_DELAY = 1000;

const Main = () => {
  const { width, height } = useWindowDimensions();
  const fogBlurValue = useSharedValue(0);
  const [fogPath, setFogPath] = useState(Skia.Path.Make());
  const canvasRef = useCanvasRef();
  const backgroundImage = useImage(require("./assets/night.jpg"));
  const xValue = useSharedValue(0);

  const scale = Math.max(
    width / IMAGE_WIDTH,
    (height + PADDING * 2) / IMAGE_HEIGHT
  );

  const scaledWidth = IMAGE_WIDTH * scale;
  const scaledHeight = IMAGE_HEIGHT * scale;

  const secondImageX = useSharedValue(scaledWidth);

  useEffect(() => {
    fogBlurValue.value = withTiming(10, { duration: 10000 });

    const animate = () => {
      xValue.value = 0;
      secondImageX.value = scaledWidth;

      xValue.value = withTiming(-(scaledWidth - width - PADDING), {
        duration: 10000,
        easing: Easing.linear,
      });

      secondImageX.value = withTiming(
        -(scaledWidth - width - PADDING) + scaledWidth,
        {
          duration: 10000,
          easing: Easing.linear,
        },
        (finished) => {
          if (finished) {
            runOnJS(animate)();
          }
        }
      );
    };

    setTimeout(() => {
      animate();
    }, START_DELAY);
  }, [width]);

  const clearFogAtPoint = (x: number, y: number) => {
    const path = Skia.Path.Make();
    path.addCircle(x, y, 40);
    setFogPath((prevPath) => {
      const newPath = Skia.Path.Make();
      newPath.addPath(prevPath);
      newPath.addPath(path);
      return newPath;
    });
  };

  const gesture = Gesture.Pan().onUpdate((e) => {
    runOnJS(clearFogAtPoint)(e.x, e.y);
  });

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }} ref={canvasRef}>
        {backgroundImage && (
          <Group>
            <Image
              image={backgroundImage}
              fit="cover"
              x={xValue}
              y={-PADDING}
              width={scaledWidth}
              height={scaledHeight}
            >
              <Blur blur={fogBlurValue} />
            </Image>

            <Image
              image={backgroundImage}
              fit="cover"
              x={secondImageX}
              y={-PADDING}
              width={scaledWidth}
              height={scaledHeight}
            >
              <Blur blur={fogBlurValue} />
            </Image>
            <Group clip={fogPath}>
              <Image
                image={backgroundImage}
                fit="cover"
                x={xValue}
                y={-PADDING}
                width={scaledWidth}
                height={scaledHeight}
              />
              <Image
                image={backgroundImage}
                fit="cover"
                x={secondImageX}
                y={-PADDING}
                width={scaledWidth}
                height={scaledHeight}
              />
            </Group>
          </Group>
        )}
      </Canvas>
    </GestureDetector>
  );
};

export { Main };
