# Animation System - Quick Reference

## Import Components

```tsx
import { AnimatedSection } from "../Components/Common/AnimatedSection";
import {
  AnimatedButton,
  AnimatedCard,
  AnimatedImage,
} from "../Components/Common/AnimatedElements";
import { Carousel } from "../Components/Common/Carousel";
import "../styles/animations.css";
```

## AnimatedSection

Wrap any component for scroll-triggered animations:

```tsx
<AnimatedSection
  animationType="slide-up" // 'fade-in' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale-in'
  delay={100} // Milliseconds
  once={true} // Only animate once
>
  <YourComponent />
</AnimatedSection>
```

## AnimatedButton

```tsx
<AnimatedButton
  hoverEffect="scale" // 'scale' | 'lift' | 'glow'
  onClick={handleClick}
>
  Click Me
</AnimatedButton>
```

## AnimatedCard

```tsx
<AnimatedCard
  hoverEffect={true}
  animateOnScroll={true}
  className="your-classes"
>
  <CardContent />
</AnimatedCard>
```

## AnimatedImage

```tsx
<AnimatedImage
  src="/path/to/image.jpg"
  alt="Description"
  zoomOnHover={true}
  className="your-classes"
/>
```

## Carousel

```tsx
<Carousel
  images={["/img1.jpg", "/img2.jpg", "/img3.jpg"]}
  autoPlay={true}
  interval={3000}
  showDots={true}
  showArrows={true}
  className="h-96"
/>
```

## CSS Classes

Apply directly to elements:

```tsx
// Scroll animations
<div className="slide-up">Content</div>
<div className="fade-in">Content</div>
<div className="scale-in">Content</div>

// Hover effects
<button className="btn-hover-scale">Button</button>
<div className="card-hover">Card</div>
<div className="img-hover-zoom">
  <img src="..." />
</div>

// Looping animations
<div className="animate-float">Floating</div>
<div className="animate-pulse-slow">Pulsing</div>
```

## Staggered Animations

```tsx
items.map((item, index) => (
  <AnimatedSection
    key={item.id}
    animationType="slide-up"
    delay={index * 100} // 100ms between each
  >
    <ItemComponent item={item} />
  </AnimatedSection>
));
```

## Custom Hook Usage

```tsx
import { useScrollAnimation } from "../hooks/useScrollAnimation";

function MyComponent() {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.2,
    delay: 200,
  });

  return (
    <div ref={elementRef} className={`slide-up ${isVisible ? "visible" : ""}`}>
      Content
    </div>
  );
}
```

## Files Created

**Hooks:**

- `src/hooks/useScrollAnimation.ts`

**Components:**

- `src/Components/Common/AnimatedSection.tsx`
- `src/Components/Common/AnimatedElements.tsx`
- `src/Components/Common/Carousel.tsx`

**Styles:**

- `src/styles/animations.css`
- `src/styles/animations-extended.css`
- `src/styles/carousel.css`

**Updated:**

- `src/Landing/Landing.tsx`
