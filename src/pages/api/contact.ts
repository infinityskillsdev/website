import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    const { fullName, email, phone, enquiryType, message, privacyConsent, botCheck } = data;

    // Honeypot spam trap
    if (botCheck) {
      return new Response(JSON.stringify({ success: true, message: 'Received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!fullName || !email || !message || !privacyConsent) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields or privacy consent.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Please provide a valid email address.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const recipient = 'info@infinityskillsdev.com';

    // Log the enquiry for records
    console.log(`[ENQUIRY RECEIVED] To: ${recipient}`);
    console.log(`Name: ${fullName} | Email: ${email} | Phone: ${phone || 'N/A'}`);
    console.log(`Type: ${enquiryType}`);
    console.log(`Message: ${message}`);

    // If an external email provider or SMTP webhook is configured in env (e.g. RESEND_API_KEY or SMTP_HOST)
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Infinity Enquiries <onboarding@resend.dev>',
            to: [recipient],
            reply_to: email,
            subject: `[New Website Enquiry] ${enquiryType} - ${fullName}`,
            text: `Name: ${fullName}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nEnquiry Type: ${enquiryType}\n\nMessage:\n${message}`,
          }),
        });
      } catch (err) {
        console.warn('External email delivery notification failed, enquiry logged locally:', err);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Your enquiry has been successfully submitted. Our team will get back to you shortly.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Contact form submission error:', err);
    return new Response(
      JSON.stringify({ success: false, message: 'An internal server error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

