"use client";
import { getOrCreateConversation } from "@/app/actions/chat";
import { Button } from "../ui/button";
import { redirect } from "next/navigation";

export default function MessageButton({
  otherUserId,
}: {
  otherUserId: string;
}) {
  async function submit() {
    await getOrCreateConversation(otherUserId);
    redirect("/messages");
  }
  return (
    <div>
      <Button onClick={submit}>Message</Button>
    </div>
  );
}
