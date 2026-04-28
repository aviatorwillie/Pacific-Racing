// ═══════════════════════════════════════════════════════════════════════════
//  PACIFIC RACING — Sport Configuration
//  Central config for sport → league/type → market mappings.
//  Used by admin event creation and event display.
// ═══════════════════════════════════════════════════════════════════════════

import type { SportConfig } from '@/lib/types'

export const SPORT_CONFIG: Record<string, SportConfig> = {

  rugby_league: {
    label: 'Rugby League',
    categoryType: 'league',
    options: ['NRL', 'Super League', 'PNG National', 'International RL'],
    markets: [
      'Head to Head',
      'Line / Handicap',
      '1st Scoring Play',
      'Half Time / Full Time Double',
      'Half Time Winning Team & Margin',
      'Full Time Winning Team & Margin (10pt)',
      'Total Match Points',
      'Total Match Points (Both Teams)',
      'Total Match Tries',
    ],
  },

  rugby_union: {
    label: 'Rugby Union',
    categoryType: 'league',
    options: ['Super Rugby', 'Six Nations', 'Rugby Championship', 'International RU'],
    markets: [
      'Head to Head',
      'Line / Handicap',
      'Half Time / Full Time',
      'Total Match Points',
      'Winning Margin',
      'First Try Scorer',
    ],
  },

  soccer: {
    label: 'Soccer',
    categoryType: 'league',
    options: ['OFC Nations Cup', 'A-League', 'English Premier League', 'Champions League', 'International'],
    markets: [
      'Head to Head',
      'Double Chance',
      'Both Teams to Score',
      'Over / Under (Goals)',
      'Correct Score',
      'Half Time / Full Time',
      'First Goal Scorer',
      'Total Goals',
    ],
  },

  horse_racing: {
    label: 'Horse Racing',
    categoryType: 'type',
    options: ['Thoroughbred', 'Harness', 'Listed Race', 'Group 1', 'Group 2', 'Group 3'],
    markets: [
      'Win',
      'Place',
      'Each Way',
      'Quinella',
      'Exacta',
      'Trifecta',
    ],
  },

  greyhound_racing: {
    label: 'Greyhound Racing',
    categoryType: 'type',
    options: ['Sprint', 'Middle Distance', 'Staying'],
    markets: [
      'Win',
      'Place',
      'Each Way',
      'Quinella',
    ],
  },

  cricket: {
    label: 'Cricket',
    categoryType: 'tournament',
    options: ['ICC T20 World Cup', 'ICC ODI World Cup', 'Test Series', 'Big Bash', 'IPL'],
    markets: [
      'Head to Head',
      'Top Batsman',
      'Top Bowler',
      'Total Runs',
      'Method of Dismissal',
      'Innings Runs',
    ],
  },

  afl: {
    label: 'AFL',
    categoryType: 'league',
    options: ['AFL Premiership', 'VFL', 'AFLW'],
    markets: [
      'Head to Head',
      'Line / Handicap',
      'Total Points',
      'First Goal Scorer',
      'Winning Margin',
    ],
  },

  basketball: {
    label: 'Basketball',
    categoryType: 'league',
    options: ['NBA', 'NBL', 'WNBA', 'International'],
    markets: [
      'Head to Head',
      'Line / Handicap',
      'Total Points (Over/Under)',
      'Quarter Winner',
      'Half Time Winner',
    ],
  },

  boxing_mma: {
    label: 'Boxing / MMA',
    categoryType: 'type',
    options: ['Boxing', 'UFC', 'MMA'],
    markets: [
      'Head to Head',
      'Method of Victory',
      'Round Betting',
      'Total Rounds (Over/Under)',
      'Points Decision',
    ],
  },

  tennis: {
    label: 'Tennis',
    categoryType: 'tournament',
    options: ['Australian Open', 'French Open', 'Wimbledon', 'US Open', 'ATP Tour', 'WTA Tour'],
    markets: [
      'Head to Head',
      'Set Betting',
      'Total Sets',
      'Total Games (Over/Under)',
    ],
  },
}

// Helper: get sport config by key
export function getSportConfig(key: string): SportConfig | null {
  return SPORT_CONFIG[key] || null
}

// Helper: get all sport keys for dropdowns
export function getSportKeys(): string[] {
  return Object.keys(SPORT_CONFIG)
}

// Helper: get sport label from key
export function getSportLabel(key: string): string {
  return SPORT_CONFIG[key]?.label || key
}
