"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        router.push(`/search?q=${query}`);
      } else {
        router.push(`/search`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, router]);

  return (
    <div>
      <Input
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
