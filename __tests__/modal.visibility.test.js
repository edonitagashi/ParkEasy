import React from "react";
import { render } from "@testing-library/react-native";
import FadeModal from "../components/animation/FadeModal";

test("FadeModal renders when visible", () => {
  const { toJSON } = render(
    <FadeModal visible={true} onClose={() => {}}><></></FadeModal>
  );
  expect(toJSON()).toBeTruthy();
});
