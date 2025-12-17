import Dexie, { type EntityTable } from 'dexie'

export interface DBUser {
  id: string
  username: string
  email: string
  level: number
  xp: number
  streak: number
  lastActive: Date
}

export interface DBLesson {
  id: string
  title: string
  category: string
  completed: boolean
  score: number
  timeSpent: number
  completedAt?: Date
}

export interface DBTrack {
  id: string
  name: string
  bestLapTime?: number
  attempts: number
  completed: boolean
}

export interface DBSettings {
  key: string
  value: any
}

class PilotageDatabase extends Dexie {
  users!: EntityTable<DBUser, 'id'>
  lessons!: EntityTable<DBLesson, 'id'>
  tracks!: EntityTable<DBTrack, 'id'>
  settings!: EntityTable<DBSettings, 'key'>

  constructor() {
    super('PilotageDatabase')
    
    this.version(1).stores({
      users: 'id, username, email, level',
      lessons: 'id, category, completed',
      tracks: 'id, name, completed',
      settings: 'key'
    })

    this.version(2).stores({
      users: 'id, username, email, level, lastActive',
      lessons: 'id, category, completed, score, completedAt',
      tracks: 'id, name, bestLapTime, attempts'
    }).upgrade(tx => {
      return tx.table('users').toCollection().modify(user => {
        user.lastActive = new Date()
      })
    })
  }
}

export const db = new PilotageDatabase()

// Fonctions utilitaires
export async function initDatabase() {
  try {
    // Vérifier si la base existe
    if (!await db.isOpen()) {
      await db.open()
    }

    // Créer un utilisateur par défaut si nécessaire
    const userCount = await db.users.count()
    if (userCount === 0) {
      await db.users.add({
        id: 'guest-' + Date.now(),
        username: 'Guest',
        email: '',
        level: 1,
        xp: 0,
        streak: 0,
        lastActive: new Date()
      })
    }

    console.log('Base de données initialisée')
    return true
  } catch (error) {
    console.error('Erreur initialisation DB:', error)
    return false
  }
}

export async function getUserProgress(userId: string) {
  return await db.lessons
    .where('completed').equals(1)
    .and(lesson => lesson.id.startsWith(userId))
    .toArray()
}

export async function saveLessonProgress(
  userId: string,
  lessonId: string,
  score: number,
  timeSpent: number
) {
  await db.lessons.put({
    id: `${userId}-${lessonId}`,
    title: lessonId,
    category: lessonId.split('-')[0],
    completed: true,
    score,
    timeSpent,
    completedAt: new Date()
  })

  // Mettre à jour l'utilisateur
  await db.users.update(userId, {
    xp: db.users.get(userId).then(user => (user?.xp || 0) + score),
    lastActive: new Date()
  })
}

export async function updateTrackRecord(
  trackId: string,
  lapTime: number,
  userId: string
) {
  const existing = await db.tracks.get(trackId)
  
  if (!existing || lapTime < (existing.bestLapTime || Infinity)) {
    await db.tracks.put({
      id: trackId,
      name: trackId,
      bestLapTime: lapTime,
      attempts: (existing?.attempts || 0) + 1,
      completed: true
    })
    return true // Nouveau record
  }
  
  await db.tracks.update(trackId, {
    attempts: (existing.attempts || 0) + 1
  })
  
  return false
}

export async function getUserStats(userId: string) {
  const user = await db.users.get(userId)
  const lessons = await db.lessons
    .where('completed').equals(1)
    .and(lesson => lesson.id.startsWith(userId))
    .toArray()
  const tracks = await db.tracks.where('completed').equals(1).toArray()

  return {
    user,
    totalLessons: lessons.length,
    totalXP: lessons.reduce((sum, l) => sum + l.score, 0),
    averageScore: lessons.length > 0 
      ? lessons.reduce((sum, l) => sum + l.score, 0) / lessons.length 
      : 0,
    tracksCompleted: tracks.length,
    totalTimeSpent: lessons.reduce((sum, l) => sum + l.timeSpent, 0),
    streak: user?.streak || 0
  }
}

// Sauvegarde/restauration
export async function exportUserData(userId: string) {
  const [user, lessons, tracks, settings] = await Promise.all([
    db.users.get(userId),
    db.lessons.where('id').startsWith(userId).toArray(),
    db.tracks.toArray(),
    db.settings.toArray()
  ])

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    user,
    lessons,
    tracks,
    settings
  }
}

export async function importUserData(data: any) {
  await db.transaction('rw', db.users, db.lessons, db.tracks, db.settings, async () => {
    if (data.user) {
      await db.users.put(data.user)
    }
    if (data.lessons) {
      await db.lessons.bulkPut(data.lessons)
    }
    if (data.tracks) {
      await db.tracks.bulkPut(data.tracks)
    }
    if (data.settings) {
      await db.settings.bulkPut(data.settings)
    }
  })
}
