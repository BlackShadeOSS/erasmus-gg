import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get counts for each entity
    const [usersRes, codesRes, professionsRes, vocabularyRes, videosRes, gamesRes] = await Promise.all([
      // Users stats
      supabaseAdmin
        .from('users')
        .select('role, created_at, last_login', { count: 'exact' }),
      
      // Activation codes stats
      supabaseAdmin
        .from('activation_codes')
        .select('status, used_count, max_uses, expires_at', { count: 'exact' }),
      
      // Professions stats
      supabaseAdmin
        .from('professions')
        .select('is_active', { count: 'exact' }),
      
      // Vocabulary stats
      supabaseAdmin
        .from('vocabulary')
        .select('difficulty_level, is_active', { count: 'exact' }),
      
      // Videos stats
      supabaseAdmin
        .from('videos')
        .select('difficulty_level, is_active', { count: 'exact' }),
      
      // Games stats
      supabaseAdmin
        .from('games')
        .select('game_type, difficulty_level, is_active', { count: 'exact' })
    ]);

    // Calculate statistics
    const stats = {
      users: {
        total: usersRes.count || 0,
        admins: usersRes.data?.filter((u: any) => u.role === 'admin').length || 0,
        regular: usersRes.data?.filter((u: any) => u.role === 'user').length || 0,
        recentLogins: usersRes.data?.filter((u: any) => {
          if (!u.last_login) return false;
          const lastLogin = new Date(u.last_login);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return lastLogin > weekAgo;
        }).length || 0,
        newThisMonth: usersRes.data?.filter((u: any) => {
          const created = new Date(u.created_at);
          const now = new Date();
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length || 0
      },
      activationCodes: {
        total: codesRes.count || 0,
        used: codesRes.data?.filter((c: any) => c.status === 'used' || c.used_count >= c.max_uses).length || 0,
        unused: codesRes.data?.filter((c: any) => c.status === 'active' && c.used_count < c.max_uses).length || 0,
        expired: codesRes.data?.filter((c: any) => {
          if (c.status === 'expired') return true;
          if (!c.expires_at) return false;
          return new Date(c.expires_at) < new Date();
        }).length || 0
      },
      professions: {
        total: professionsRes.count || 0,
        active: professionsRes.data?.filter((p: any) => p.is_active).length || 0,
        inactive: professionsRes.data?.filter((p: any) => !p.is_active).length || 0
      },
      vocabulary: {
        total: vocabularyRes.count || 0,
        active: vocabularyRes.data?.filter((v: any) => v.is_active).length || 0,
        byLevel: {
          level1: vocabularyRes.data?.filter((v: any) => v.difficulty_level === 1).length || 0,
          level2: vocabularyRes.data?.filter((v: any) => v.difficulty_level === 2).length || 0,
          level3: vocabularyRes.data?.filter((v: any) => v.difficulty_level === 3).length || 0,
          level4: vocabularyRes.data?.filter((v: any) => v.difficulty_level === 4).length || 0,
          level5: vocabularyRes.data?.filter((v: any) => v.difficulty_level === 5).length || 0
        }
      },
      videos: {
        total: videosRes.count || 0,
        active: videosRes.data?.filter((v: any) => v.is_active).length || 0,
        byLevel: {
          level1: videosRes.data?.filter((v: any) => v.difficulty_level === 1).length || 0,
          level2: videosRes.data?.filter((v: any) => v.difficulty_level === 2).length || 0,
          level3: videosRes.data?.filter((v: any) => v.difficulty_level === 3).length || 0,
          level4: videosRes.data?.filter((v: any) => v.difficulty_level === 4).length || 0,
          level5: videosRes.data?.filter((v: any) => v.difficulty_level === 5).length || 0
        }
      },
      games: {
        total: gamesRes.count || 0,
        active: gamesRes.data?.filter((g: any) => g.is_active).length || 0,
        byType: {
          flashcards: gamesRes.data?.filter((g: any) => g.game_type === 'flashcards').length || 0,
          quiz: gamesRes.data?.filter((g: any) => g.game_type === 'quiz').length || 0,
          matching: gamesRes.data?.filter((g: any) => g.game_type === 'matching').length || 0,
          dragdrop: gamesRes.data?.filter((g: any) => g.game_type === 'dragdrop').length || 0
        },
        byLevel: {
          level1: gamesRes.data?.filter((g: any) => g.difficulty_level === 1).length || 0,
          level2: gamesRes.data?.filter((g: any) => g.difficulty_level === 2).length || 0,
          level3: gamesRes.data?.filter((g: any) => g.difficulty_level === 3).length || 0,
          level4: gamesRes.data?.filter((g: any) => g.difficulty_level === 4).length || 0,
          level5: gamesRes.data?.filter((g: any) => g.difficulty_level === 5).length || 0
        }
      }
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
