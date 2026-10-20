import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductService } from '../../services/product';
import { Category } from '../../interfaces/category.interface';
import { Product } from '../../interfaces/product.interface';

@Component({
  selector: 'app-menu-page',
  standalone: true,
  imports: [ProductCard, RouterLink],
  templateUrl: './menu-page.html',
  styleUrl: './menu-page.css',
})
export class MenuPage {
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categories: readonly Category[] = this.productService.categories.filter(category => category.active);
  readonly searchText = signal('');
  readonly selectedCategory = signal<string | null>(null);

  readonly currentCategory = computed(() =>
    this.categories.find(category => category.id === this.selectedCategory()) ?? null
  );

  readonly filteredProducts = computed<readonly Product[]>(() => {
    const categoryId = this.selectedCategory();
    const query = this.normalize(this.searchText().trim());
    return this.productService.products.filter(product =>
      product.active &&
      this.categories.some(category => category.id === product.categoryId) &&
      (categoryId === null || product.categoryId === categoryId) &&
      this.normalize(product.name).includes(query)
    );
  });

  constructor() {
    // También responde a cambios de parámetro sin destruir esta página.
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const categoryId = params.get('categoria');
      this.selectedCategory.set(
        this.categories.some(category => category.id === categoryId) ? categoryId : null
      );
    });
  }

  selectCategory(categoryId: string | null): void {
    // La URL es la fuente de la selección; la suscripción actualiza el signal.
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: categoryId },
      queryParamsHandling: 'merge',
      preserveFragment: true,
    });
  }

  resetFilters(): void {
    this.searchText.set('');
    this.selectCategory(null);
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-MX');
  }
}
