import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

// Middleware tayari inazuia njia hii kwa asiye admin, lakini tunathibitisha
// tena hapa (defense in depth) kwa sababu Server Components zinaweza kupakiwa
// kwa njia tofauti na route matching ya middleware.
export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashibodi/admin");
  if (user.role !== "admin") redirect("/dashibodi/mfanyakazi");

  return (
    <div className="dash-shell">
      <AdminSidebar />
      <main className="dash-main">{children}</main>
    </div>
  );
}
