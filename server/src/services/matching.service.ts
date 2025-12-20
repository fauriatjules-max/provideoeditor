import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MatchScore {
  userId: string;
  score: number;
  reasons: string[];
}

export class MatchingService {
  /**
   * Trouve les meilleurs matches pour un besoin
   */
  static async findMatchesForNeed(needId: string, limit = 20): Promise<MatchScore[]> {
    const need = await prisma.need.findUnique({
      where: { id: needId },
      include: { user: true }
    });

    if (!need) {
      throw new Error('Need not found');
    }

    // Chercher les utilisateurs avec les compétences correspondantes
    const potentialHelpers = await prisma.skill.findMany({
      where: {
        category: need.category,
        OR: [
          { name: { contains: need.title, mode: 'insensitive' } },
          { description: { contains: need.title, mode: 'insensitive' } }
        ]
      },
      include: {
        user: {
          include: {
            credits: true,
            ratingsReceived: true,
            _count: {
              select: {
                exchangesAsHelper: true,
                exchangesAsNeeder: true
              }
            }
          }
        }
      }
    });

    // Calculer les scores pour chaque helper potentiel
    const scoredHelpers: MatchScore[] = [];

    for (const skill of potentialHelpers) {
      // Éviter de se matcher avec soi-même
      if (skill.userId === need.userId) continue;

      let score = 0;
      const reasons: string[] = [];

      // 1. Distance (si les deux ont une localisation)
      if (need.user.city && skill.user.city) {
        const distanceScore = this.calculateDistanceScore(
          need.user.city,
          skill.user.city
        );
        score += distanceScore;
        if (distanceScore > 0) reasons.push('Proximité géographique');
      }

      // 2. Réputation (basée sur les ratings)
      const avgRating = skill.user.ratingsReceived.length > 0
        ? skill.user.ratingsReceived.reduce((sum, r) => sum + r.score, 0) /
          skill.user.ratingsReceived.length
        : 0;

      score += avgRating * 10;
      if (avgRating >= 4) reasons.push('Excellente réputation');

      // 3. Expérience (nombre d'échanges)
      const experience = skill.user._count.exchangesAsHelper;
      score += Math.min(experience, 50); // Cap à 50
      if (experience >= 10) reasons.push('Expérimenté');

      // 4. Niveau de compétence
      score += skill.level * 5;
      if (skill.level >= 4) reasons.push('Expert dans le domaine');

      // 5. Crédits disponibles
      if (skill.user.credits.balance >= 10) {
        score += 10;
        reasons.push('Crédits disponibles');
      }

      // 6. Réactivité (basée sur le dernier login)
      if (skill.user.lastLogin) {
        const daysSinceLastLogin = Math.floor(
          (new Date().getTime() - skill.user.lastLogin.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastLogin <= 1) {
          score += 20;
          reasons.push('Actif récemment');
        } else if (daysSinceLastLogin <= 7) {
          score += 10;
        }
      }

      // 7. Vérification email
      if (skill.user.isVerified) {
        score += 15;
        reasons.push('Email vérifié');
      }

      // 8. Abonnement Premium/Pro
      if (skill.user.subscriptionType === 'PREMIUM') score += 25;
      if (skill.user.subscriptionType === 'PRO') score += 40;

      // 9. Match exact sur le nom de compétence
      if (skill.name.toLowerCase() === need.title.toLowerCase()) {
        score += 30;
        reasons.push('Compétence exacte');
      }

      scoredHelpers.push({
        userId: skill.userId,
        score: Math.round(score),
        reasons
      });
    }

    // Trier par score et limiter
    return scoredHelpers
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Trouve les besoins correspondant à une compétence
   */
  static async findNeedsForSkill(skillId: string, limit = 20): Promise<MatchScore[]> {
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: { user: true }
    });

    if (!skill) {
      throw new Error('Skill not found');
    }

    const potentialNeeds = await prisma.need.findMany({
      where: {
        category: skill.category,
        status: 'OPEN',
        NOT: { userId: skill.userId },
        OR: [
          { title: { contains: skill.name, mode: 'insensitive' } },
          { description: { contains: skill.name, mode: 'insensitive' } }
        ]
      },
      include: {
        user: {
          include: {
            credits: true,
            ratingsReceived: true,
            _count: {
              select: {
                exchangesAsHelper: true,
                exchangesAsNeeder: true
              }
            }
          }
        }
      }
    });

    const scoredNeeds: MatchScore[] = [];

    for (const need of potentialNeeds) {
      let score = 0;
      const reasons: string[] = [];

      // Similar scoring logic as above...

      scoredNeeds.push({
        userId: need.userId,
        score: Math.round(score),
        reasons
      });
    }

    return scoredNeeds
      .sort((a, b)
