"use client";
import { uploadProfilePicture } from "@/app/actions";
import { User, SquarePen } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import Image from "next/image";

const supabaseStorage = process.env.NEXT_PUBLIC_SUPABASE_STORAGE;

export default function ProfilePicturePost({
  profileImage,
}: {
  profileImage?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function profileInput() {
    inputRef.current?.click();
  }

  async function uploadProfile(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const file = e.target.files[0];

    // Optimistic UI: Show the image immediately
    const optimisticUrl = URL.createObjectURL(file);
    setPreviewUrl(optimisticUrl);
    setPending(true);

    const formData = new FormData();
    formData.append("image", file);

    await uploadProfilePicture(formData);
    setPending(false);
  }

  const currentImage =
    previewUrl || (profileImage ? `${supabaseStorage}${profileImage}` : null);

  return (
    <div>
      <button
        onClick={profileInput}
        disabled={pending}
        className="group relative flex w-25 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-950 aspect-square disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {currentImage ? (
          <Image
            width={1200}
            height={1200}
            src={currentImage}
            alt="Profile"
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              pending ? "opacity-50" : "opacity-100 group-hover:opacity-50"
            }`}
          />
        ) : (
          <User
            size={50}
            className="transition-opacity duration-300 group-hover:opacity-50"
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <SquarePen size={24} className="text-white drop-shadow-md" />
        </div>

        {pending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}

        <input
          ref={inputRef}
          onChange={uploadProfile}
          type="file"
          hidden
          name="profile"
        />
      </button>
    </div>
  );
}
