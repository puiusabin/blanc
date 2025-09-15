# Image Optimization for Cloudflare

This project uses Cloudflare's image optimization service for optimal performance and delivery.

## Setup

### 1. Custom Image Loader
- **File**: `image-loader.ts`
- **Purpose**: Uses Cloudflare's `/cdn-cgi/image/` endpoint for image transformations
- **Features**:
  - Automatic format selection (WebP/AVIF)
  - Responsive width handling
  - Quality optimization
  - Development fallback to original images

### 2. Next.js Configuration
```typescript
images: {
  // Only use custom loader in production for Cloudflare
  ...(process.env.NODE_ENV === 'production' && {
    loader: "custom",
    loaderFile: "./image-loader.ts",
  }),
  formats: ["image/avif", "image/webp"],
  minimumCacheTTL: 300,
  remotePatterns: [
    // External image sources allowed
  ],
}
```

**Note**: The custom loader is only applied in production to avoid 404 errors in development mode.

### 3. Cloudflare Requirements
- Enable Cloudflare Images for your zone
- Configure allowed image origins in Cloudflare dashboard
- Optionally use R2 bucket for image storage

## Image Best Practices

### For Hero/Important Images:
```tsx
<Image
  src="/image.jpg"
  alt="Description"
  width={600}
  height={400}
  priority              // Load immediately
  placeholder="blur"    // Show blur while loading
  blurDataURL="..."     // Base64 blur placeholder
  sizes="(max-width: 768px) 100vw, 600px"  // Responsive sizing
/>
```

### For UI/Logo Images:
```tsx
<Image
  src="/logo.svg"
  alt="Logo"
  width={120}
  height={40}
  priority              // For above-the-fold content
  sizes="120px"         // Fixed size
/>
```

## Benefits

1. **Automatic Format Optimization**: WebP/AVIF when supported
2. **Responsive Images**: Different sizes for different viewports
3. **Quality Optimization**: Cloudflare's intelligent compression
4. **CDN Distribution**: Global edge delivery
5. **Development Friendly**: Original images in dev mode

## Performance Impact

- Reduced bandwidth usage
- Faster image loading
- Better Core Web Vitals scores
- Improved user experience on slow connections