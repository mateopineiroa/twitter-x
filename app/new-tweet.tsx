import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function NewTweet() {
  const addTweet = async (formData: FormData) => {
    "use server"; // experimental. requires next config server actions
    const title = String(formData.get("title"));
    const supabase = createServerActionClient<Database>({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && title) {
      await supabase.from("tweets").insert({ title, user_id: user.id });
      redirect("/");
    }
  };
  return (
    <form action={addTweet} className="flex flex-col gap-4 items-end w-full">
      {/* action instead of onSubmit because it triggers the server action addTweet */}
      <input
        name="title"
        className="w-full bg-inherit p-2 outline-none"
        placeholder="What's happening?!"
      />

      <div className="h-[0.0625rem] bg-gray-700 w-full" />

      <button
        type="submit"
        className="bg-sky-500 p-2 rounded-3xl w-16 font-semibold text-sm select-none"
      >
        Post
      </button>
    </form>
  );
}
