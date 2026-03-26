import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'pet-documents'

/**
 * Upload a file to the pet-documents bucket.
 * Returns the storage path of the uploaded file.
 */
export async function uploadFile(
  supabase: SupabaseClient,
  path: string,
  file: File
): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true })

  if (error) {
    throw new Error(`Error uploading file: ${error.message}`)
  }

  return path
}

/**
 * Delete a file from the pet-documents bucket.
 */
export async function deleteFile(
  supabase: SupabaseClient,
  path: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([path])

  if (error) {
    throw new Error(`Error deleting file: ${error.message}`)
  }
}

/**
 * Generate a signed URL for a file in the pet-documents bucket.
 * Default expiration is 1 hour (3600 seconds).
 */
export async function getSignedUrl(
  supabase: SupabaseClient,
  path: string,
  expiresIn = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn)

  if (error || !data?.signedUrl) {
    throw new Error(`Error generating signed URL: ${error?.message ?? 'No URL returned'}`)
  }

  return data.signedUrl
}

/**
 * Build a storage path following the format:
 * {pet_id}/{record_type}/{record_id}/{file_name}
 */
export function buildStoragePath(
  petId: string,
  recordType: string,
  recordId: string,
  fileName: string
): string {
  return `${petId}/${recordType}/${recordId}/${fileName}`
}

/**
 * Validate a file against an accept list and max size.
 * Returns { valid: true } or { valid: false, error: "..." }.
 */
export function validateFile(
  file: File,
  acceptList: string[],
  maxSizeMB: number
): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024

  if (!acceptList.includes(file.type)) {
    return {
      valid: false,
      error: `Formato no soportado. Acepta: ${acceptList.join(', ')}.`,
    }
  }

  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `El archivo excede el límite de ${maxSizeMB} MB. Por favor selecciona un archivo más pequeño.`,
    }
  }

  return { valid: true }
}
