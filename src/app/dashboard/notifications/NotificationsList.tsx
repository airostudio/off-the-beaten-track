'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/dashboard/EmptyState';

interface Notification {
  id: string;
  title: string;
  body: string | null;
  read: boolean;
  sent_at: string;
}

export function NotificationsList({ initial }: { initial: Notification[] }) {
  const [notifications, setNotifications] = useState(initial);

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications yet"
        body="Once a fare alert matches or we discover a deal on a route you're watching, it'll show up here."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {notifications.map((n) => (
        <li
          key={n.id}
          onClick={() => !n.read && markRead(n.id)}
          className={`cursor-pointer rounded-xl border p-4 transition ${
            n.read ? 'border-slate-200 bg-white' : 'border-accent-500/40 bg-accent-500/5'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-navy-950">{n.title}</p>
              {n.body && <p className="mt-0.5 text-sm text-slate-500">{n.body}</p>}
            </div>
            {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-500" />}
          </div>
          <p className="mt-2 text-xs text-slate-400">{new Date(n.sent_at).toLocaleString()}</p>
        </li>
      ))}
    </ul>
  );
}
