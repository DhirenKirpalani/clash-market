import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { InfoIcon, AlertTriangle, UsersIcon, ActivityIcon, FlagIcon, Settings, PlusIcon, RefreshCw, User, Trophy, Clock } from 'lucide-react';

type FeatureFlag = {
  id: number;
  name: string;
  description: string | null;
  category: string;
  enabled: boolean;
  configValue: any;
  createdAt: string | null;
  updatedAt: string | null;
};

type User = {
  id: number;
  username: string;
  walletAddress: string | null;
  avatar: string | null;
  bio: string | null;
  arenaTokens: number | null;
  xp: number | null;
  role: string;
  createdAt: string | null;
};

type Match = {
  id: number;
  matchCode: string;
  player1Id: number;
  player2Id: number | null;
  player1Pnl: number | null;
  player2Pnl: number | null;
  market: string;
  status: string;
  duration: number;
  startTime: string | null;
  endTime: string | null;
  createdAt: string | null;
};

type SystemMetric = {
  id: number;
  name: string;
  value: number | null;
  timestamp: string | null;
};

export default function Admin() {
  const { toast } = useToast();
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any>({});
  const [metricsHistory, setMetricsHistory] = useState<SystemMetric[]>([]);
  const [newFeatureFlag, setNewFeatureFlag] = useState({
    name: '',
    description: '',
    category: 'trading',
    enabled: true,
    configValue: {}
  });
  const [newMetric, setNewMetric] = useState({
    name: '',
    value: 0
  });
  const [isFeatureFlagModalOpen, setIsFeatureFlagModalOpen] = useState(false);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load admin data on mount
  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        // Fetch feature flags
        const featureFlagsResponse = await apiRequest('/api/admin/feature-flags');
        if (featureFlagsResponse.ok) {
          setFeatureFlags(await featureFlagsResponse.json());
        } else {
          toast({
            title: "Error",
            description: "Failed to load feature flags. Make sure you have admin privileges.",
            variant: "destructive"
          });
        }

        // Fetch users
        const usersResponse = await apiRequest('/api/admin/users');
        if (usersResponse.ok) {
          setUsers(await usersResponse.json());
        }

        // Fetch matches
        const matchesResponse = await apiRequest('/api/admin/matches');
        if (matchesResponse.ok) {
          setMatches(await matchesResponse.json());
        }

        // Fetch system metrics
        const metricsResponse = await apiRequest('/api/admin/system/metrics');
        if (metricsResponse.ok) {
          setSystemMetrics(await metricsResponse.json());
        }

        // Fetch metrics history
        const metricsHistoryResponse = await apiRequest('/api/admin/system/metrics/history');
        if (metricsHistoryResponse.ok) {
          setMetricsHistory(await metricsHistoryResponse.json());
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast({
          title: "Error",
          description: "Failed to load admin data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [toast]);

  // Handle feature flag toggle
  const toggleFeatureFlag = async (id: number, enabled: boolean) => {
    try {
      const response = await apiRequest(`/api/admin/feature-flags/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: !enabled }),
      });

      if (response.ok) {
        setFeatureFlags(featureFlags.map(flag => 
          flag.id === id ? { ...flag, enabled: !enabled } : flag
        ));
        toast({
          title: "Success",
          description: `Feature flag ${enabled ? 'disabled' : 'enabled'} successfully!`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update feature flag.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating feature flag:', error);
      toast({
        title: "Error",
        description: "Failed to update feature flag.",
        variant: "destructive"
      });
    }
  };

  // Create new feature flag
  const createFeatureFlag = async () => {
    try {
      const response = await apiRequest('/api/admin/feature-flags', {
        method: 'POST',
        body: JSON.stringify(newFeatureFlag),
      });

      if (response.ok) {
        const flag = await response.json();
        setFeatureFlags([...featureFlags, flag]);
        setIsFeatureFlagModalOpen(false);
        setNewFeatureFlag({
          name: '',
          description: '',
          category: 'trading',
          enabled: true,
          configValue: {}
        });
        toast({
          title: "Success",
          description: "Feature flag created successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create feature flag.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating feature flag:', error);
      toast({
        title: "Error",
        description: "Failed to create feature flag.",
        variant: "destructive"
      });
    }
  };

  // Delete feature flag
  const deleteFeatureFlag = async (id: number) => {
    try {
      const response = await apiRequest(`/api/admin/feature-flags/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFeatureFlags(featureFlags.filter(flag => flag.id !== id));
        toast({
          title: "Success",
          description: "Feature flag deleted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete feature flag.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      toast({
        title: "Error",
        description: "Failed to delete feature flag.",
        variant: "destructive"
      });
    }
  };

  // Update user role
  const updateUserRole = async (id: number, role: string) => {
    try {
      const response = await apiRequest(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === id ? { ...user, role } : user
        ));
        if (selectedUser && selectedUser.id === id) {
          setSelectedUser({ ...selectedUser, role });
        }
        setIsUserModalOpen(false);
        toast({
          title: "Success",
          description: "User role updated successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update user role.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive"
      });
    }
  };

  // End match
  const endMatch = async (id: number) => {
    try {
      const response = await apiRequest(`/api/admin/matches/${id}/end`, {
        method: 'PUT',
      });

      if (response.ok) {
        setMatches(matches.map(match => 
          match.id === id ? { ...match, status: 'completed' } : match
        ));
        toast({
          title: "Success",
          description: "Match ended successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to end match.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error ending match:', error);
      toast({
        title: "Error",
        description: "Failed to end match.",
        variant: "destructive"
      });
    }
  };

  // Add system metric
  const addSystemMetric = async () => {
    try {
      const response = await apiRequest('/api/admin/system/metrics', {
        method: 'POST',
        body: JSON.stringify(newMetric),
      });

      if (response.ok) {
        const metric = await response.json();
        setMetricsHistory([...metricsHistory, metric]);
        // Update summary
        setSystemMetrics({
          ...systemMetrics,
          [newMetric.name]: newMetric.value
        });
        setIsMetricModalOpen(false);
        setNewMetric({
          name: '',
          value: 0
        });
        toast({
          title: "Success",
          description: "System metric added successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add system metric.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding system metric:', error);
      toast({
        title: "Error",
        description: "Failed to add system metric.",
        variant: "destructive"
      });
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Fetch feature flags
      const featureFlagsResponse = await apiRequest('/api/admin/feature-flags');
      if (featureFlagsResponse.ok) {
        setFeatureFlags(await featureFlagsResponse.json());
      }

      // Fetch users
      const usersResponse = await apiRequest('/api/admin/users');
      if (usersResponse.ok) {
        setUsers(await usersResponse.json());
      }

      // Fetch matches
      const matchesResponse = await apiRequest('/api/admin/matches');
      if (matchesResponse.ok) {
        setMatches(await matchesResponse.json());
      }

      // Fetch system metrics
      const metricsResponse = await apiRequest('/api/admin/system/metrics');
      if (metricsResponse.ok) {
        setSystemMetrics(await metricsResponse.json());
      }

      // Fetch metrics history
      const metricsHistoryResponse = await apiRequest('/api/admin/system/metrics/history');
      if (metricsHistoryResponse.ok) {
        setMetricsHistory(await metricsHistoryResponse.json());
      }

      toast({
        title: "Data Refreshed",
        description: "Admin data has been refreshed.",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Convert metrics for chart
  const metricsChartData = Object.entries(systemMetrics).map(([name, value]) => ({
    name,
    value
  }));

  // Filter active matches
  const activeMatches = matches.filter(match => match.status === 'active');

  // Format metrics history for chart
  const formatMetricsHistory = () => {
    // Group by metric name
    const groupedMetrics: Record<string, any[]> = {};
    metricsHistory.forEach(metric => {
      if (!groupedMetrics[metric.name]) {
        groupedMetrics[metric.name] = [];
      }
      groupedMetrics[metric.name].push({
        timestamp: new Date(metric.timestamp!).toLocaleString(),
        value: metric.value
      });
    });
    return groupedMetrics;
  };

  const metricsHistoryData = formatMetricsHistory();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="animate-spin h-8 w-8 text-primary" />
          <p className="text-lg">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Portal</h1>
        <Button onClick={refreshData} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ActivityIcon className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="featureFlags" className="flex items-center gap-2">
            <FlagIcon className="h-4 w-4" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Matches
          </TabsTrigger>
          <TabsTrigger value="systemMetrics" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System Metrics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Users</CardTitle>
                <CardDescription>Total registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{users.length}</span>
                  <UsersIcon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Matches</CardTitle>
                <CardDescription>Current ongoing matches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{activeMatches.length}</span>
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Feature Flags</CardTitle>
                <CardDescription>Active feature flags</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{featureFlags.filter(f => f.enabled).length} / {featureFlags.length}</span>
                  <FlagIcon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Metrics Summary</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metricsChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
                <CardDescription>Quick actions for system management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full flex items-center justify-between" onClick={() => setIsFeatureFlagModalOpen(true)}>
                  <span>Create Feature Flag</span>
                  <FlagIcon className="h-4 w-4" />
                </Button>
                <Button className="w-full flex items-center justify-between" onClick={() => setIsMetricModalOpen(true)}>
                  <span>Add System Metric</span>
                  <Settings className="h-4 w-4" />
                </Button>
                <Button className="w-full flex items-center justify-between" variant="destructive" disabled={activeMatches.length === 0}>
                  <span>End All Active Matches</span>
                  <AlertTriangle className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feature Flags Tab */}
        <TabsContent value="featureFlags" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Feature Flags Management</h2>
            <Button onClick={() => setIsFeatureFlagModalOpen(true)} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              New Feature Flag
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureFlags.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell className="font-medium">{flag.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {flag.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{flag.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={flag.enabled}
                            onCheckedChange={() => toggleFeatureFlag(flag.id, flag.enabled)}
                          />
                          <Label>{flag.enabled ? 'Enabled' : 'Disabled'}</Label>
                        </div>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the feature flag
                                "{flag.name}" and may affect functionality for users.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteFeatureFlag(flag.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {featureFlags.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No feature flags found. Create your first feature flag to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">User Management</h2>
            <div className="flex items-center gap-2">
              <Input placeholder="Search users..." className="w-64" />
              <Button variant="outline">Search</Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell className="max-w-xs truncate">{user.walletAddress}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'moderator' ? 'outline' : 'secondary'}>
                          {user.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.arenaTokens || 0}</TableCell>
                      <TableCell>{user.xp || 0}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setSelectedUser(user);
                            setIsUserModalOpen(true);
                          }}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matches Tab */}
        <TabsContent value="matches" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Match Management</h2>
            <div className="flex items-center gap-2">
              <Select defaultValue="active">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Matches</SelectItem>
                  <SelectItem value="active">Active Matches</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match Code</TableHead>
                    <TableHead>Market</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>PnL</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeMatches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell className="font-medium">{match.matchCode}</TableCell>
                      <TableCell>{match.market}</TableCell>
                      <TableCell>
                        {match.player1Id} {match.player2Id ? `vs ${match.player2Id}` : '(waiting)'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={match.status === 'active' ? 'default' : 
                                 match.status === 'completed' ? 'secondary' : 'outline'}
                        >
                          {match.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {match.player1Pnl !== null ? `${match.player1Pnl > 0 ? '+' : ''}${match.player1Pnl.toFixed(2)}` : '0.00'} / 
                        {match.player2Pnl !== null ? `${match.player2Pnl > 0 ? '+' : ''}${match.player2Pnl.toFixed(2)}` : '0.00'}
                      </TableCell>
                      <TableCell>
                        {match.status === 'active' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">End Match</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>End this match?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will end the match immediately and calculate the winner based on current PnL.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => endMatch(match.id)}>End Match</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {match.status !== 'active' && (
                          <Button size="sm" variant="outline" disabled>View Details</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {activeMatches.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No active matches found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Metrics Tab */}
        <TabsContent value="systemMetrics" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">System Metrics</h2>
            <Button onClick={() => setIsMetricModalOpen(true)} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Metric
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Metrics</CardTitle>
                <CardDescription>Latest system performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(systemMetrics).map(([name, value]) => (
                      <TableRow key={name}>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))}
                    {Object.keys(systemMetrics).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">
                          No system metrics found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metrics History</CardTitle>
                <CardDescription>Historical trends of system metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-6">
                    {Object.entries(metricsHistoryData).map(([metricName, data]) => (
                      <div key={metricName} className="space-y-2">
                        <h3 className="font-medium">{metricName}</h3>
                        <ResponsiveContainer width="100%" height={120}>
                          <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" tick={false} />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#6366f1" dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ))}
                    {Object.keys(metricsHistoryData).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8">
                        <InfoIcon className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground text-center">
                          No metrics history available.
                          <br />
                          Add metrics to start tracking system performance.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Feature Flag Modal */}
      <Dialog open={isFeatureFlagModalOpen} onOpenChange={setIsFeatureFlagModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Feature Flag</DialogTitle>
            <DialogDescription>
              Add a new feature flag to control functionality across the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="e.g., enable_new_market" 
                value={newFeatureFlag.name}
                onChange={(e) => setNewFeatureFlag({...newFeatureFlag, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                placeholder="What does this flag control?" 
                value={newFeatureFlag.description}
                onChange={(e) => setNewFeatureFlag({...newFeatureFlag, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={newFeatureFlag.category}
                onValueChange={(value) => setNewFeatureFlag({...newFeatureFlag, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trading">Trading</SelectItem>
                  <SelectItem value="game_mode">Game Mode</SelectItem>
                  <SelectItem value="ui">User Interface</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="enabled" 
                checked={newFeatureFlag.enabled}
                onCheckedChange={(checked) => setNewFeatureFlag({...newFeatureFlag, enabled: checked})}
              />
              <Label htmlFor="enabled">Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeatureFlagModalOpen(false)}>Cancel</Button>
            <Button onClick={createFeatureFlag}>Create Flag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Modal */}
      <Dialog open={isUserModalOpen && !!selectedUser} onOpenChange={setIsUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User: {selectedUser?.username}</DialogTitle>
            <DialogDescription>
              Update user role and view details
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User ID</Label>
                <div className="p-2 border rounded-md bg-muted">{selectedUser.id}</div>
              </div>
              <div className="space-y-2">
                <Label>Wallet Address</Label>
                <div className="p-2 border rounded-md bg-muted truncate">{selectedUser.walletAddress || 'Not connected'}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={selectedUser.role}
                  onValueChange={(value) => updateUserRole(selectedUser.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Arena Tokens</Label>
                  <div className="p-2 border rounded-md">{selectedUser.arenaTokens || 0}</div>
                </div>
                <div className="space-y-2">
                  <Label>XP</Label>
                  <div className="p-2 border rounded-md">{selectedUser.xp || 0}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* System Metric Modal */}
      <Dialog open={isMetricModalOpen} onOpenChange={setIsMetricModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add System Metric</DialogTitle>
            <DialogDescription>
              Add a new system metric to track platform performance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metric-name">Metric Name</Label>
              <Input 
                id="metric-name" 
                placeholder="e.g., active_users" 
                value={newMetric.name}
                onChange={(e) => setNewMetric({...newMetric, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metric-value">Value</Label>
              <Input 
                id="metric-value" 
                type="number" 
                placeholder="0" 
                value={newMetric.value}
                onChange={(e) => setNewMetric({...newMetric, value: parseFloat(e.target.value)})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMetricModalOpen(false)}>Cancel</Button>
            <Button onClick={addSystemMetric}>Add Metric</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}