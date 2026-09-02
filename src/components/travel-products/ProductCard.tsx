import { formatMoney } from '@/lib/format';
import { MemberFareLock } from '@/components/results/MemberFareLock';
import { BookingLink } from '@/components/results/BookingLink';

export interface TravelProduct {
  id: string;
  name: string;
  description: string | null;
  destination_city: string | null;
  destination_country: string | null;
  partner: string;
  affiliate_url: string;
  public_price: number | null;
  member_price: number | null;
  currency: string;
  image_url: string | null;
}

export function ProductCard({ product, canSeeMemberPrice }: { product: TravelProduct; canSeeMemberPrice: boolean }) {
  const location = [product.destination_city, product.destination_country].filter(Boolean).join(', ');

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      {product.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image_url} alt={product.name} className="h-40 w-full object-cover" />
      )}
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{product.partner}</p>
        <h3 className="mt-1 font-semibold text-navy-950">{product.name}</h3>
        {location && <p className="text-sm text-slate-500">{location}</p>}
        {product.description && <p className="mt-1 text-sm text-slate-500">{product.description}</p>}

        {product.public_price != null && (
          <div className="mt-3">
            {canSeeMemberPrice && product.member_price != null ? (
              <div>
                <p className="text-sm text-slate-500 line-through">{formatMoney(product.public_price, product.currency)}</p>
                <p className="text-xl font-bold text-navy-950">{formatMoney(product.member_price, product.currency)}</p>
                <p className="text-sm font-semibold text-member-600">Member price</p>
              </div>
            ) : !canSeeMemberPrice && product.member_price != null ? (
              <MemberFareLock
                publicPrice={product.public_price}
                currency={product.currency}
                saving={product.public_price - product.member_price}
                savingPercentage={Math.round(((product.public_price - product.member_price) / product.public_price) * 100)}
              />
            ) : (
              <p className="text-xl font-bold text-navy-950">{formatMoney(product.public_price, product.currency)}</p>
            )}
          </div>
        )}

        <div className="mt-3">
          <BookingLink href={product.affiliate_url} label="View deal" partner={product.partner} />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Booked via {product.partner}. We may earn a commission at no extra cost to you.
        </p>
      </div>
    </article>
  );
}
