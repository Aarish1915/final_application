# Font Files Organization

Please organize your font files in the following structure:

```
public/fonts/
├── syne/
│   ├── Syne-Bold.woff2
│   ├── Syne-Bold.ttf
│   ├── Syne-Regular.woff2
│   └── Syne-Regular.ttf
│
├── Lora/
│   └── static/
│       ├── Lora-Bold.ttf
│       ├── Lora-SemiBold.ttf
│       ├── Lora-Medium.ttf
│       ├── Lora-Regular.ttf
│       └── Lora-Italic.ttf
│
├── moranga-font-family/
│   ├── Moranga-Black.otf
│   ├── Moranga-Bold.otf
│   ├── Moranga-Medium.otf
│   ├── Moranga-Regular.otf
│   └── Moranga-Light.otf
│
├── high_spirited/
│   └── HighSpirited.ttf
│
└── avenir-font/
    ├── AvenirLTStd-Black.otf
    ├── AvenirLTStd-Heavy.otf
    ├── AvenirLTStd-Medium.otf
    ├── AvenirLTStd-Book.otf
    ├── AvenirLTStd-Roman.otf
    ├── AvenirLTStd-Light.otf
    └── AvenirLTStd-BookOblique.otf
```

## Font Usage in the Project

- **Syne** (font-logo): Logo and branding
- **Lora** (font-heading): Headings and sub-headings
- **Avenir LT Std** (font-body): Body copy and main text
- **High Spirited** (font-accent): Accent and decorative text
- **Moranga** (font-creative): Creative headers and social content

## How to Use in Components

```tsx
// Logo text
<span className="font-logo">ingri</span>

// Headings
<h1 className="font-heading">Heading Text</h1>

// Body text
<p className="font-body">Body text content</p>

// Accent/decorative
<span className="font-accent">Special Text</span>

// Creative headers
<h2 className="font-creative">Creative Header</h2>
```
