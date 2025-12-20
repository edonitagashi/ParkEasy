import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import LoginScreen from "../app/(auth)/LoginScreen";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc } from "firebase/firestore";

jest.mock("../components/GoogleAuthButton", () => () => null);

// Thjeshto AnimatedTouchable për test (pa reanimated)
jest.mock("../components/animation/AnimatedTouchable", () => {
  const React = require("react");
  const { Pressable } = require("react-native");
  return ({ onPress, disabled, children, style }) => (
    <Pressable onPress={onPress} disabled={disabled} style={style}>
      {children}
    </Pressable>
  );
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

const pressLoginButton = (getAllByText) => {
  fireEvent.press(getAllByText("Login")[1]); // titulli + butoni
};

test("error when fields empty", async () => {
  const { getAllByText } = render(<LoginScreen />);
  pressLoginButton(getAllByText);

  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalled();
  });
});

test("blocks invalid email", async () => {
  const { getByPlaceholderText, getAllByText } = render(<LoginScreen />);
  fireEvent.changeText(getByPlaceholderText("Email"), "bad");
  fireEvent.changeText(getByPlaceholderText("Password"), "Password1");
  pressLoginButton(getAllByText);

  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalled();
  });
});

test("calls firebase on valid login", async () => {
  signInWithEmailAndPassword.mockResolvedValue({ user: { uid: "u1" } });
  getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: "user" }) });

  const { getByPlaceholderText, getAllByText } = render(<LoginScreen />);
  fireEvent.changeText(getByPlaceholderText("Email"), "a@b.com");
  fireEvent.changeText(getByPlaceholderText("Password"), "Password1");
  pressLoginButton(getAllByText);

  await waitFor(() => {
    expect(signInWithEmailAndPassword).toHaveBeenCalled();
  });
});
