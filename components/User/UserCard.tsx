import { User } from "@/app/generated/prisma/client";
import Image from "next/image";
import { env } from "process";
import Link from "next/link";

interface UserProps {
  user: User;
}

const SUPABASE_STORAGE = env.NEXT_PUBLIC_SUPABASE_STORAGE;

export default function UserCard({ user }: UserProps) {
  return (
    <Link href={`/profile/${user.username}`}>
      <div className="bg-brand-mid p-2 flex items-center gap-2 hover:bg-brand-mid-hover cursor-pointer border border-transparent hover:border-border rounded-lg transition-all">
        {user.profileImage ? (
          <Image
            className="rounded-full object-cover w-12 h-12"
            src={`${SUPABASE_STORAGE}${user.profileImage}`}
            width={120}
            height={120}
            alt="Profile Image"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-border shrink-0">
            <span className="text-lg font-bold text-muted-foreground uppercase">
              {user.username[0]}
            </span>
          </div>
        )}
        <p className="font-bold text-foreground">@{user.username}</p>
      </div>
    </Link>
  );
}
