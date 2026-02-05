import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GHOST_ADMIN_API_KEY } from '$env/static/private';
import GhostAdminAPI from '@tryghost/admin-api';

const GHOST_URL = 'https://siberspace.ghost.io';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email } = await request.json();

		if (!email || !email.includes('@')) {
			return json({ error: 'Invalid email' }, { status: 400 });
		}

		// If we have Admin API key, use it
		if (GHOST_ADMIN_API_KEY) {
			const api = new GhostAdminAPI({
				url: GHOST_URL,
				key: GHOST_ADMIN_API_KEY,
				version: 'v5.0'
			});

			try {
				await api.members.add({ email });
				return json({ success: true });
			} catch (err: any) {
				// Member might already exist, which is fine
				if (err.message?.includes('already exists')) {
					return json({ success: true });
				}
				console.error('Ghost Admin API error:', err);
				return json({ error: err.message || 'Subscription failed' }, { status: 400 });
			}
		}

		// Fallback: try direct API call
		const response = await fetch(`${GHOST_URL}/members/api/send-magic-link/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify({
				email: email,
				emailType: 'subscribe'
			})
		});

		if (response.ok) {
			return json({ success: true });
		} else {
			let errorMsg = 'Subscription failed';
			try {
				const data = await response.json();
				errorMsg = data.errors?.[0]?.message || errorMsg;
			} catch {
				errorMsg = `Error ${response.status}`;
			}
			return json({ error: errorMsg }, { status: response.status });
		}
	} catch (err) {
		console.error('Subscribe error:', err);
		return json({ error: 'Server error' }, { status: 500 });
	}
};
