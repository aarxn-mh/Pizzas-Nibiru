import { computed, inject, Injectable, signal, type Signal } from '@angular/core';
import { CartItem } from '../interfaces/cart-item.interface';
import { ProductService } from './product';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly productService = inject(ProductService);
  private readonly selectedItems = signal<CartItem[]>([]);
  readonly items: Signal<readonly CartItem[]> = this.selectedItems.asReadonly();

  // Los datos del producto se consultan, no se copian al estado del carrito.
  readonly lines = computed(() => this.items().map(item => {
    const product = this.productService.getProductById(item.productId);
    const issue = !product ? 'missing' : !product.available ? 'unavailable' : null;
    const unitPriceCents = product ? Math.round(product.price * 100) : null;
    return {
      ...item,
      product,
      issue,
      unitPriceCents,
      lineSubtotalCents: issue === null && unitPriceCents !== null ? unitPriceCents * item.quantity : null,
    };
  }));
  readonly issueCount = computed(() => this.lines().filter(line => line.issue !== null).length);
  readonly subtotalCents = computed(() =>
    this.lines().reduce((total, line) => total + (line.lineSubtotalCents ?? 0), 0)
  );
  readonly subtotal = computed(() => this.subtotalCents() / 100);
  // Incluye todas las unidades seleccionadas, también las que tienen incidencias.
  readonly totalQuantity = computed(() =>
    this.items().reduce((total, item) => total + item.quantity, 0)
  );

  addProduct(productId: string, quantity = 1): boolean {
    this.refreshProducts();
    const product = this.productService.getProductById(productId);
    if (!product?.available || !Number.isSafeInteger(quantity) || quantity < 1) return false;
    const existing = this.items().find(item => item.productId === productId);
    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    const unitCents = Math.round(product.price * 100);
    if (unitCents < 0 || !Number.isSafeInteger(unitCents * nextQuantity) ||
        !Number.isSafeInteger(nextQuantity) ||
        !Number.isSafeInteger(this.totalQuantity() + quantity) ||
        !Number.isSafeInteger(this.subtotalCents() + unitCents * quantity)) return false;

    this.selectedItems.update(items => existing
      ? items.map(item => item.productId === productId ? { ...item, quantity: nextQuantity } : item)
      : [...items, { productId, quantity }]
    );
    return true;
  }

  increaseQuantity(productId: string): boolean {
    if (!this.items().some(item => item.productId === productId)) return false;
    return this.addProduct(productId);
  }

  decreaseQuantity(productId: string): boolean {
    const existing = this.items().find(item => item.productId === productId);
    if (!existing || existing.quantity <= 1) return false;
    this.selectedItems.update(items => items.map(item =>
      item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
    ));
    return true;
  }

  removeProduct(productId: string): void {
    this.selectedItems.update(items => items.filter(item => item.productId !== productId));
  }

  clear(): void {
    this.selectedItems.update(() => []);
  }

  // ProductService usa arrays locales, no signals. Reconsultar al entrar a la página
  // o realizar una acción permite reflejar datos actuales sin duplicar el catálogo.
  refreshProducts(): void {
    this.selectedItems.update(items => [...items]);
  }
}
