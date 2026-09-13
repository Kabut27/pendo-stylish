import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashibodiIndex() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect(user.role === "admin" ? "/dashibodi/admin" : "/dashibodi/mfanyakazi");
}
