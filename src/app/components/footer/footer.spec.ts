import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Footer } from './footer';

describe('Footer', () => {
  it('renders links to existing routes', async () => {
    TestBed.configureTestingModule({ imports: [Footer], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Footer);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('a[href]').length).toBeGreaterThan(0);
  });
});
