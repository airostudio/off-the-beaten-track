import type { ClientFlightOffer, FlightBadge } from '@/types/flight';
import { formatMoney, formatDuration, formatTime } from '@/lib/format';
import { MemberFareLock } from './MemberFareLock';
import { WatchTripButton } from '@/components/watchlist/WatchTripButton';
import { BookingLink } from './BookingLink';
import { DirectBookButton } from './DirectBookButton';

const BADGE_LABEL: Record<FlightBadge, string> = {
  BEST_VALUE: 'Best value',
  CHEAPEST: 'Cheapest',
  FASTEST: 'Fastest',
  BEST_MEMBER_DEAL: 'Best member deal',
  BEST_PREMIUM_ECONOMY: 'Best Premium Economy',
};

export function FlightCard({ offer }: { offer: ClientFlightOffer }) {
  return (
    <article className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card md:grid-cols-[1fr_260px]">
      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          {offer.badges.map((b) => (
            <span
              key={b}
              className="rounded-full bg-navy-950/5 px-3 py-1 text-xs font-semibold text-navy-800"
            >
              {BADGE_LABEL[b]}
            </span>
          ))}
          {offer.alternateAirportNote && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Alternate airport
            </span>
          )}
        </div>

        {offer.alternateAirportNote && (
          <p className="mb-1 text-xs text-amber-700">{offer.alternateAirportNote}</p>
        )}

        <p className="text-sm font-semibold text-navy-900">
          {offer.airline} {offer.flightNumber ? `· ${offer.flightNumber}` : ''}
        </p>

        <div className="mt-2 flex items-center gap-3 text-navy-950">
          <span className="text-lg font-bold">{formatTime(offer.departureAt)}</span>
          <span className="flex-1 border-t border-dashed border-slate-300" />
          <span className="text-xs text-slate-500">
            {offer.stops === 0 ? 'Direct' : `${offer.stops} stop${offer.stops > 1 ? 's' : ''}`}
            {offer.stopoverAirports.length > 0 ? ` via ${offer.stopoverAirports.join(', ')}` : ''}
          </span>
          <span className="flex-1 border-t border-dashed border-slate-300" />
          <span className="text-lg font-bold">{formatTime(offer.arrivalAt)}</span>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          {formatDuration(offer.durationMinutes)} · {offer.cabin.replace('_', ' ')} · {offer.origin} →{' '}
          {offer.destination}
        </p>

        <p className="mt-3 text-xs text-slate-400">{offer.priceFreshness.label}</p>
      </div>

      <div className="flex flex-col justify-between gap-3">
        {offer.memberPrice != null ? (
          <div>
            <p className="text-sm text-slate-500 line-through">{formatMoney(offer.publicPrice, offer.currency)}</p>
            <p className="text-2xl font-bold text-navy-950">{formatMoney(offer.memberPrice, offer.currency)}</p>
            <p className="text-sm font-semibold text-member-600">Member price</p>
          </div>
        ) : offer.lockedMemberFare ? (
          <MemberFareLock
            publicPrice={offer.publicPrice}
            currency={offer.currency}
            saving={offer.lockedMemberFare.saving}
            savingPercentage={offer.lockedMemberFare.savingPercentage}
          />
        ) : (
          <div>
            <p className="text-2xl font-bold text-navy-950">{formatMoney(offer.publicPrice, offer.currency)}</p>
            <p className="text-xs text-slate-500">Public fare</p>
          </div>
        )}

        <BookingLink href={offer.bookingUrl} offerId={offer.dbOfferId} />
        {offer.dbOfferId && <DirectBookButton dbOfferId={offer.dbOfferId} />}

        <WatchTripButton
          origin={offer.origin}
          destination={offer.destination}
          departureDate={offer.departureAt.slice(0, 10)}
          cabin={offer.cabin}
          priceWhenWatched={offer.memberPrice ?? offer.publicPrice}
          currency={offer.currency}
        />
      </div>
    </article>
  );
}
