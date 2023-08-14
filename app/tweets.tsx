"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Likes from "./likes";
import { useEffect, experimental_useOptimistic as useOptimistic } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const LAST_ELEMENT = 0;

export default function Tweets({ tweets }: { tweets: TweetWithAuthor[] }) {
  const router = useRouter();
  const [optimisticTweets, addOptimisticTweet] = useOptimistic<
    TweetWithAuthor[],
    TweetWithAuthor
  >(tweets, (currentOptimisticTweets, newTweet) => {
    const newOptimisticTweets = [...currentOptimisticTweets];
    const index = newOptimisticTweets.findIndex(
      (tweet) => tweet.id === newTweet.id
    );
    newOptimisticTweets[index] = newTweet;
    return newOptimisticTweets;
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    const channel = supabase
      .channel("realtime tweets")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tweets",
        },
        (payload) => {
          router.refresh();
          console.log(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  return optimisticTweets.map((tweet, idx) => (
    <div
      key={tweet.id}
      className={`flex gap-4 p-4  ${
        idx !== LAST_ELEMENT ? "border-b border-b-gray-800" : ""
      }`}
    >
      <Image
        src={tweet.author.avatar_url}
        alt="author"
        className="rounded-full h-fit select-none"
        draggable="false"
        width={40}
        height={40}
      />

      <div>
        <div className="flex gap-2 items-center h-fit">
          <p className="font-bold line-clamp-1">{tweet.author.name}</p>
          <p className="font-extralight text-sm ">@{tweet.author.username}</p>
        </div>

        <div>
          <p>Title: {tweet.title}</p>
          <Likes tweet={tweet} addOptimisticTweet={addOptimisticTweet} />
        </div>
      </div>
    </div>
  ));
}
