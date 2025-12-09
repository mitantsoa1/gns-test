import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000"
})


// Export methods from the configured instance
export const { signIn, signUp, useSession, signOut } = authClient

