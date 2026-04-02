export { auth as middleware } from "@/auth";

export const config = {
  // Protect all routes except: Auth.js endpoints, Next.js internals,
  // public assets, and the contact-facing /cancel route.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|cancel|icons|manifest\\.json|sw\\.js|workbox).*)",
  ],
};
