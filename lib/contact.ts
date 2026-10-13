export async function sendContactMessage(data: {
  name: string;
  email: string;
  type: string;
  message: string;
  captchaToken: string;
  website: string;
}) {
  const response = await fetch('/api/contact', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Could not send your message. Please try again.');
}
