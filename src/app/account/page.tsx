import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth-server";
import { getUserDoc } from "@/lib/db";
import { adminAuth } from "@/lib/firebase";
import type { Lang } from "@/lib/i18n";
import { AccountClient } from "./AccountClient";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const lang = ((await cookies()).get("lang")?.value ?? "en") as Lang;

  const [userDoc, userRecord] = await Promise.all([
    getUserDoc(user.email ?? user.uid),
    adminAuth.getUser(user.uid),
  ]);

  const provider = (userRecord.providerData[0]?.providerId ?? "password") as "password" | "google.com";
  const docData = userDoc as (typeof userDoc & { firstName?: string; lastName?: string; photoURL?: string }) | null;

  return (
    <AccountClient
      user={{ uid: user.uid, email: user.email, displayName: user.displayName }}
      provider={provider}
      firstName={docData?.firstName ?? ""}
      lastName={docData?.lastName ?? ""}
      photoURL={docData?.photoURL ?? userRecord.photoURL ?? null}
      paused={userDoc?.paused ?? false}
      weeklyRescan={userDoc?.weeklyRescan ?? false}
      lang={lang}
    />
  );
}