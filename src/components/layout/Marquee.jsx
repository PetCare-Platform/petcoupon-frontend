const ITEMS = ['PETCOUPON', 'EVENTS', 'COUPONS', 'RELIABLE OPERATIONS'];

export default function Marquee() {
  return (
    <div className="marquee marquee-strip" aria-hidden="true">
      <div className="marquee-track">
        {[...ITEMS, ...ITEMS].map((item, index) => (
          <span className="marquee-item" key={`${item}-${index}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
