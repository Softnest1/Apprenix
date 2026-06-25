import { type SupabaseClient } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type FileError, type FileRejection, useDropzone } from 'react-dropzone'

interface FileWithPreview extends File {
  preview?: string
  errors: readonly FileError[]
}

type UseSupabaseUploadOptions = {
  /** Nom du bucket Supabase Storage cible */
  bucketName: string
  /** Dossier cible dans le bucket (optionnel) */
  path?: string
  /** Types MIME autorisés (ex: ['image/*', 'application/pdf']) */
  allowedMimeTypes?: string[]
  /** Taille maximale en octets par fichier */
  maxFileSize?: number
  /** Nombre maximum de fichiers simultanés */
  maxFiles?: number
  /** Durée de cache CDN en secondes (défaut : 3600) */
  cacheControl?: number
  /** Remplacer si le fichier existe déjà (défaut : false) */
  upsert?: boolean
  /** Instance du client Supabase */
  supabase: SupabaseClient
}

type UseSupabaseUploadReturn = ReturnType<typeof useSupabaseUpload>

const useSupabaseUpload = (options: UseSupabaseUploadOptions) => {
  const {
    bucketName,
    path,
    allowedMimeTypes = [],
    maxFileSize = Number.POSITIVE_INFINITY,
    maxFiles = 1,
    cacheControl = 3600,
    upsert = false,
    supabase,
  } = options

  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([])
  const [successes, setSuccesses] = useState<string[]>([])

  // ── Registre des URLs objet pour éviter les fuites mémoire ─────────────────
  const objectUrlsRef = useRef<Set<string>>(new Set())

  const createSafeObjectURL = useCallback((file: File): string => {
    const url = URL.createObjectURL(file)
    objectUrlsRef.current.add(url)
    return url
  }, [])

  // Libération des URLs à la destruction du composant
  useEffect(() => {
    const urls = objectUrlsRef.current
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
      urls.clear()
    }
  }, [])

  const isSuccess = useMemo(() => {
    if (errors.length === 0 && successes.length === 0) return false
    return errors.length === 0 && successes.length === files.length
  }, [errors.length, successes.length, files.length])

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const validFiles = acceptedFiles
        .filter((file) => !files.find((x) => x.name === file.name))
        .map((file) => {
          const f = file as FileWithPreview
          f.preview = createSafeObjectURL(file)
          f.errors = []
          return f
        })

      const invalidFiles = fileRejections.map(({ file, errors: errs }) => {
        const f = file as FileWithPreview
        f.preview = createSafeObjectURL(file)
        f.errors = errs
        return f
      })

      setFiles((prev) => [...prev, ...validFiles, ...invalidFiles])
    },
    [files, createSafeObjectURL],
  )

  const dropzoneProps = useDropzone({
    onDrop,
    noClick: true,
    accept: allowedMimeTypes.reduce<Record<string, string[]>>((acc, type) => {
      acc[type] = []
      return acc
    }, {}),
    maxSize: maxFileSize,
    maxFiles,
    multiple: maxFiles !== 1,
  })

  const onUpload = useCallback(async () => {
    if (files.length === 0) return
    setLoading(true)

    // Réessai sélectif : ne re-tente que les fichiers en erreur
    const filesWithErrors = new Set(errors.map((x) => x.name))
    const filesToUpload =
      filesWithErrors.size > 0
        ? [
            ...files.filter((f) => filesWithErrors.has(f.name)),
            ...files.filter((f) => !successes.includes(f.name) && !filesWithErrors.has(f.name)),
          ]
        : files

    const responses = await Promise.allSettled(
      filesToUpload.map(async (file) => {
        const filePath = path ? `${path}/${file.name}` : file.name
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: cacheControl.toString(),
            upsert,
          })
        if (error) {
          return { name: file.name, message: error.message }
        }
        return { name: file.name, message: undefined }
      }),
    )

    const uploadErrors: { name: string; message: string }[] = []
    const uploadSuccesses: string[] = []

    responses.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (result.value.message !== undefined) {
          uploadErrors.push({ name: result.value.name, message: result.value.message })
        } else {
          uploadSuccesses.push(result.value.name)
        }
      } else {
        // Promise rejetée (erreur réseau inattendue)
        uploadErrors.push({ name: 'inconnu', message: result.reason?.message ?? 'Erreur réseau' })
      }
    })

    setErrors(uploadErrors)
    setSuccesses((prev) => Array.from(new Set([...prev, ...uploadSuccesses])))
    setLoading(false)
  }, [files, path, bucketName, cacheControl, upsert, errors, successes, supabase])

  // Nettoyage automatique des erreurs quand tous les fichiers sont supprimés
  useEffect(() => {
    if (files.length === 0) {
      setErrors([])
      setSuccesses([])
      return
    }

    // Retirer l'erreur "too-many-files" si on repasse sous la limite
    if (files.length <= maxFiles) {
      setFiles((prev) => {
        let changed = false
        const updated = prev.map((file) => {
          if (file.errors.some((e) => e.code === 'too-many-files')) {
            const f = file as FileWithPreview
            f.errors = file.errors.filter((e) => e.code !== 'too-many-files')
            changed = true
            return f
          }
          return file
        })
        return changed ? updated : prev
      })
    }
  }, [files.length, maxFiles])

  return {
    files,
    setFiles,
    successes,
    isSuccess,
    loading,
    errors,
    setErrors,
    onUpload,
    maxFileSize,
    maxFiles,
    allowedMimeTypes,
    ...dropzoneProps,
  }
}

export { useSupabaseUpload, type UseSupabaseUploadOptions, type UseSupabaseUploadReturn }
