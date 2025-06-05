import { Canvas, useImage } from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS, SharedValue, useSharedValue } from "react-native-reanimated";
import { Point } from "./components/FingerLine";
import FoggyWindow, { FoggyWindowRef } from "./components/FoggyWindow";

const START_DELAY = 1000;
const FADE_DURATION = 2000;

const Main = () => {
  const backgroundImage = useImage(require("./assets/city.jpg"));

  const windowRef = useRef<FoggyWindowRef>(null);

  const lineIndex = useSharedValue(0);
  const [lines, setLines] = useState<SharedValue<Point[]>[]>([]);
  const currentLine = useSharedValue<Point[]>([]);

  useEffect(() => {
    if (!windowRef.current) return;

    windowRef.current.foggify();

    setTimeout(() => {
      windowRef.current.moveCamera();
    }, START_DELAY);
  }, [windowRef, backgroundImage]);

  useEffect(() => {
    // const interval = setInterval(() => {
    //   const now = Date.now();
    //   paths.value = paths.value.filter(
    //     ({ timestamp }) => now - timestamp < FADE_DURATION
    //   );
    // }, 100);
    // return () => clearInterval(interval);
  }, []);

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      currentLine.value = [
        {
          x: e.x,
          y: e.y,
          timestamp: Date.now(),
        },
      ];
    })
    .onUpdate((e) => {
      currentLine.value = [
        ...currentLine.value,
        {
          x: e.x,
          y: e.y,
          timestamp: Date.now(),
        },
      ];
    })
    .onEnd(() => {
      lineIndex.value++;
      runOnJS(setLines)([...lines, currentLine]);
    });

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={styles.container}>
        <FoggyWindow
          ref={windowRef}
          fingerLines={lines}
          currentFingerLine={currentLine}
          backgroundImage={backgroundImage}
        />

        {/* <Rain /> */}
        {/* <Group>
          {lines.map((line, index) => {
            return <Line key={index} line={line} />;
          })}
          <Line line={currentLine} />
        </Group> */}
      </Canvas>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export { Main };
