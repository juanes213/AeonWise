import { useSupabase } from '../lib/supabase/SupabaseProvider';

export interface PointsTransaction {
  source: string;
  points: number;
  details?: Record<string, any>;
}

export class PointsService {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async awardPoints(userId: string, transaction: PointsTransaction): Promise<boolean> {
    try {
      // First, record the points transaction
      const { error: pointsError } = await this.supabase
        .from('rank_points')
        .insert({
          user_id: userId,
          source: transaction.source,
          points: transaction.points,
          details: transaction.details || {}
        });

      if (pointsError) {
        console.error('Error recording points transaction:', pointsError);
        return false;
      }

      // Then update the user's total points
      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({
          points: this.supabase.raw(`points + ${transaction.points}`),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user points:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error awarding points:', error);
      return false;
    }
  }

  async getPointsHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('rank_points')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching points history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching points history:', error);
      return [];
    }
  }

  calculateRank(points: number): string {
    if (points >= 1601) return 'cosmic_sage';
    if (points >= 1201) return 'galactic_guide';
    if (points >= 801) return 'comet_crafter';
    if (points >= 501) return 'astral_apprentice';
    if (points >= 251) return 'nebula_novice';
    return 'starspark';
  }

  getPointsForNextRank(currentPoints: number): { nextRank: string; pointsNeeded: number } {
    const ranks = [
      { name: 'starspark', threshold: 0 },
      { name: 'nebula_novice', threshold: 251 },
      { name: 'astral_apprentice', threshold: 501 },
      { name: 'comet_crafter', threshold: 801 },
      { name: 'galactic_guide', threshold: 1201 },
      { name: 'cosmic_sage', threshold: 1601 }
    ];

    for (let i = 0; i < ranks.length; i++) {
      if (currentPoints < ranks[i].threshold) {
        return {
          nextRank: ranks[i].name,
          pointsNeeded: ranks[i].threshold - currentPoints
        };
      }
    }

    return {
      nextRank: 'cosmic_sage',
      pointsNeeded: 0
    };
  }
}

// Hook to use points service
export const usePointsService = () => {
  const supabase = useSupabase();
  return new PointsService(supabase);
};