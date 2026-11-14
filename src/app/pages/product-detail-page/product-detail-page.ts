import localeEsMx from '@angular/common/locales/es-MX';
import { CurrencyPipe, registerLocaleData } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../interfaces/product.interface';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';

registerLocaleData(localeEsMx);

@Component({
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  selector: 'app-product-detail-page',
  styleUrl: './product-detail-page.css',
  templateUrl: './product-detail-page.html',
})
export class ProductDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  readonly quantity = signal(1);
  readonly feedback = signal('');
  readonly subtotalCents = computed(() => this.amountFor(this.quantity()));
  readonly canAdd = computed(() => !!this.product()?.available && this.subtotalCents() !== null);
  readonly canIncrease = computed(() => this.canAdd() && this.amountFor(this.quantity() + 1) !== null);

  readonly productId = signal<string | null>(null);
  readonly product = computed<Product | undefined>(() =>
    this.productService.getProductById(this.productId() ?? '')
  );
  readonly category = computed(() => {
    const product = this.product();
    return this.productService.categories.find(category => category.id === product?.categoryId);
  });

  constructor() {
    // También responde cuando Angular reutiliza esta página con otro :id.
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(params => {
      this.productId.set(params.get('id'));
      this.quantity.set(1);
      this.feedback.set('');
    });
  }

  // Solo deriva el importe de la selección; CartService valida el carrito completo.
  private amountFor(quantity: number): number | null {
    const product = this.product();
    if (!product || !Number.isSafeInteger(quantity) || quantity < 1) return null;
    const cents = Math.round(product.price * 100) * quantity;
    return Number.isSafeInteger(cents) && cents >= 0 ? cents : null;
  }

  increaseQuantity(): void {
    if (!this.canIncrease()) return;
    this.quantity.update(quantity => quantity + 1);
    this.feedback.set('');
  }

  decreaseQuantity(): void {
    if (!this.canAdd() || this.quantity() <= 1) return;
    this.quantity.update(quantity => quantity - 1);
    this.feedback.set('');
  }

  addToCart(): void {
    const product = this.product();
    if (!this.canAdd() || !product || !this.cart.addProduct(product.id, this.quantity())) {
      this.feedback.set('No se pudo agregar el producto. Revisa su disponibilidad y la cantidad seleccionada.');
      return;
    }
    this.feedback.set(`Producto agregado al carrito de demostración. Total en el carrito: ${this.cart.totalQuantity()} unidades.`);
  }
}
