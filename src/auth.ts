import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope:
            "openid profile email offline_access Mail.Send Calendars.ReadWrite",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // On first sign-in, persist the access token from Azure AD
      if (account) {
        token.accessToken = account.access_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});
