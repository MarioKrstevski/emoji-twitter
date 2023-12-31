import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

// import { withClerkMiddleware } from "@clerk/nextjs";
// import { NextResponse } from "next/server";

// export default withClerkMiddleware(() => {
//   console.log("middleware running");
//   return NextResponse.next();
// });

// export const config = {
//   matcher: ["/((?!_next/image|_next/static|favicon.ico).*)"],
// };
