import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Ingia — Pendo Stylish" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
