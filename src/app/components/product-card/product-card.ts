import localeEsMx from '@angular/common/locales/es-MX';
import { CurrencyPipe, registerLocaleData } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../interfaces/product.interface';
import { Component, input } from '@angular/core';

registerLocaleData(localeEsMx);

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly variant = input<'featured' | 'menu'>('featured');
}
