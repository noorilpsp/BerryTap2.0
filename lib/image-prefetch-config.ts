// Static mapping of images to prefetch for each route
// This is more reliable than parsing HTML in RSC streaming environments
export const imagePrefetchConfig: Record<string, string[]> = {
  '/test-prefetch/target': ['https://mlc4o7ewdhzlruqo.public.blob.vercel-storage.com/blob-HttYVUR4ap5kMNBZDa8EkCx9Zdo2Em'],
  '/admin/merchants/new': ['/BerryTapSVG.svg'],
  // Add more routes as needed
};

export function getImagesForRoute(route: string): string[] {
  // Try exact match first
  if (imagePrefetchConfig[route]) {
    return imagePrefetchConfig[route];
  }
  
  // Try with trailing slash
  if (imagePrefetchConfig[route + '/']) {
    return imagePrefetchConfig[route + '/'];
  }
  
  // Try without leading slash
  if (route.startsWith('/') && imagePrefetchConfig[route.slice(1)]) {
    return imagePrefetchConfig[route.slice(1)];
  }
  
  return [];
}