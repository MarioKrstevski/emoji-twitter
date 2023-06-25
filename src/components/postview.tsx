import Link from "next/link";
import { RouterOutputs } from "@/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import Image from "next/image";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export function PostView(props: PostWithUser) {
  const { post, author } = props;
  // console.log(author.emailAddresses);
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
          <Link href={`/@${author.username}`}>
            {/* <span>{"@" + author.emailAddresses[0]?.emailAddress} </span> */}
            <span>{"@" + author.username} </span>
          </Link>{" "}
          <Link href={`/post/${post.id}`}>
            <span className="px-4">·</span>
            <span>{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </div>
        <div className="text-xl">{post.content}</div>
      </div>
    </div>
  );
}
