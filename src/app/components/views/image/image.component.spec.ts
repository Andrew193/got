import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageComponent } from './image.component';
import { By } from '@angular/platform-browser';

describe('ImageComponent', () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;
  const image = {
    source: '../../../../assets/resourses/imgs/icons/dmg_red.png',
    alt: 'test image',
    imageClass: 'image-75',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageComponent);
    fixture.componentRef.setInput('source', image.source);
    fixture.componentRef.setInput('alt', image.alt);
    fixture.componentRef.setInput('imageClass', image.imageClass);

    component = fixture.componentInstance;
  });

  it('ImageComponent should be created', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('ImageComponent should render the image', () => {
    expect(component.loading).toBeTrue();
    fixture.detectChanges();
    const loader = fixture.debugElement.query(By.css('.loader')).nativeElement as HTMLImageElement;
    const img = fixture.debugElement.query(By.css(`.image-75`)).nativeElement as HTMLImageElement;

    expect(loader).toBeTruthy();

    component.onLoad();
    fixture.detectChanges();

    expect(img).toBeTruthy();
    expect(img.alt).toBe(image.alt);

    const endpoint = img.src.split('/');
    const mockEndpoint = image.source.split('/');

    expect(endpoint[endpoint.length]).toBe(mockEndpoint[mockEndpoint.length]);
    expect(img.classList.contains(image.imageClass)).toBeTrue();
  });
});
