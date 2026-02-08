export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/build-orders/:path*", "/dashboard/:path*", "/submit-price/:path*", "/favorites/:path*"],
};
