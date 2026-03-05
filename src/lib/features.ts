import type { Json } from '@/lib/supabase/database.types'

export interface OrgFeatures {
  protocols: boolean
  scheduling: boolean
  messaging: boolean
  labs: boolean
  notes: boolean
  stacktrax_link: boolean
}

const DEFAULTS: OrgFeatures = {
  protocols: true,
  scheduling: true,
  messaging: true,
  labs: true,
  notes: true,
  stacktrax_link: false,
}

export function parseFeatures(features: Json): OrgFeatures {
  if (typeof features === 'object' && features !== null && !Array.isArray(features)) {
    return {
      protocols: features.protocols !== false,
      scheduling: features.scheduling !== false,
      messaging: features.messaging !== false,
      labs: features.labs !== false,
      notes: features.notes !== false,
      stacktrax_link: features.stacktrax_link === true,
    }
  }
  return DEFAULTS
}

export function isFeatureEnabled(features: OrgFeatures, key: keyof OrgFeatures): boolean {
  return features[key]
}
