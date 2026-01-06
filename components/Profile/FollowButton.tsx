"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { toggleFollow } from "@/app/actions";

export default function FollowButton({
  initialIsFollowing,
  id,
}: {
  initialIsFollowing: boolean;
  id: string;
}) {
  const [isFollowing, setisFollowing] = useState(initialIsFollowing);

  async function follow() {
    const newFollow = !isFollowing;
    setisFollowing(newFollow);
    await toggleFollow(id);
  }

  return (
    <div>
      <Button
        className={`${
          isFollowing
            ? "bg-brand-mid hover:bg-brand-mid-hover"
            : "bg-brand-hlg hover:bg-brand-hlg/80"
        } font-bold text-white `}
        onClick={follow}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
    </div>
  );
}
