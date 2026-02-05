import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const GHOST_URL = 'https://siberspace.ghost.io';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email } = await request.json();

		if (!email || !email.includes('@')) {
			return json({ error: 'Invalid email' }, { status: 400 });
		}

		// Forward to Ghost Members API
		const response = await fetch(`${GHOST_URL}/members/api/send-magic-link/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Origin': GHOST_URL,
			},
			body: JSON.stringify({
				email,
				emailType: 'signup'
			})
		});

		if (response.ok) {
			return json({ success: true });
		} else {
			const data = await response.json().catch(() => ({}));
			return json(
				{ error: data.errors?.[0]?.message || 'Subscription failed' },
				{ status: response.status }
			);
		}
	} catch (err) {
		console.error('Subscribe error:', err);
		return json({ error: 'Server error' }, { status: 500 });
	}
};
