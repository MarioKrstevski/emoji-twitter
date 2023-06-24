import Head from "next/head";
import Link from "next/link";
import { api, RouterOutputs } from "@/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import LoadingSpinner, { LoadingPage } from "@/components/loading";

dayjs.extend(relativeTime);
function CreatePostWizzard() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex gap-3  ">
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
      />
    </div>
  );
}
type PostWithUser = RouterOutputs["posts"]["getAll"][number];
function PostView(props: PostWithUser) {
  const { post, author } = props;
  console.log(author.emailAddresses);
  return (
    <div className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        className="h-16 w-16 rounded-full"
        src={author.profileImageUrl}
        alt="Profile Image"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300">
          <span>{"@" + author.emailAddresses[0]?.emailAddress}</span>{" "}
          <span className="px-4">·</span>
          <span>{dayjs(post.createdAt).fromNow()}</span>
        </div>
        <div className="text-xl">{post.content}</div>
      </div>
    </div>
  );
}
function Feed() {
  const { data, isLoading: arePostsLoading } = api.posts.getAll.useQuery();

  if (arePostsLoading) {
    return <LoadingPage />;
  }
  if (!data) {
    return <div>Something went wrong</div>;
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
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center ">
        <div className="md:md-w-2xl h-full  w-full border-x border-slate-400">
          <div className="flex border-b border-slate-400 p-4">
            {!authState.isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {!!authState.isSignedIn && <SignOutButton />}
            {!!authState.isSignedIn && <CreatePostWizzard />}
          </div>

          <br />
          <Feed />
        </div>
      </main>
    </>
  );
}
