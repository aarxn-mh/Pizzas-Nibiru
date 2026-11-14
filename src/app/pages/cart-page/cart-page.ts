import localeEsMx from '@angular/common/locales/es-MX';
import { CurrencyPipe, registerLocaleData } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { ProductService } from '../../services/product';

registerLocaleData(localeEsMx);

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage {
  readonly cart = inject(CartService);
  private readonly productService = inject(ProductService);
  readonly canLoadExample = this.productService.products.some(product => product.active && product.available);

  constructor() {
    this.cart.refreshProducts();
  }

  loadExample(): void {
    if (this.cart.items().length !== 0) return;
    this.productService.products
      .filter(product => product.active && product.available)
      .slice(0, 2)
      .forEach((product, index) => this.cart.addProduct(product.id, index + 1));
  }
}
