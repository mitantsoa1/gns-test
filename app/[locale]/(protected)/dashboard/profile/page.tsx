import { getUser } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/auth/profile-form";
import AppLayout from "@/components/layouts/app-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Profile',
};
export default async function ProfilePage() {
  const user = await getUser();
  // const t = await getTranslations("ProfilePage"); // This is now handled in the form

  if (!user) {
    redirect("/login");
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-10">
        <ProfileForm user={user} />
      </div>
    </AppLayout>
  );
}
