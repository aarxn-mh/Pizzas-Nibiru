export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly image: string;
  readonly categoryId: string;
  readonly available: boolean;
  readonly active: boolean;
  readonly featured: boolean;
}
