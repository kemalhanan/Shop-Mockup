import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/use-shop-navigation';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="page" data-testid="page-not-found">
      <div className="page-empty">
        <span className="section-label">404</span>
        <h1>We can’t find that one.</h1>
        <p>It may have sold out, moved, or never quite existed.</p>
        <Link className="text-link" href="/" data-testid="link-not-found-shop">Back to the shop <ArrowRight size={13} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
