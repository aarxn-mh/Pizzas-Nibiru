import { Routes } from '@angular/router';
import { CartPage } from './pages/cart-page/cart-page';
import { HomePage } from './pages/home-page/home-page';
import { LoginPage } from './pages/login-page/login-page';
import { MenuPage } from './pages/menu-page/menu-page';
import { NotFoundPage } from './pages/not-found-page/not-found-page';
import { ProductDetailPage } from './pages/product-detail-page/product-detail-page';
import { RegisterPage } from './pages/register-page/register-page';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomePage },
    { path: 'menu', component: MenuPage },
    { path: 'producto/:id', component: ProductDetailPage },
    { path: 'carrito', component: CartPage },
    { path: 'login', component: LoginPage },
    { path: 'registro', component: RegisterPage },
    { path: '**', component: NotFoundPage }
];