"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Session } from "@/lib/auth";
import { updateStudentProfileAction } from "@/app/student/profile/actions";

export function StudentProfileForm({ session }: { session: Session }) {
  const [state, formAction, pending] = useActionState(
    updateStudentProfileAction,
    {},
  );

  return (
    <Card className="gap-0 rounded-2xl p-0">
      <CardHeader className="gap-1.5 px-7 pt-7 pb-0">
        <h2 className="font-display text-title text-ink">Your details</h2>
        <p className="text-small text-ink-soft">
          Update the name, email, and password used to sign in.
        </p>
      </CardHeader>
      <CardContent className="px-7 pt-6 pb-7">
        <form action={formAction} className="flex flex-col gap-5" noValidate>
          <div>
            <label htmlFor="profile-name" className="mb-2 block text-small font-medium text-ink-soft">
              Full name
            </label>
            <Input id="profile-name" name="name" defaultValue={session.name} required />
          </div>
          <div>
            <label htmlFor="profile-email" className="mb-2 block text-small font-medium text-ink-soft">
              Email
            </label>
            <Input id="profile-email" name="email" type="email" defaultValue={session.email} required />
          </div>
          <div>
            <label htmlFor="profile-password" className="mb-2 block text-small font-medium text-ink-soft">
              New password
            </label>
            <Input
              id="profile-password"
              name="password"
              type="password"
              placeholder="Leave blank to keep your current password"
              minLength={8}
            />
          </div>

          {state.error && (
            <p role="alert" className="text-micro text-error">
              {state.error}
            </p>
          )}

          <div className="flex items-center gap-3 border-t border-linen pt-6">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
            {state.success && !pending && (
              <span className="flex items-center gap-1.5 text-small font-medium text-success">
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
