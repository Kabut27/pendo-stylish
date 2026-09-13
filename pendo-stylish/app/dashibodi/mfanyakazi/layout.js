import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import StaffSidebar from "@/components/StaffSidebar";

export default async function StaffLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashibodi/mfanyakazi");
  if (user.role !== "staff" && user.role !== "admin") redirect("/login");

  return (
    <div className="dash-shell">
      <StaffSidebar fullName={user.full_name} />
      <main className="dash-main">{children}</main>
    </div>
  );
}
