window.addEventListener('DOMContentLoaded', function () {
	// Bootstrap: delegate to Group module
	if (window.Group && typeof window.Group.init === 'function') {
		window.Group.init();
	} else {
		// Fallback: try minimal fetch then render
		fetch('/dashboard/user', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ type: 'user' })
		})
			.then(r => r.json())
			.then(d => {
				if (d.success && Array.isArray(d.data) && d.data.length > 0) {
					window.Group?.renderDashboard?.(d.data);
				} else {
					window.Group?.renderNoGroupPage?.();
				}
			})
			.catch(() => window.Group?.renderNoGroupPage?.());
	}
});