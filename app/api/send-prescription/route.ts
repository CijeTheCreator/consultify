// app/api/send-email/route.ts
import PrescriptionEmail from "@/emails/prescription";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, name } = await req.json();

  const { error } = await resend.emails.send({
    from: "My App <onboarding@yourdomain.com>",
    to: email,
    subject: "Welcome!",
    react: PrescriptionEmail({ name }),
  });

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ message: "Email sent" });
}
