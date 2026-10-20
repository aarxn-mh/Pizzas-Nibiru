import { Injectable } from '@angular/core';
import { Category } from '../interfaces/category.interface';
import { Product } from '../interfaces/product.interface';

@Injectable({ providedIn: 'root' })
export class ProductService {
  // Datos de demostración: no representan precios ni disponibilidad reales.
  readonly categories: readonly Category[] = [
    { id: 'burgers', name: 'Hamburguesas', description: 'Clásicos para disfrutar', image: '/images/home/category-burgers.png', active: true },
    { id: 'salads', name: 'Ensaladas', description: 'Una opción fresca', image: '/images/home/category-salads.png', active: true },
    { id: 'pasta', name: 'Pastas', description: 'Tu siguiente favorita', image: '/images/home/category-pasta.png', active: true },
    { id: 'pizza', name: 'Pizzas', description: 'El centro de nuestro universo', image: '/images/home/category-pizza.png', active: true },
    { id: 'breakfast', name: 'Desayunos', description: 'Para empezar el día', image: '/images/home/category-breakfast.png', active: true },
    { id: 'soups', name: 'Sopas', description: 'Una cucharada de sabor', image: '/images/home/category-soups.png', active: true },
  ];

  readonly products: readonly Product[] = [
    { id: 'pizza-pepperoni', name: 'Pizza de pepperoni', description: 'Pizza con queso y pepperoni.', price: 189, image: '/images/home/category-pizza.png', categoryId: 'pizza', available: true, active: true, featured: true },
    { id: 'pasta-casa', name: 'Pasta de la casa', description: 'Pasta con salsa de tomate y un toque de hierbas.', price: 129, image: '/images/home/category-pasta.png', categoryId: 'pasta', available: true, active: true, featured: true },
    { id: 'hamburguesa-clasica', name: 'Hamburguesa clásica', description: 'Hamburguesa con vegetales y acompañamiento.', price: 119, image: '/images/home/category-burgers.png', categoryId: 'burgers', available: false, active: true, featured: true },
  ];
}
