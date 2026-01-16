"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // assuming you have this or will use standard textarea
import { updateUser } from "@/app/actions/user";

interface EditProfileFormProps {
  user: {
    name: string | null;
    username: string;
    bio: string | null;
    email: string;
  };
}

const initialState = {
  message: "",
  errors: {} as Record<string, string[]>,
};

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateUser, initialState);

  return (
    <form action={formAction} className="space-y-6 w-full max-w-md">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          defaultValue={user.username}
          required
        />
        {state?.errors?.username && (
          <p className="text-red-500 text-sm">
            {state.errors.username.join(", ")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={user.name || ""}
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={user.bio || ""}
          placeholder="Tell us about yourself"
          className="resize-none h-24"
        />
      </div>

      {state?.message && (
        <p className="text-sm font-medium text-green-600">{state.message}</p>
      )}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
