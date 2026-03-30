'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadFile, deleteFile, getSignedUrl, validateFile } from '@/lib/storage'

interface FileUploadProps {
  currentFileUrl: string | null
  accept: string
  maxSizeMB: number
  storagePath: string
  onUpload: (url: string) => void
  onRemove: () => void
}

export default function FileUpload({
  currentFileUrl,
  accept,
  maxSizeMB,
  storagePath,
  onUpload,
  onRemove,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPdf, setIsPdf] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parse accept string into a list of MIME types for validation
  function parseAcceptList(acceptStr: string): string[] {
    return acceptStr.split(',').map((s) => s.trim())
  }

  // Resolve wildcard MIME types (e.g. "image/*") against a concrete type
  function matchesMime(fileType: string, acceptList: string[]): boolean {
    return acceptList.some((pattern) => {
      if (pattern === fileType) return true
      if (pattern.endsWith('/*')) {
        const prefix = pattern.replace('/*', '/')
        return fileType.startsWith(prefix)
      }
      // Extension-based patterns like ".pdf"
      if (pattern.startsWith('.')) {
        const ext = pattern.slice(1).toLowerCase()
        if (ext === 'pdf' && fileType === 'application/pdf') return true
        if (['jpg', 'jpeg'].includes(ext) && fileType === 'image/jpeg') return true
        if (ext === 'png' && fileType === 'image/png') return true
      }
      return false
    })
  }

  // Build the concrete MIME list for validateFile (resolve wildcards)
  function resolveAcceptToMimes(acceptStr: string): string[] {
    const patterns = parseAcceptList(acceptStr)
    const mimes: string[] = []
    for (const p of patterns) {
      if (p === 'image/*') {
        mimes.push('image/jpeg', 'image/png')
      } else if (p.startsWith('.')) {
        const ext = p.slice(1).toLowerCase()
        if (ext === 'pdf') mimes.push('application/pdf')
        if (['jpg', 'jpeg'].includes(ext)) mimes.push('image/jpeg')
        if (ext === 'png') mimes.push('image/png')
      } else {
        mimes.push(p)
      }
    }
    return [...new Set(mimes)]
  }

  // Load signed URL for existing file
  useEffect(() => {
    if (!currentFileUrl) {
      setPreviewUrl(null)
      setIsPdf(false)
      return
    }

    let cancelled = false

    async function loadPreview() {
      try {
        const url = await getSignedUrl(supabase, currentFileUrl!)
        if (!cancelled) {
          setPreviewUrl(url)
          setIsPdf(
            currentFileUrl!.toLowerCase().endsWith('.pdf')
          )
        }
      } catch {
        if (!cancelled) setPreviewUrl(null)
      }
    }

    loadPreview()
    return () => { cancelled = true }
  }, [currentFileUrl])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Check MIME match (supports wildcards)
    const acceptList = parseAcceptList(accept)
    if (!matchesMime(file.type, acceptList)) {
      const resolved = resolveAcceptToMimes(accept)
      setError(`Formato no soportado. Acepta: ${resolved.join(', ')}.`)
      resetInput()
      return
    }

    // Validate size
    const resolved = resolveAcceptToMimes(accept)
    const validation = validateFile(file, resolved, maxSizeMB)
    if (!validation.valid) {
      setError(validation.error!)
      resetInput()
      return
    }

    // Upload
    setUploading(true)
    try {
      const fullPath = `${storagePath}/${file.name}`

      // If replacing, delete old file first
      if (currentFileUrl) {
        try {
          await deleteFile(supabase, currentFileUrl)
        } catch {
          // Ignore delete errors on replace
        }
      }

      await uploadFile(supabase, fullPath, file)
      onUpload(fullPath)
    } catch (err) {
      console.error('Upload error:', err)
      setError(`Error al subir el archivo: ${err instanceof Error ? err.message : 'Intenta de nuevo.'}`)
    } finally {
      setUploading(false)
      resetInput()
    }
  }

  async function handleRemove() {
    if (!currentFileUrl) return
    setError(null)
    try {
      await deleteFile(supabase, currentFileUrl)
    } catch {
      // Ignore delete errors
    }
    onRemove()
  }

  function resetInput() {
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">attach_file</span>
          Archivo adjunto
        </span>
      </label>

      {/* Preview area */}
      {currentFileUrl && previewUrl && (
        <div className="mb-3 rounded-lg bg-surface-container p-3 flex items-center gap-3">
          {isPdf ? (
            <div className="w-12 h-12 rounded-lg bg-error-container/15 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-error text-2xl">picture_as_pdf</span>
            </div>
          ) : (
            <img
              src={previewUrl}
              alt="Vista previa"
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-on-surface truncate">
              {currentFileUrl.split('/').pop()}
            </p>
            <p className="text-xs text-outline mt-0.5">
              {isPdf ? 'Documento PDF' : 'Imagen'}
            </p>
          </div>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary hover:bg-primary-container/40 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 bg-surface-container rounded-lg px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">
            {uploading ? 'hourglass_empty' : currentFileUrl ? 'swap_horiz' : 'upload_file'}
          </span>
          {uploading ? 'Subiendo...' : currentFileUrl ? 'Reemplazar' : 'Subir archivo'}
        </button>

        {currentFileUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="flex items-center justify-center gap-1.5 bg-error-container/15 rounded-lg px-4 py-3 text-sm text-error hover:bg-error-container/30 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Eliminar
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-error text-xs mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">error</span>
          {error}
        </p>
      )}
    </div>
  )
}
