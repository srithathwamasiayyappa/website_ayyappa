import React from 'react';
import DevotionalCategoryPage, {
  DEVOTIONAL_CATEGORIES,
  resolveDeityId
} from './DevotionalCategoryPage';
import { DEFAULT_DEITIES_LIST } from './DeitySelectionModal';

export { DEVOTIONAL_CATEGORIES, resolveDeityId };
export const DEITIES = DEFAULT_DEITIES_LIST;

export const subcategoryConfigs = DEVOTIONAL_CATEGORIES;

/**
 * PoojaListingPage
 * Unified Devotional Subcategory Page Component (delegates to DevotionalCategoryPage master template)
 */
export default function PoojaListingPage({ category = 'pooja' }) {
  return <DevotionalCategoryPage category={category} />;
}
