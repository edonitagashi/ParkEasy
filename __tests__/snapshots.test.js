import React from "react";
import renderer, { act } from "react-test-renderer";

// Mock Animated vetëm për këtë test file (pa prekur react-native globalisht)
jest.mock("react-native/Libraries/Animated/Animated", () => {
  const ActualAnimated = jest.requireActual("react-native/Libraries/Animated/Animated");
  return {
    ...ActualAnimated,
    timing: () => ({ start: (cb) => cb && cb() }),
    spring: () => ({ start: (cb) => cb && cb() }),
  };
});

import FadeModal from "../components/animation/FadeModal";

test("FadeModal snapshot", () => {
  let tree;
  act(() => {
    tree = renderer.create(
      <FadeModal visible={true} onClose={() => {}}>
        <></>
      </FadeModal>
    );
  });
  expect(tree.toJSON()).toMatchSnapshot();
});
