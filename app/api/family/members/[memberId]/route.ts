import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { createAdminSupabase } from '@/lib/supabase-admin'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createAdminSupabase()

  // Check the requesting user is an admin
  const { data: requesterMembership } = await serviceClient
    .from('family_members')
    .select('family_id, role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .limit(1)
    .single()

  if (!requesterMembership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const familyId = requesterMembership.family_id

  // Find the member to delete within the same family
  const { data: targetMember } = await serviceClient
    .from('family_members')
    .select('id, role')
    .eq('id', memberId)
    .eq('family_id', familyId)
    .limit(1)
    .single()

  if (!targetMember) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // If the target is an admin, ensure they are not the only admin
  if (targetMember.role === 'admin') {
    const { count } = await serviceClient
      .from('family_members')
      .select('id', { count: 'exact', head: true })
      .eq('family_id', familyId)
      .eq('role', 'admin')

    if ((count ?? 0) <= 1) {
      return NextResponse.json({ error: 'Cannot remove the only admin' }, { status: 422 })
    }
  }

  const { error } = await serviceClient
    .from('family_members')
    .delete()
    .eq('id', memberId)

  if (error) {
    console.error('[family/members/delete] Error deleting member:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
