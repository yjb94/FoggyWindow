import { Canvas, Skia } from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import Window, { WindowRef } from "./Window";

const START_DELAY = 1000;

const Main = () => {
  const windowRef = useRef<WindowRef>(null);

  const [isReady, setIsReady] = useState(false);

  const [fogPath, setFogPath] = useState(Skia.Path.Make());

  useEffect(() => {
    if (!windowRef.current) return;

    windowRef.current.foggify();

    setTimeout(() => {
      windowRef.current.moveCamera();
    }, START_DELAY);
  }, [isReady]);

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
      <Canvas style={styles.container}>
        <Window
          ref={windowRef}
          fogPath={fogPath}
          onReady={() => {
            setIsReady(true);
          }}
        />
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
