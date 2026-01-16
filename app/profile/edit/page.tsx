import { getCurrentUser } from "@/lib/user";
import EditProfileForm from "@/components/Profile/EditProfileForm";
import { redirect } from "next/navigation";

export default async function EditProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
      <div className="w-full bg-white dark:bg-zinc-900 rounded-lg shadow p-6 border dark:border-zinc-800">
        <EditProfileForm
          user={{
            username: user.username,
            name: user.name,
            bio: user.bio, // Now this should be valid TS because we updated type via query? Actually prisma client type might need regeneration if not automated
            email: user.email,
          }}
        />
      </div>
    </div>
  );
}
