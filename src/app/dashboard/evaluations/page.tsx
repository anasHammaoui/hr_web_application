'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ClipboardList, Award, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: string;
}

interface Evaluation {
  id: string;
  name: string;
  scores: Array<{
    id: string;
    score: number;
    user: {
      id: string;
      name: string;
      email: string;
      profilePicture?: string;
    };
  }>;
}

const SCORE_BUCKETS = [
  { label: '0-30 (Needs Improvement)', min: 0, max: 30, color: 'bg-red-500', hex: '#ef4444' },
  { label: '31-50 (Below Average)', min: 31, max: 50, color: 'bg-orange-500', hex: '#f97316' },
  { label: '51-70 (Average)', min: 51, max: 70, color: 'bg-yellow-500', hex: '#eab308' },
  { label: '71-100 (Excellent)', min: 71, max: 100, color: 'bg-green-500', hex: '#22c55e' },
];

export default function EvaluationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEvaluations();
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchEvaluations = async () => {
    try {
      const response = await api.get('/evaluations');
      setEvaluations(response.data);
    } catch (error) {
      console.error('Failed to fetch evaluations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load evaluations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      // Handle pagination - API returns { users: [], pagination: {} }
      const userData = response.data.users || response.data;
      setUsers(userData.filter((u: User) => u.role === 'employee'));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAssignScore = async () => {
    if (!selectedEvaluation || !selectedUser || score < 0 || score > 100) {
      toast({
        title: 'Invalid Input',
        description: 'Please select a user and enter a valid score (0-100)',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/evaluations/scores', {
        userId: selectedUser,
        evaluationId: selectedEvaluation.id,
        score,
      });

      toast({
        title: 'Success',
        description: 'Score assigned successfully',
      });

      setIsDialogOpen(false);
      setSelectedUser('');
      setScore(0);
      fetchEvaluations();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error.response as { data?: { error?: string } })?.data?.error
        : 'Failed to assign score';
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to assign score',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMyScore = (evaluation: Evaluation) => {
    return evaluation.scores.find((s) => s.user.id === user?.id);
  }

  const getAverageScore = (evaluation: Evaluation) => {
    if (evaluation.scores.length === 0) return 0;
    const sum = evaluation.scores.reduce((acc, s) => acc + s.score, 0);
    return Math.round(sum / evaluation.scores.length);
  }

  const getScoreBucket = (score: number) => {
    return SCORE_BUCKETS.find(bucket => score >= bucket.min && score <= bucket.max);
  }

  const getUsersWithoutScore = (evaluation: Evaluation) => {
    const scoredUserIds = evaluation.scores.map(s => s.user.id);
    return users.filter(u => !scoredUserIds.includes(u.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Evaluations</h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin' 
              ? 'Manage and assign evaluation scores' 
              : 'View your performance evaluation scores'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {evaluations.map((evaluation) => {
            const myScore = getMyScore(evaluation);
            const averageScore = getAverageScore(evaluation);
            const usersWithoutScore = user?.role === 'admin' ? getUsersWithoutScore(evaluation) : [];

            return (
              <Card key={evaluation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        {evaluation.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {evaluation.scores.length} employee{evaluation.scores.length !== 1 ? 's' : ''} evaluated
                      </CardDescription>
                    </div>
                    {user?.role === 'admin' && (
                      <Dialog open={isDialogOpen && selectedEvaluation?.id === evaluation.id} 
                              onOpenChange={(open) => {
                                setIsDialogOpen(open);
                                if (open) setSelectedEvaluation(evaluation);
                                else {
                                  setSelectedEvaluation(null);
                                  setSelectedUser('');
                                  setScore(0);
                                }
                              }}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign Score
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Score - {evaluation.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="user">Select Employee</Label>
                              <select
                                id="user"
                                className="w-full p-2 border rounded-md"
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                disabled={isSubmitting}
                              >
                                <option value="">Choose an employee...</option>
                                {usersWithoutScore.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.name} ({u.email})
                                  </option>
                                ))}
                                {evaluation.scores.map((s) => (
                                  <option key={s.user.id} value={s.user.id}>
                                    {s.user.name} ({s.user.email}) - Current: {s.score}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="score">Score (0-100)</Label>
                              <Input
                                id="score"
                                type="number"
                                min="0"
                                max="100"
                                value={score}
                                onChange={(e) => setScore(Number(e.target.value))}
                                disabled={isSubmitting}
                              />
                              {score > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium mb-2">Score Bucket:</p>
                                  {SCORE_BUCKETS.map((bucket) => (
                                    <div key={bucket.label} className="flex items-center gap-2 py-1">
                                      <div className={`w-4 h-4 rounded ${
                                        score >= bucket.min && score <= bucket.max 
                                          ? bucket.color 
                                          : 'bg-gray-200'
                                      }`} />
                                      <span className={`text-sm ${
                                        score >= bucket.min && score <= bucket.max 
                                          ? 'font-semibold' 
                                          : 'text-muted-foreground'
                                      }`}>
                                        {bucket.label}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <Button 
                              onClick={handleAssignScore} 
                              disabled={isSubmitting || !selectedUser || score < 0 || score > 100}
                              className="w-full"
                            >
                              {isSubmitting ? 'Assigning...' : 'Assign Score'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Employee View: Show their own score */}
                  {user?.role === 'employee' && myScore && (
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">Your Score</p>
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all"
                              style={{ 
                                width: `${myScore.score}%`,
                                backgroundColor: getScoreBucket(myScore.score)?.hex || 'hsl(var(--primary))'
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-3xl font-bold">{myScore.score}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {getScoreBucket(myScore.score)?.label.split(' (')[1]?.replace(')', '')}
                      </p>
                    </div>
                  )}

                  {/* Average Score */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Team Average</p>
                      <span className="text-2xl font-semibold">{averageScore}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary transition-all"
                        style={{ width: `${averageScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Admin View: Show all scores and score distribution */}
                  {user?.role === 'admin' && (
                    <>
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-3">Score Distribution</p>
                        <div className="space-y-2">
                          {SCORE_BUCKETS.map((bucket) => {
                            const count = evaluation.scores.filter(
                              s => s.score >= bucket.min && s.score <= bucket.max
                            ).length;
                            const percentage = evaluation.scores.length > 0
                              ? Math.round((count / evaluation.scores.length) * 100)
                              : 0;
                            
                            return (
                              <div key={bucket.label} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">{bucket.label}</span>
                                  <span className="font-medium">{count} ({percentage}%)</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full transition-all"
                                    style={{ 
                                      width: `${percentage}%`,
                                      backgroundColor: bucket.hex
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-3">All Scores</p>
                        <div className={`space-y-2 ${evaluation.scores.length > 3 ? 'max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200' : ''}`}>
                          {evaluation.scores
                            .sort((a, b) => b.score - a.score)
                            .map((scoreItem) => {
                              const bucket = getScoreBucket(scoreItem.score);
                              return (
                                <div key={scoreItem.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={scoreItem.user.profilePicture || undefined} />
                                      <AvatarFallback className="text-xs">
                                        {scoreItem.user.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">{scoreItem.user.name}</p>
                                      <p className="text-xs text-muted-foreground">{scoreItem.user.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${bucket?.color}`} />
                                    <span className="text-lg font-bold">{scoreItem.score}</span>
                                  </div>
                                </div>
                              );
                            })}
                          {evaluation.scores.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No scores assigned yet
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && evaluations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">No evaluations available</p>
            <p className="text-sm text-muted-foreground">
              {user?.role === 'admin' 
                ? 'Contact system administrator to create evaluations' 
                : 'Evaluations will appear here once created'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
