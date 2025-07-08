import { 
  users, User, InsertUser,
  matches, Match, InsertMatch,
  positions, Position, InsertPosition,
  activities, Activity, InsertActivity,
  reels, Reel, InsertReel,
  follows, Follow, InsertFollow,
  leaderboard, LeaderboardEntry,
  featureFlags, FeatureFlag, InsertFeatureFlag,
  systemMetrics, SystemMetric, InsertSystemMetric
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Match operations
  getMatch(id: number): Promise<Match | undefined>;
  getMatchByCode(code: string): Promise<Match | undefined>;
  getActiveMatches(): Promise<Match[]>;
  getUserMatches(userId: number): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, updates: Partial<Match>): Promise<Match | undefined>;
  addSpectator(matchId: number, username: string): Promise<void>;
  
  // Position operations
  getPosition(id: number): Promise<Position | undefined>;
  getUserPositions(userId: number): Promise<Position[]>;
  getMatchPositions(matchId: number): Promise<Position[]>;
  createPosition(position: InsertPosition): Promise<Position>;
  closePosition(id: number, exitPrice: number, pnl: number): Promise<Position | undefined>;
  
  // Activity operations
  getMatchActivities(matchId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Reel operations
  getReels(): Promise<Reel[]>;
  getUserReels(userId: number): Promise<Reel[]>;
  createReel(reel: InsertReel): Promise<Reel>;
  likeReel(reelId: number): Promise<void>;
  
  // Follow operations
  followUser(follow: InsertFollow): Promise<Follow>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  
  // Leaderboard operations
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  updateLeaderboardEntry(userId: number, updates: Partial<LeaderboardEntry>): Promise<LeaderboardEntry | undefined>;
  
  // Feature flag operations
  getFeatureFlags(): Promise<FeatureFlag[]>;
  getFeatureFlag(id: number): Promise<FeatureFlag | undefined>;
  getFeatureFlagByName(name: string): Promise<FeatureFlag | undefined>;
  createFeatureFlag(featureFlag: InsertFeatureFlag): Promise<FeatureFlag>;
  updateFeatureFlag(id: number, updates: Partial<FeatureFlag>): Promise<FeatureFlag | undefined>;
  deleteFeatureFlag(id: number): Promise<void>;
  
  // System metrics operations
  getSystemMetrics(): Promise<SystemMetric[]>;
  getSystemMetricsByName(name: string): Promise<SystemMetric[]>;
  createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric>;
  getSystemMetricsSummary(): Promise<Record<string, number>>;
}

