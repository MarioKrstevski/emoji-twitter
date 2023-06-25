import Head from "next/head";
import Link from "next/link";
import { api, RouterOutputs } from "@/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import LoadingSpinner, { LoadingPage } from "@/components/loading";
import { useRef } from "react";
import toast from "react-hot-toast";
import PageLayout from "@/components/layout";
import { PostView } from "@/components/postview";

dayjs.extend(relativeTime);
function CreatePostWizzard() {
  const { user } = useUser();
  const inputRef = useRef<null | HTMLInputElement>(null);

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      // void says we don't care we want this to happen
      // in the background automatically
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post!");
      }
    },
  });
  if (!user) return null;

  return (
    <div className="flex grow gap-3  ">
      <Image
        className="h-16 w-16 rounded-full"
        src={user.profileImageUrl}
        alt="Profile Image"
        width={56}
        height={56}
      />
      <input
        className="grow bg-transparent outline-none"
        type="text"
        placeholder="Type some Emojis"
        ref={inputRef}
        onKeyUp={(e) => {
          if (e.code === "Enter") {
            mutate({
              content: e.currentTarget.value,
            });
          }
        }}
        disabled={isPosting}
      />
      {!isPosting && (
        <button
          disabled={isPosting}
          className="ml-auto"
          onClick={() => {
            if (inputRef.current) {
              mutate({
                content: inputRef.current?.value,
              });
            }
          }}
        >
          Post
        </button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}

function Feed() {
  const { data, isLoading: arePostsLoading } = api.posts.getAll.useQuery();

  if (arePostsLoading) {
    return <LoadingPage />;
  }
  if (!data) {
    return <div>Something went wrong, you need to sign in probably</div>;
  }
  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => {
        return <PostView {...fullPost} key={fullPost.post.id} />;
      })}
    </div>
  );
}
export default function Home() {
  const authState = useUser();
  const { user, isLoaded: isUserLoaded } = authState;
  // console.log(user);
  // start fetching asap, and it will be in the cache if its called somewhere else again
  api.posts.getAll.useQuery();

  // Return empty div if both aren't loaded since user tends to load faster
  if (!isUserLoaded) return <div></div>;

  return (
    <>
      <PageLayout>
        <div className="flex border-b border-slate-400 p-4">
          {!authState.isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {!!authState.isSignedIn && <SignOutButton />}
          {!!authState.isSignedIn && <CreatePostWizzard />}
        </div>

        <Feed />
      </PageLayout>
    </>
  );
}
