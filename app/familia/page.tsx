'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Member {
  id: string
  user_id: string
  role: 'admin' | 'member'
  email: string | null
  name: string | null
}

export default function FamiliaPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Invite code state
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteCopied, setInviteCopied] = useState(false)

  // Join state
  const [joinCode, setJoinCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinMessage, setJoinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/family/members')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Error ${res.status}`)
      }
      const data: Member[] = await res.json()
      setMembers(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar los miembros')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)
      await loadMembers()
    }
    init()
  }, [loadMembers])

  const currentMember = members.find((m) => m.user_id === currentUserId)
  const isAdmin = currentMember?.role === 'admin'
  const adminCount = members.filter((m) => m.role === 'admin').length

  async function handleGenerateInvite() {
    setInviteLoading(true)
    setInviteCode(null)
    try {
      const res = await fetch('/api/family/invite', { method: 'POST' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? `Error ${res.status}`)
      setInviteCode(body.code)
      setInviteCopied(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al generar el código')
    } finally {
      setInviteLoading(false)
    }
  }

  async function handleCopyCode() {
    if (!inviteCode) return
    await navigator.clipboard.writeText(inviteCode)
    setInviteCopied(true)
    setTimeout(() => setInviteCopied(false), 2000)
  }

  async function handleJoin() {
    if (!joinCode.trim()) return
    setJoinLoading(true)
    setJoinMessage(null)
    try {
      const res = await fetch('/api/family/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? `Error ${res.status}`)
      setJoinMessage({ type: 'success', text: '¡Te uniste a la familia exitosamente!' })
      setJoinCode('')
      await loadMembers()
    } catch (err: unknown) {
      setJoinMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al unirse' })
    } finally {
      setJoinLoading(false)
    }
  }

  async function handleDelete(memberId: string) {
    setDeletingId(memberId)
    try {
      const res = await fetch(`/api/family/members/${memberId}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Error ${res.status}`)
      }
      await loadMembers()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el miembro')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="pt-24 px-6 max-w-2xl mx-auto pb-32">
      {/* Header */}
      <section className="mb-8">
        <span className="text-primary font-bold text-sm tracking-wider uppercase">Familia</span>
        <h2 className="text-4xl font-headline font-extrabold text-on-surface mt-1 tracking-tight">
          Mi Familia
        </h2>
        <p className="text-on-surface-variant text-lg mt-1">Gestiona los miembros de tu grupo familiar.</p>
      </section>

      {/* Members list */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-xl">group</span>
          <span className="font-headline font-bold text-sm text-on-surface uppercase tracking-wider">Miembros</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-error-container/20 rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-error mb-3 block">error</span>
            <p className="text-on-surface font-medium mb-4">{error}</p>
            <button
              onClick={loadMembers}
              className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-sm active:scale-95 transition-all"
            >
              Reintentar
            </button>
          </div>
        ) : members.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant mb-3 block">group_off</span>
            <p className="text-on-surface-variant font-medium">No hay miembros en tu familia</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const isSelf = member.user_id === currentUserId
              const canDelete = isAdmin && !(isSelf && adminCount === 1)
              const displayName = member.name ?? member.email ?? 'Usuario'

              return (
                <div
                  key={member.id}
                  className="bg-surface-container-lowest rounded-xl px-5 py-4 ambient-shadow flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-container/40 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">person</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-on-surface text-sm truncate">{displayName}</span>
                      {isSelf && (
                        <span className="text-[10px] font-medium text-on-surface-variant">(tú)</span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          member.role === 'admin'
                            ? 'bg-primary-container/50 text-on-primary-container'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {member.role === 'admin' ? 'Admin' : 'Miembro'}
                      </span>
                    </div>
                    {member.email && (
                      <p className="text-xs text-on-surface-variant truncate mt-0.5">{member.email}</p>
                    )}
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(member.id)}
                      disabled={deletingId === member.id}
                      className="shrink-0 w-8 h-8 rounded-full bg-error-container/20 flex items-center justify-center text-error active:scale-90 transition-all disabled:opacity-50"
                      aria-label={`Eliminar a ${displayName}`}
                    >
                      {deletingId === member.id ? (
                        <div className="w-4 h-4 rounded-full border-2 border-error border-t-transparent animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-base">person_remove</span>
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Generate invite code — admin only */}
      {isAdmin && (
        <section className="mb-8">
          <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary text-xl">share</span>
              <span className="font-headline font-bold text-sm text-on-surface">Invitar a la familia</span>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">
              Genera un código de invitación válido por 7 días y compártelo con quien quieras agregar.
            </p>
            <button
              onClick={handleGenerateInvite}
              disabled={inviteLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-semibold text-sm active:scale-95 transition-all disabled:opacity-60"
            >
              {inviteLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-base">add_link</span>
              )}
              Generar código de invitación
            </button>

            {inviteCode && (
              <div className="mt-4 bg-secondary-container/20 rounded-xl p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-on-surface-variant mb-1">Código de invitación</p>
                  <p className="font-headline font-extrabold text-2xl text-on-surface tracking-widest">
                    {inviteCode}
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-on-secondary font-semibold text-sm active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-base">
                    {inviteCopied ? 'check' : 'content_copy'}
                  </span>
                  {inviteCopied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Join a family */}
      <section>
        <div className="bg-surface-container-lowest rounded-xl p-6 ambient-shadow">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-tertiary text-xl">group_add</span>
            <span className="font-headline font-bold text-sm text-on-surface">Unirse a una familia</span>
          </div>
          <p className="text-sm text-on-surface-variant mb-4">
            Ingresa el código que te compartieron para unirte a otra familia.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Ej: A1B2C3D4"
              maxLength={8}
              className="flex-1 bg-surface-container rounded-lg px-4 py-2.5 text-sm text-on-surface font-mono font-bold tracking-widest placeholder:font-sans placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleJoin}
              disabled={joinLoading || !joinCode.trim()}
              className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-tertiary text-on-tertiary font-semibold text-sm active:scale-95 transition-all disabled:opacity-60"
            >
              {joinLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-on-tertiary border-t-transparent animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-base">login</span>
              )}
              Unirse
            </button>
          </div>

          {joinMessage && (
            <div
              className={`mt-3 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                joinMessage.type === 'success'
                  ? 'bg-secondary-container/30 text-on-secondary-container'
                  : 'bg-error-container/20 text-error'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {joinMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              {joinMessage.text}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
