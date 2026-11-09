import { useRef } from 'react';
import { Route, Switch } from 'wouter';
import { BagDrawer } from '@/components/bag-drawer';
import { SearchDialog } from '@/components/search-dialog';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Toaster } from '@/components/toaster';
import { useRouteChangeEffects } from '@/hooks/use-shop-navigation';
import CheckoutPage from '@/pages/checkout';
import HomePage from '@/pages/home';
import NotFound from '@/pages/not-found';
import OrderDetailPage from '@/pages/order-detail';
import OrdersPage from '@/pages/orders';
import ProductPage from '@/pages/product';
import SavedPage from '@/pages/saved';

function App() {
  const mainRef = useRef<HTMLElement>(null);
  useRouteChangeEffects(mainRef);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="announcement" data-testid="text-announcement">Complimentary shipping on orders $150+&nbsp; · &nbsp;Made for the in-between</div>
      <SiteHeader />
      <main id="main" ref={mainRef} tabIndex={-1}>
        <Switch>
          <Route path="/" component={HomePage} />
          {/* Keyed so that moving between products starts with a fresh size and view. */}
          <Route path="/products/:id">{({ id }) => <ProductPage key={id} id={id} />}</Route>
          <Route path="/saved" component={SavedPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/orders" component={OrdersPage} />
          <Route path="/orders/:id">{({ id }) => <OrderDetailPage id={id} />}</Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <SiteFooter />
      <BagDrawer />
      <SearchDialog />
      <Toaster />
    </div>
  );
}

export default App;
