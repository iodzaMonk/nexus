import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { getCurrentUser, getUser } from "@/lib/user";
import Link from "next/link";
import ProfilePicturePost from "@/components/Profile/ProfilePicturePost";
import FollowButton from "@/components/Profile/FollowButton";
import MessageButton from "@/components/Profile/MessageButton";
import UserStatusBadge from "@/components/UserStatusBadge";

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
    <div className="p-5 w-full md:w-2/3 lg:w-1/3 rounded-lg flex items-center flex-col">
      <div className="flex gap-5 items-center w-full">
        <ProfilePicturePost
          user={isCurrent}
          profileImage={user?.profileImage}
        />
        <div className="flex flex-col gap-5 items-baseline">
          <div className="flex gap-5 ml-5">
            <div className="flex flex-col gap-1">
              <p className="text-2xl">{user?.username}</p>
              {user && (
                <UserStatusBadge userId={user.id} lastSeen={user.lastSeen} />
              )}
            </div>
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
              <div className="flex gap-5">
                <MessageButton otherUserId={user?.id as string} />
                <FollowButton
                  initialIsFollowing={isFollowing}
                  id={user?.id as string}
                />
              </div>
            )}
          </div>
          <div className=" w-full flex flex-col">
            {user?.name && <p className="font-bold text-xl">{user.name}</p>}
            {user?.bio && (
              <p className="text-gray-400 whitespace-pre-wrap">{user.bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
