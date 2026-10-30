import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

describe('Mobile Navbar & Hero Section Root-Cause Verification (Phase 4.2)', () => {
  const navbarFile = path.resolve(process.cwd(), 'src/components/public/Navbar.tsx');
  const homeFile = path.resolve(process.cwd(), 'src/components/public/Home.tsx');
  const indexCssFile = path.resolve(process.cwd(), 'src/index.css');

  const navbarContent = fs.readFileSync(navbarFile, 'utf-8');
  const homeContent = fs.readFileSync(homeFile, 'utf-8');
  const indexCssContent = fs.readFileSync(indexCssFile, 'utf-8');

  test('hero section uses native img element with object-cover and no multi-url CSS background', () => {
    // 1. Must NOT use broken multi-url CSS backgroundImage with gradient
    assert.strictEqual(
      homeContent.includes("url('/images/hero_interior_design_1792469679331.jpg')`"),
      false,
      'Hero section should not use duplicate multi-url CSS background string which breaks in WebKit'
    );

    // 2. Must render real img tag with object-cover
    assert.ok(
      homeContent.includes('<img') && homeContent.includes('object-cover') && homeContent.includes('object-center'),
      'Hero section must render a dedicated img element with object-cover for bulletproof GPU compositing'
    );
    assert.ok(
      homeContent.includes('src={heroBgImage}'),
      'Hero section must reference the actual project hero image asset'
    );

    // 3. Must have dark overlay
    assert.ok(
      homeContent.includes('bg-gradient-to-b from-[#28332F]'),
      'Hero section must include a gradient overlay for text legibility'
    );
  });

  test('mobile navbar provides minimum 44x44px touch target, Escape handling, and scroll lock', () => {
    // 1. Minimum 44x44px touch target on hamburger/close button
    assert.ok(
      navbarContent.includes('min-w-[44px]') && navbarContent.includes('min-h-[44px]'),
      'Mobile toggle button must have min-w-[44px] and min-h-[44px] for accessibility standards'
    );

    // 2. Escape key handling
    assert.ok(
      navbarContent.includes("e.key === 'Escape'"),
      'Navbar must listen for Escape key to close mobile menu'
    );

    // 3. Prevent background scrolling while menu is open
    assert.ok(
      navbarContent.includes("document.body.style.overflow = 'hidden'"),
      'Navbar must lock background scrolling while mobile drawer is open'
    );

    // 4. Zero duplicate Quote CTA in visible layout
    assert.ok(
      navbarContent.includes("mobileMenuOpen ? 'hidden md:flex' : 'hidden min-[380px]:flex'"),
      'Navbar must not duplicate Request a Quote button in header when mobile menu is open'
    );

    // 5. Consolidated language switching and WhatsApp
    assert.ok(
      navbarContent.includes('grid grid-cols-2 gap-2'),
      'Mobile menu must consolidate language switcher and WhatsApp into a compact action grid'
    );

    // 6. Preserved admin authentication checks
    assert.ok(
      navbarContent.includes('onOpenAuthModal()') && navbarContent.includes('currentUser.role'),
      'Admin entry must preserve authentication modal trigger without bypass'
    );

    // 7. All 5 navigation links present in mobile menu
    assert.ok(navbarContent.includes("setCurrentTab('home')"));
    assert.ok(navbarContent.includes("setCurrentTab('services')"));
    assert.ok(navbarContent.includes("setCurrentTab('portfolio')"));
    assert.ok(navbarContent.includes("setCurrentTab('about')"));
    assert.ok(navbarContent.includes("setCurrentTab('contact')"));
  });

  test('hero typography and statistics are responsive for mobile breakpoints (320px to 430px)', () => {
    // 1. Headline has compact mobile font size
    assert.ok(
      homeContent.includes('text-2xl min-[360px]:text-3xl sm:text-5xl lg:text-7xl'),
      'Hero heading must scale smoothly on narrow mobile screens'
    );

    // 2. Statistics grid uses 2-column mobile layout with optimized spacing
    assert.ok(
      homeContent.includes('grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 pt-10 sm:pt-16'),
      'Trust stats strip must use responsive 2-column mobile and 4-column desktop layout'
    );
  });

  test('viewport overflow protection is set on html and body', () => {
    assert.ok(
      indexCssContent.includes('overflow-x: hidden'),
      'Global CSS must prevent horizontal scroll overflow on html and body'
    );
  });
});
