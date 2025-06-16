import type { SessionFlavor } from '../types/api';

/**
 * Sort flavors by their flavor_order field
 * @param flavors - Array of flavors to sort
 * @returns Sorted array of flavors
 */
export function sortFlavorsByOrder(flavors: SessionFlavor[] | undefined): SessionFlavor[] {
  if (!flavors || flavors.length === 0) {
    return [];
  }
  
  return [...flavors].sort((a, b) => {
    // If both have flavor_order, sort by that
    if (a.flavor_order !== undefined && b.flavor_order !== undefined) {
      return a.flavor_order - b.flavor_order;
    }
    // If only a has flavor_order, a comes first
    if (a.flavor_order !== undefined) {
      return -1;
    }
    // If only b has flavor_order, b comes first
    if (b.flavor_order !== undefined) {
      return 1;
    }
    // If neither has flavor_order, maintain original order
    return 0;
  });
}