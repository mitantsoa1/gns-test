"use client"

import { signUpEmail } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useActionState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { signInWithProvider } from "./login-form"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [state, formAction, isPending] = useActionState(signUpEmail, null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter();

  // Réinitialiser le formulaire après succès
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset(),
        router.push(`/login`)
    }
  }, [state?.success])

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>

        <FieldGroup>
          <form action={formAction} ref={formRef}>
            <div className="flex flex-col gap-4 mb-4">
              {/* Message de succès */}
              {state?.success && (
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200">
                  {state.message}
                </div>
              )}

              {/* Message d'erreur */}
              {state?.error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
                  {state.error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  required
                  disabled={state?.success}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                  disabled={state?.success}
                />
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your email
                  with anyone else.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={state?.success}
                />
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  disabled={state?.success}
                />
                <FieldDescription>Please confirm your password.</FieldDescription>
              </Field>
            </div>

            <Field>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Sign up"
                )}
              </Button>
            </Field>

          </form>
          <FieldGroup>
            <Field>
              <Button
                variant="outline"
                className={cn(
                  "w-full gap-2"
                )}
                disabled={isPending}
                onClick={() => signInWithProvider("google")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 262">
                  <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                  <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                  <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
                  <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
                </svg>
                Sign in with Google
              </Button>
              <FieldDescription className="text-center">
                Already have an account? <Link href={`/login`}>Sign in</Link>
              </FieldDescription>
            </Field>

          </FieldGroup>

        </FieldGroup>
      </CardContent>
    </Card>
  )
}
