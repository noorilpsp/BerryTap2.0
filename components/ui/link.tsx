"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type PrefetchImage = {
  srcset: string;
  sizes: string;
  src: string;
  alt: string;
  loading: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function prefetchImages(href: string) {
  if (!href.startsWith("/") || href.startsWith("/order") || href === "/") {
    return [];
  }
  const url = new URL(href, window.location.href);
  const imageResponse = await fetch(`/api/prefetch-images${url.pathname}`);
  // only throw in dev
  if (!imageResponse.ok && process.env.NODE_ENV === "development") {
    throw new Error("Failed to prefetch images");
  }
  const { images } = await imageResponse.json();
  return images as PrefetchImage[];
}

const seen = new Set<string>();
const imageCache = new Map<string, PrefetchImage[]>();
const permissionsPrefetched = new Set<string>(); // Track if permissions have been prefetched

function prefetchPermissions() {
  // Only prefetch once per session
  if (permissionsPrefetched.has('admin')) {
    return;
  }
  permissionsPrefetched.add('admin');
  // Prefetch permissions in background (non-blocking)
  fetch('/api/user/permissions', { credentials: 'include' }).catch(() => {
    // Ignore errors - this is just a prefetch
  });
}

export const Link: typeof NextLink = (({ children, ...props }) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (props.prefetch === false) return;

    const linkElement = linkRef.current;
    if (!linkElement) return;

    let prefetchTimeout: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          prefetchTimeout = setTimeout(async () => {
            router.prefetch(String(props.href));
            await sleep(0);

            if (!imageCache.has(String(props.href))) {
              void prefetchImages(String(props.href)).then((images) => {
                imageCache.set(String(props.href), images);
              }, console.error);
            }

            // Prefetch permissions if this is an admin route
            if (String(props.href).startsWith('/admin')) {
              prefetchPermissions();
            }

            observer.unobserve(entry.target);
          }, 300);
        } else if (prefetchTimeout) {
          clearTimeout(prefetchTimeout);
          prefetchTimeout = null;
        }
      },
      { rootMargin: "0px", threshold: 0.1 },
    );

    observer.observe(linkElement);

    return () => {
      observer.disconnect();
      if (prefetchTimeout) {
        clearTimeout(prefetchTimeout);
      }
    };
  }, [props.href, props.prefetch, router]);

  return (
    <NextLink
      ref={linkRef}
      prefetch={false}
      onMouseEnter={() => {
        router.prefetch(String(props.href));
        const href = String(props.href);
        const images = imageCache.get(href) || [];
        if (images.length === 0) {
          // Fetch images if cache is empty (for immediate hover prefetching)
          void prefetchImages(href).then((fetchedImages) => {
            imageCache.set(href, fetchedImages);
            for (const image of fetchedImages) {
              prefetchImage(image);
            }
          }).catch(console.error);
        } else {
          for (const image of images) {
            prefetchImage(image);
          }
        }
      }}
      onMouseDown={(e) => {
        const url = new URL(String(props.href), window.location.href);
        if (
          url.origin === window.location.origin &&
          e.button === 0 &&
          !e.altKey &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey
        ) {
          e.preventDefault();
          router.push(String(props.href));
        }
      }}
      {...props}
    >
      {children}
    </NextLink>
  );
}) as typeof NextLink;

function prefetchImage(image: PrefetchImage) {
  // Use srcset as key if available, otherwise use src
  // This matches NextFaster-main's behavior
  const key = image.srcset || image.src;
  
  // Skip if no key, already seen, or explicitly lazy
  // Note: null/undefined loading means not lazy, so we should prefetch
  if (!key || seen.has(key) || image.loading === "lazy") {
    return;
  }
  
  const img = new Image();
  img.decoding = "async";
  // @ts-expect-error - fetchPriority is experimental
  img.fetchPriority = "low";
  
  // Set sizes if available
  if (image.sizes) {
    img.sizes = image.sizes;
  }
  
  // Mark as seen before setting src (prevents duplicate prefetches)
  seen.add(key);
  
  // Set srcset if it exists (Next.js optimized images have this)
  if (image.srcset) {
    img.srcset = image.srcset;
  }
  
  // Always set src - this triggers the actual prefetch
  img.src = image.src;
  
  // Set alt for accessibility
  if (image.alt) {
    img.alt = image.alt;
  }
}