// In-memory implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private matches: Map<number, Match>;
  private positions: Map<number, Position>;
  private activities: Map<number, Activity>;
  private reels: Map<number, Reel>;
  private follows: Map<number, Follow>;
  private leaderboardEntries: Map<number, LeaderboardEntry>;
  private featureFlags: Map<number, FeatureFlag>;
  private systemMetrics: Map<number, SystemMetric>;
  
  private userIdCounter: number;
  private matchIdCounter: number;
  private positionIdCounter: number;
  private activityIdCounter: number;
  private reelIdCounter: number;
  private followIdCounter: number;
  private leaderboardIdCounter: number;
  private featureFlagIdCounter: number;
  private systemMetricIdCounter: number;

  constructor() {
    this.users = new Map();
    this.matches = new Map();
    this.positions = new Map();
    this.activities = new Map();
    this.reels = new Map();
    this.follows = new Map();
    this.leaderboardEntries = new Map();
    this.featureFlags = new Map();
    this.systemMetrics = new Map();
    
    this.userIdCounter = 1;
    this.matchIdCounter = 1;
    this.positionIdCounter = 1;
    this.activityIdCounter = 1;
    this.reelIdCounter = 1;
    this.followIdCounter = 1;
    this.leaderboardIdCounter = 1;
    this.featureFlagIdCounter = 1;
    this.systemMetricIdCounter = 1;
    
    // Initialize with some demo users
    this.createUser({ 
      username: "CryptoWhale", 
      password: "password", 
      walletAddress: "5o94BcTKC4RuSgj5x25htTZtwo1Apt53KZMmUg3f7cx6",
      role: "admin"
    });
    this.createUser({ 
      username: "TraderRex", 
      password: "password", 
      walletAddress: "DLVp4WpxtkeeHayK1th66BbNZMGpV6cz3s7WzLcNfwCh",
      role: "admin"
    });
    this.createUser({ 
      username: "MoonHunter", 
      password: "password", 
      walletAddress: "as723kd9f8js",
      role: "user"
    });
    this.createUser({ 
      username: "SoloBull", 
      password: "password", 
      walletAddress: "qqoip1923dss",
      role: "user"
    });
    
    // Initialize some feature flags
    this.createFeatureFlag({
      name: "sol_usdt_trading",
      description: "Enable SOL/USDT trading pair",
      enabled: true,
      category: "trading",
      configValue: {}
    });
    
    this.createFeatureFlag({
      name: "btc_usdc_trading",
      description: "Enable BTC/USDC trading pair",
      enabled: true,
      category: "trading",
      configValue: {}
    });
    
    this.createFeatureFlag({
      name: "eth_usdc_trading",
      description: "Enable ETH/USDC trading pair",
      enabled: true,
      category: "trading",
      configValue: {}
    });
    
    this.createFeatureFlag({
      name: "spectator_betting",
      description: "Allow spectators to place bets on matches",
      enabled: false,
      category: "game_mode",
      configValue: {}
    });
    
    this.createFeatureFlag({
      name: "group_matches",
      description: "Enable group vs group matches",
      enabled: false,
      category: "game_mode",
      configValue: {}
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByWalletAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === address
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const newUser: User = { 
      id,
      role: user.role ?? "user",
      username: user.username,
      password: user.password,
      walletAddress: user.walletAddress ?? null,
      avatar: user.avatar ?? null,
      bio: user.bio ?? null,
      arenaTokens: 0,
      xp: 0,
      createdAt: now
    };
    this.users.set(id, newUser);
    
    // Create leaderboard entry for user
    this.updateLeaderboardEntry(id, {
      userId: id,
      rank: this.leaderboardEntries.size + 1,
      wins: 0,
      losses: 0,
      totalMatches: 0,
      totalPnl: 0,
      points: 0,
      updatedAt: now
    });
    
    return newUser;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Match operations
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }
  
  async getMatchByCode(code: string): Promise<Match | undefined> {
    return Array.from(this.matches.values()).find(
      (match) => match.matchCode === code
    );
  }
  
  async getActiveMatches(): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.status === 'active'
    );
  }
  
  async getUserMatches(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.player1Id === userId || match.player2Id === userId
    );
  }
  
  async createMatch(match: InsertMatch): Promise<Match> {
    const id = this.matchIdCounter++;
    const now = new Date();
    const newMatch: Match = { 
      ...match, 
      id, 
      player1Pnl: 0, 
      player2Pnl: 0, 
      spectators: [],
      createdAt: now,
      startTime: null,
      endTime: null,
      winnerId: null,
      status: match.status ?? 'pending',
      player2Id: match.player2Id ?? null,
      duration: match.duration ?? 0, // Ensure duration is always a number
      isGroupMatch: match.isGroupMatch !== undefined ? match.isGroupMatch ?? null : null
    };
    this.matches.set(id, newMatch);
    return newMatch;
  }
  
  async updateMatch(id: number, updates: Partial<Match>): Promise<Match | undefined> {
    const match = await this.getMatch(id);
    if (!match) return undefined;
    
    const updatedMatch = { ...match, ...updates };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }
  
  async addSpectator(matchId: number, username: string): Promise<void> {
    const match = await this.getMatch(matchId);
    if (!match) throw new Error('Match not found');
    
    const spectators = Array.isArray(match.spectators) ? match.spectators : [];
    if (!spectators.includes(username)) {
      const updatedSpectators = [...spectators, username];
      await this.updateMatch(matchId, { spectators: updatedSpectators });
    }
  }

  // Position operations
  async getPosition(id: number): Promise<Position | undefined> {
    return this.positions.get(id);
  }
  
  async getUserPositions(userId: number): Promise<Position[]> {
    return Array.from(this.positions.values()).filter(
      (position) => position.userId === userId
    );
  }
  
  async getMatchPositions(matchId: number): Promise<Position[]> {
    return Array.from(this.positions.values()).filter(
      (position) => position.matchId === matchId
    );
  }
  
  async createPosition(position: InsertPosition): Promise<Position> {
    const id = this.positionIdCounter++;
    const now = new Date();
    const newPosition: Position = { 
      ...position, 
      id, 
      pnl: 0, 
      openTime: now,
      exitPrice: null,
      closeTime: null,
      status: 'open',
      matchId: position.matchId !== undefined ? position.matchId : null
    };
    this.positions.set(id, newPosition);
    return newPosition;
  }
  
  async closePosition(id: number, exitPrice: number, pnl: number): Promise<Position | undefined> {
    const position = await this.getPosition(id);
    if (!position) return undefined;
    
    const now = new Date();
    const updatedPosition = { 
      ...position, 
      exitPrice, 
      pnl, 
      closeTime: now,
      status: 'closed' 
    };
    this.positions.set(id, updatedPosition);
    return updatedPosition;
  }

  // Activity operations
  async getMatchActivities(matchId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((activity) => activity.matchId === matchId)
      .sort((a, b) => 
        (b.createdAt ? b.createdAt.getTime() : 0) - (a.createdAt ? a.createdAt.getTime() : 0)
      );
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const newActivity: Activity = { 
      id,
      createdAt: now,
      type: activity.type,
      userId: activity.userId !== undefined ? activity.userId : null,
      matchId: activity.matchId !== undefined ? activity.matchId : null,
      details: activity.details !== undefined ? activity.details : null
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  // Reel operations
  async getReels(): Promise<Reel[]> {
    return Array.from(this.reels.values())
      .sort((a, b) => {
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        return bTime - aTime;
      });
  }
  
  async getUserReels(userId: number): Promise<Reel[]> {
    return Array.from(this.reels.values())
      .filter((reel) => reel.userId === userId)
      .sort((a, b) => {
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        return bTime - aTime;
      });
  }
  
  async createReel(reel: InsertReel): Promise<Reel> {
    const id = this.reelIdCounter++;
    const now = new Date();
    const newReel: Reel = {
      id,
      createdAt: now,
      matchId: reel.matchId !== undefined ? reel.matchId : null,
      userId: reel.userId,
      videoUrl: reel.videoUrl,
      caption: reel.caption !== undefined ? reel.caption : null,
      likes: 0,
      views: 0
    };
    this.reels.set(id, newReel);
    return newReel;
  }
  
  async likeReel(reelId: number): Promise<void> {
    const reel = this.reels.get(reelId);
    if (!reel) throw new Error('Reel not found');
    
    const updatedReel = { ...reel, likes: (reel.likes ?? 0) + 1 };
    this.reels.set(reelId, updatedReel);
  }

  // Follow operations
  async followUser(follow: InsertFollow): Promise<Follow> {
    // Check if already following
    const existing = Array.from(this.follows.values()).find(
      (f) => f.followerId === follow.followerId && f.followingId === follow.followingId
    );
    
    if (existing) return existing;
    
    const id = this.followIdCounter++;
    const now = new Date();
    const newFollow: Follow = { 
      ...follow, 
      id, 
      createdAt: now 
    };
    this.follows.set(id, newFollow);
    return newFollow;
  }
  
  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    const follow = Array.from(this.follows.values()).find(
      (f) => f.followerId === followerId && f.followingId === followingId
    );
    
    if (follow) {
      this.follows.delete(follow.id);
    }
  }
  
  async getFollowers(userId: number): Promise<User[]> {
    const followerIds = Array.from(this.follows.values())
      .filter((follow) => follow.followingId === userId)
      .map((follow) => follow.followerId);
    
    return Array.from(this.users.values())
      .filter((user) => followerIds.includes(user.id));
  }
  
  async getFollowing(userId: number): Promise<User[]> {
    const followingIds = Array.from(this.follows.values())
      .filter((follow) => follow.followerId === userId)
      .map((follow) => follow.followingId);
    
    return Array.from(this.users.values())
      .filter((user) => followingIds.includes(user.id));
  }

  // Leaderboard operations
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return Array.from(this.leaderboardEntries.values())
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
  }
  
  async updateLeaderboardEntry(userId: number, updates: Partial<LeaderboardEntry>): Promise<LeaderboardEntry | undefined> {
    let entry = Array.from(this.leaderboardEntries.values()).find(
      (e) => e.userId === userId
    );
    
    if (!entry) {
      // Create new entry
      const id = this.leaderboardIdCounter++;
      entry = {
        id,
        userId,
        rank: this.leaderboardEntries.size + 1,
        wins: 0,
        losses: 0,
        totalMatches: 0,
        totalPnl: 0,
        points: 0,
        updatedAt: new Date()
      };
      this.leaderboardEntries.set(id, entry);
    }
    
    const updatedEntry = { ...entry, ...updates, updatedAt: new Date() };
    this.leaderboardEntries.set(entry.id, updatedEntry);
    return updatedEntry;
  }
  
  // User operations (admin)
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Feature flag operations
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    return Array.from(this.featureFlags.values());
  }
  
  async getFeatureFlag(id: number): Promise<FeatureFlag | undefined> {
    return this.featureFlags.get(id);
  }
  
  async getFeatureFlagByName(name: string): Promise<FeatureFlag | undefined> {
    return Array.from(this.featureFlags.values()).find(
      (flag) => flag.name === name
    );
  }
  
  async createFeatureFlag(featureFlag: InsertFeatureFlag): Promise<FeatureFlag> {
    const id = this.featureFlagIdCounter++;
    const now = new Date();
    
    const newFeatureFlag: FeatureFlag = { 
      ...featureFlag, 
      id, 
      createdAt: now,
      updatedAt: now,
      description: featureFlag.description !== undefined ? featureFlag.description : null,
      enabled: featureFlag.enabled !== undefined ? featureFlag.enabled : false,
      configValue: featureFlag.configValue !== undefined ? featureFlag.configValue : {},
    };
    this.featureFlags.set(id, newFeatureFlag);
    return newFeatureFlag;
  }
  
  async updateFeatureFlag(id: number, updates: Partial<FeatureFlag>): Promise<FeatureFlag | undefined> {
    const featureFlag = await this.getFeatureFlag(id);
    if (!featureFlag) return undefined;
    
    const now = new Date();
    const updatedFeatureFlag = { ...featureFlag, ...updates, updatedAt: now };
    this.featureFlags.set(id, updatedFeatureFlag);
    return updatedFeatureFlag;
  }
  
  async deleteFeatureFlag(id: number): Promise<void> {
    this.featureFlags.delete(id);
  }
  
  // System metrics operations
  async getSystemMetrics(): Promise<SystemMetric[]> {
    return Array.from(this.systemMetrics.values())
      .sort((a, b) => {
        const bTime = b.timestamp ? b.timestamp.getTime() : 0;
        const aTime = a.timestamp ? a.timestamp.getTime() : 0;
        return bTime - aTime;
      });
  }
  
  async getSystemMetricsByName(name: string): Promise<SystemMetric[]> {
    return Array.from(this.systemMetrics.values())
      .filter((metric) => metric.name === name)
      .sort((a, b) => {
        const bTime = b.timestamp ? b.timestamp.getTime() : 0;
        const aTime = a.timestamp ? a.timestamp.getTime() : 0;
        return bTime - aTime;
      });
  }
  
  async createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric> {
    const id = this.systemMetricIdCounter++;
    const now = new Date();
    
    const newMetric: SystemMetric = { 
      ...metric, 
      id, 
      value: metric.value !== undefined ? metric.value : null,
      timestamp: now
    };
    this.systemMetrics.set(id, newMetric);
    return newMetric;
  }
  
  async getSystemMetricsSummary(): Promise<Record<string, number>> {
    const metrics: Record<string, number> = {};
    
    // Active users (count of unique users with positions opened in the last 24 hours)
    const lastDay = new Date();
    lastDay.setDate(lastDay.getDate() - 1);
    
    const activeUsers = new Set(
      Array.from(this.positions.values())
        .filter(pos => pos.openTime && pos.openTime > lastDay)
        .map(pos => pos.userId)
    );
    metrics['active_users'] = activeUsers.size;
    
    // Total trade volume
    const totalTradeVolume = Array.from(this.positions.values())
      .reduce((sum, pos) => sum + pos.size, 0);
    metrics['trade_volume'] = totalTradeVolume;
    
    // Active matches
    metrics['active_matches'] = Array.from(this.matches.values())
      .filter(match => match.status === 'active')
      .length;
    
    // Total users
    metrics['total_users'] = this.users.size;
    
    // Total matches
    metrics['total_matches'] = this.matches.size;
    
    return metrics;
  }
}

export const storage = new MemStorage();
