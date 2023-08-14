import {
  User,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import NewTweet from "./new-tweet";
import Tweets from "./tweets";
import AuthButtonServer from "./auth-button-server";
import Image from "next/image";

export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data } = await supabase
    .from("tweets")
    .select("*, author: profiles(*), likes(user_id)"); // author is an alias. profiles and likes are related tables. I get only the fields that I specify. On the configuration of the tables, I can determine whether that data is accessible only for authenticated users that the id matches the one of the row

  // data shape:
  // {
  //   id: "e0623607-0d8f-4628-9dfd-9856ebdeeb67",
  //   created_at: "2023-08-14T16:50:26.149184+00:00",
  //   title: "first",
  //   user_id: "b1deb304-2a55-4808-81ed-a0199a515ee2",
  //   profiles: {
  //     id: "b1deb304-2a55-4808-81ed-a0199a515ee2",
  //     name: "Mateo Piñeiro",
  //     username: "mateopineiroa",
  //     avatar_url: "https://avatars.githubusercontent.com/u/99228921?v=4",
  //   },
  //   likes: [{ user_id: "b1deb304-2a55-4808-81ed-a0199a515ee2" }],
  // }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const tweets =
    data?.map((tweet) => ({
      ...tweet,
      author: tweet.author as Profile,
      user_has_liked_tweet: !!tweet.likes.find(
        (like) => like.user_id === session?.user.id
      ),
      likes: tweet.likes.length,
    })) ?? [];

  if (!session) {
    redirect("/login");
  }
  const {
    user: {
      user_metadata: { avatar_url },
    },
  } = session;
  return (
    <>
      <header className="flex p-6 px-10 justify-between">
        <Image
          src="/Subject.png"
          alt="twitnt"
          className="select-none "
          draggable="false"
          width={30}
          height={30}
          priority
        />
        <h1 className="text-xl select-none">Home</h1>
        <AuthButtonServer />
      </header>
      <div className="h-[0.0625rem] bg-gray-700" />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex gap-2 ">
          <Image
            src={avatar_url}
            alt="avatar"
            className="rounded-full h-fit select-none"
            draggable="false"
            width={40}
            height={40}
          />
          <NewTweet />
        </div>
        <div className="flex flex-col-reverse gap-4">
          <Tweets tweets={tweets} />
        </div>
      </div>
    </>
  );
}
