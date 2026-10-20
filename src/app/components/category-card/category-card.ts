import { RouterLink } from '@angular/router';
import { Category } from '../../interfaces/category.interface';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './category-card.html',
  styleUrl: './category-card.css',
})
export class CategoryCard {
  readonly category = input.required<Category>();
}
