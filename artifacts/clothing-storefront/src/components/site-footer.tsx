import { Link } from 'wouter';

export function SiteFooter() {
  return (
    <footer className="footer">
      <Link className="footer-brand" href="/" data-testid="link-footer-home">good form.</Link>
      <nav className="footer-links" aria-label="Footer">
        <Link href="/saved" data-testid="link-footer-saved">Saved</Link>
        <Link href="/orders" data-testid="link-footer-orders">Your orders</Link>
      </nav>
      <span>Made for the in-between.</span>
      <span>© Good Form Studio 2026&nbsp; · &nbsp;A little goes a long way</span>
    </footer>
  );
}
