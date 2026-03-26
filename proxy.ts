import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define the routes that do NOT require authentication
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  // If the user tries to access a protected route, redirect them to the sign-in page
  if (!isPublicRoute(request)) {
    await auth.protect(); // Notice the 'await' and the removal of the parentheses after auth
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};