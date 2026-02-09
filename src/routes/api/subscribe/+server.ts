import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import GhostAdminAPI from '@tryghost/admin-api';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email } = await request.json();

		if (!email || !email.includes('@')) {
			return json({ error: 'Invalid email' }, { status: 400 });
		}

		const ghostUrl = env.GHOST_URL || '';
		const adminKey = env.GHOST_ADMIN_API_KEY || '';

		// Use Admin API if key is available
		if (adminKey) {
			const api = new GhostAdminAPI({
				url: ghostUrl,
				key: adminKey,
				version: 'v5.0'
			});

			try {
				await api.members.add({ email });
				return json({ success: true });
			} catch (err: any) {
				// Member already exists -- treat as success
				if (err.message?.includes('already exists')) {
					return json({ success: true });
				}
				console.error('Ghost Admin API error:', err);
				return json({ error: err.message || 'Subscription failed' }, { status: 400 });
			}
		}

		// Fallback: use Ghost's public magic link endpoint
		const response = await fetch(`${ghostUrl}/members/api/send-magic-link/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			},
			body: JSON.stringify({
				email,
				emailType: 'subscribe'
			})
		});

		if (response.ok) {
			return json({ success: true });
		}

		let errorMsg = 'Subscription failed';
		try {
			const data = await response.json();
			errorMsg = data.errors?.[0]?.message || errorMsg;
		} catch {
			errorMsg = `Error ${response.status}`;
		}
		return json({ error: errorMsg }, { status: response.status });
	} catch (err) {
		console.error('Subscribe error:', err);
		return json({ error: 'Server error' }, { status: 500 });
	}
};
