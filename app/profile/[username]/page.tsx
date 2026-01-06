import { Button } from "@/components/ui/button";
import { logout } from "../../actions";
import { getCurrentUser, getUser } from "@/lib/user";
import Link from "next/link";
import ProfilePicturePost from "@/components/Profile/ProfilePicturePost";
import FollowButton from "@/components/Profile/FollowButton";

export default async function Profile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const currentUser = await getCurrentUser();
  const user = await getUser(username, currentUser?.id);
  const isCurrent = currentUser?.username === user?.username;
  const isFollowing = (user?.followers?.length ?? 0) > 0;

  return (
    <div className="p-5 w-1/3 rounded-lg flex items-center flex-col">
      <div className="flex gap-5 items-center w-full">
        <ProfilePicturePost profileImage={user?.profileImage} />
        <p className="text-2xl">{user?.username}</p>
        {isCurrent ? (
          <div className="flex gap-5">
            <Link href={"/profile/edit"}>
              <Button className="bg-gray-700 hover:bg-gray-600 text-white font-bold">
                Edit
              </Button>
            </Link>
            <form action={logout}>
              <Button className="bg-red-500 text-white font-bold hover:bg-red-400 cursor-pointer">
                Logout
              </Button>
            </form>
          </div>
        ) : (
          <FollowButton
            initialIsFollowing={isFollowing}
            id={user?.id as string}
          />
        )}
      </div>
    </div>
  );
}
