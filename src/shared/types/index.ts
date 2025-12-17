export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  level: number
  xp: number
  streak: number
  achievements: Achievement[]
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  lessons: Lesson[]
  prerequisites?: string[]
  unlocked: boolean
}

export interface Lesson {
  id: string
  title: string
  description: string
  categoryId: string
  order: number
  duration: number // en minutes
  type: 'theory' | 'practice' | 'simulation' | 'quiz'
  content: {
    videos?: string[]
    images?: string[]
    text?: string
    quiz?: QuizQuestion[]
    simulationParams?: SimulationParams
  }
  objectives: string[]
  difficulty: number // 1-5
  xpReward: number
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface SimulationParams {
  trackId: string
  carModel: string
  weather: 'clear' | 'rain' | 'snow'
  timeOfDay: 'day' | 'night'
  challenges: Challenge[]
}

export interface Challenge {
  id: string
  type: 'braking' | 'cornering' | 'acceleration' | 'overtaking'
  targetValue: number
  tolerance: number
  instructions: string
}

export interface Progress {
  id: string
  userId: string
  lessonId: string
  score: number // 0-100
  completedAt: string
  attempts: number
  bestTime?: number
  mistakes?: Mistake[]
}

export interface Mistake {
  id: string
  type: string
  timestamp: number
  severity: 'low' | 'medium' | 'high'
  feedback: string
}

export interface Track {
  id: string
  name: string
  country: string
  length: number // en mètres
  turns: number
  type: 'circuit' | 'rally' | 'street' | 'offroad'
  difficulty: number // 1-5
  image: string
  layout: Coordinate[]
  bestLapTime?: number
}

export interface Coordinate {
  x: number
  y: number
  z: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
  progress: number // 0-100
}

export interface Car {
  id: string
  model: string
  brand: string
  category: Category['id']
  power: number // ch
  weight: number // kg
  image: string
  sound: string
  handling: number // 1-10
  acceleration: number // 1-10
  braking: number // 1-10
}
