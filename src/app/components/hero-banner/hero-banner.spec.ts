import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeroBanner } from './hero-banner';

describe('HeroBanner', () => {
  it('renders links to existing routes', async () => {
    TestBed.configureTestingModule({ imports: [HeroBanner], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(HeroBanner);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('a[href]').length).toBeGreaterThan(0);
  });
});
