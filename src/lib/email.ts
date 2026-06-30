import "server-only";
import { Resend } from "resend";
import { WelcomeEmail } from "@/emails/welcome-email";
import { SubscriptionConfirmationEmail } from "@/emails/subscription-confirmation-email";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "AgentStack <onboarding@resend.dev>";

export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping welcome email to", to);
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "Welcome to AgentStack",
    react: WelcomeEmail({ name }),
  });
}

export async function sendSubscriptionConfirmationEmail({
  to,
  name,
  planName,
}: {
  to: string;
  name: string;
  planName: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping subscription email to", to);
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Your ${planName} subscription is active`,
    react: SubscriptionConfirmationEmail({ name, planName }),
  });
}
