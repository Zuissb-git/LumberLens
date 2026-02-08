import { Suspense } from "react";
import { SignInForm } from "./signin-form";

export const metadata = {
  title: "Sign In — LumberLens",
};

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
