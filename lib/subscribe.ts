export async function subscribeEmail(email: string, source = 'website') {
  const response = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unable to subscribe.');
}
