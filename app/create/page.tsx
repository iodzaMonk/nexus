"use client";
import { ChangeEvent, useState, FormEvent } from "react";
import { uploadPost } from "../actions";
import { ImagePlus } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function CreatePost() {
  const [imageURL, setImageURL] = useState("");
  const [loading, setLoading] = useState(false);

  function loadImage(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return Error("No image was uploaded");
    const url = URL.createObjectURL(e.target.files[0]);
    setImageURL(url);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    await uploadPost(formData);

    redirect("/");
  }
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-brand-mid p-8 shadow-2xl backdrop-blur-sm">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-white">
          Create Post
        </h1>

        <form onSubmit={submit} className="flex flex-col gap-6">
          {/* Image Upload Area */}
          <div className="group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-black/20 transition-all hover:border-brand-hlg hover:bg-black/30">
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={loadImage}
              required
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            {imageURL ? (
              <Image
                src={imageURL}
                width={1200}
                height={1200}
                alt="Preview Image"
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/50 transition-colors group-hover:text-brand-hlg">
                <ImagePlus size={48} />
                <span className="text-sm font-medium">Select an image</span>
              </div>
            )}
          </div>

          {/* Caption Input */}
          <div className="space-y-2">
            <label
              htmlFor="caption"
              className="text-sm font-medium text-white/70"
            >
              Caption
            </label>
            <input
              type="text"
              name="caption"
              placeholder="What's on your mind?"
              className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white placeholder-white/40 outline-none transition-all focus:border-brand-hlg focus:ring-1 focus:ring-brand-hlg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-brand-hlg py-3 font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-brand-hlg/90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="h-5 aspect-square animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Share Post"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
