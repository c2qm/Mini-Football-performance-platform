import { PlayerProfile } from '../types'

export interface AvatarPreset {
  id: string
  emoji: string
  bg: string
}

// A small set of built-in avatars the player can pick without uploading a photo.
export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'p1', emoji: '⚽', bg: '#2D7A5B' },
  { id: 'p2', emoji: '🦁', bg: '#C9822B' },
  { id: 'p3', emoji: '🐯', bg: '#B5622B' },
  { id: 'p4', emoji: '🦅', bg: '#3050E0' },
  { id: 'p5', emoji: '🐺', bg: '#5B5B6B' },
  { id: 'p6', emoji: '🔥', bg: '#C63D3D' },
  { id: 'p7', emoji: '⚡', bg: '#B39328' },
  { id: 'p8', emoji: '🥇', bg: '#B8860B' },
  { id: 'p9', emoji: '🧤', bg: '#2B7FB5' },
  { id: 'p10', emoji: '🏆', bg: '#8A6D2B' },
]

export function getPreset(id?: string): AvatarPreset | undefined {
  return AVATAR_PRESETS.find(p => p.id === id)
}

/** Resolves what to render for a player's avatar: a photo data URL, a preset, or nothing (fall back to initial). */
export function resolveAvatar(player: PlayerProfile): { kind: 'photo'; url: string } | { kind: 'preset'; preset: AvatarPreset } | { kind: 'initial' } {
  if (player.avatarType === 'photo' && player.avatarValue) return { kind: 'photo', url: player.avatarValue }
  if (player.avatarType === 'preset' && player.avatarValue) {
    const preset = getPreset(player.avatarValue)
    if (preset) return { kind: 'preset', preset }
  }
  return { kind: 'initial' }
}
