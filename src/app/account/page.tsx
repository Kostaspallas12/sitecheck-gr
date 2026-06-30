import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-server";
import { getUserDoc } from "@/lib/db";
import type { Lang } from "@/lib/i18n";
import { AccountClient } from "./AccountClient";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const lang = ((await cookies()).get("lang")?.value ?? "en") as Lang;
  const userDoc = await getUserDoc(user.email ?? user.uid);

  return (
    <AccountClient
      user={{ uid: user.uid, email: user.email, displayName: user.displayName }}
      paused={userDoc?.paused ?? false}
      weeklyRescan={userDoc?.weeklyRescan ?? false}
      lang={lang}
    />
  );
}
