'use client';

export function BookingLink({
  href,
  offerId,
  label = 'View flight',
  partner,
}: {
  href: string;
  offerId?: string;
  label?: string;
  partner?: string;
}) {
  function handleClick() {
    fetch('/api/affiliate/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId, partner }),
      keepalive: true,
    }).catch(() => {
      // best-effort click tracking — never block the user's booking
    });
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="block rounded-lg bg-accent-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-accent-600"
    >
      {label}
    </a>
  );
}
