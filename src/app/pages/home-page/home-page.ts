import { inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroBanner } from '../../components/hero-banner/hero-banner';
import { CategoryCard } from '../../components/category-card/category-card';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductService } from '../../services/product';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [HeroBanner, CategoryCard, ProductCard, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private readonly productService = inject(ProductService);
  readonly categories = this.productService.categories.filter(category => category.active);
  readonly featuredProducts = this.productService.products.filter(product => product.active && product.featured);
}
