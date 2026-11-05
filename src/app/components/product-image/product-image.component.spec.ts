import { ProductImageComponent } from './product-image.component';

describe('ProductImageComponent', () => {
  it('uses a visual fallback when image is null', () => {
    const component = new ProductImageComponent();
    expect(component.source).toBeNull();
  });

  it('preserves a valid external image URL from the API', () => {
    const component = new ProductImageComponent();
    component.image = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8';
    expect(component.source).toBe(component.image);
  });

  it('resolves a relative public storage path against the API host', () => {
    const component = new ProductImageComponent();
    component.image = 'products/laptop.jpg';
    expect(component.source).toBe('http://127.0.0.1:8000/storage/products/laptop.jpg');
  });

  it('replaces an image that failed to load with the fallback state', () => {
    const component = new ProductImageComponent();
    component.image = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8';
    component.markFailed();
    expect(component.source).toBeNull();
  });
});
