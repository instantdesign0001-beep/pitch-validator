import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { founderEmail, pitchTitle, investorName, investorEmail, investorFirm, message } = await request.json();

    if (!founderEmail) {
      return NextResponse.json({ message: 'No founder email on file' }, { status: 200 });
    }

    const { data, error } = await resend.emails.send({
      from: 'PitchDesk <onboarding@resend.dev>',
      to: [founderEmail],
      subject: `🎯 New Investor Introduction Request: ${pitchTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #4f46e5; margin-bottom: 8px;">New Investor Introduction</h2>
          <p style="color: #475569; font-size: 15px;">An investor has reviewed your validated pitch for <strong>${pitchTitle}</strong> and requested an introduction.</p>
          
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Investor Name:</strong> ${investorName}</p>
            <p style="margin: 0 0 8px 0;"><strong>Investor Email:</strong> <a href="mailto:${investorEmail}">${investorEmail}</a></p>
            <p style="margin: 0 0 8px 0;"><strong>Firm / Syndicate:</strong> ${investorFirm || 'Independent Angel'}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 12px 0;" />
            <p style="margin: 0; color: #1e293b;"><strong>Message:</strong><br/>"${message}"</p>
          </div>

          <p style="font-size: 13px; color: #94a3b8;">You can reply directly to this email or reach out to ${investorEmail} to schedule your call.</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
