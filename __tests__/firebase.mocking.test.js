import { signInWithEmailAndPassword } from "firebase/auth";

test("firebase auth is mocked", async () => {
  signInWithEmailAndPassword.mockResolvedValue({ user: { uid: "x" } });
  const res = await signInWithEmailAndPassword({}, "a@b.com", "Password1");
  expect(res.user.uid).toBe("x");
});
