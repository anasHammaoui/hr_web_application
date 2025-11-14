'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface EvaluationReport {
  evaluationId: string;
  evaluationName: string;
  totalScores: number;
  averageScore: number;
  distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<EvaluationReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports/evaluations');
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBucketColor = (bucket: string) => {
    switch (bucket) {
      case '0-30':
        return 'bg-red-500';
      case '31-50':
        return 'bg-orange-500';
      case '51-70':
        return 'bg-yellow-500';
      case '71-100':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">View evaluation performance reports</p>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reports.map((report) => {
            const maxCount = Math.max(...report.distribution.map((d) => d.count));

            return (
              <Card key={report.evaluationId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {report.evaluationName}
                  </CardTitle>
                  <CardDescription>
                    {report.totalScores} employees evaluated • Avg: {report.averageScore}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.distribution.map((dist) => {
                      const barWidth = maxCount > 0 ? (dist.count / maxCount) * 100 : 0;

                      return (
                        <div key={dist.range}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{dist.range}%</span>
                            <span className="text-sm text-muted-foreground">
                              {dist.count} ({dist.percentage}%)
                            </span>
                          </div>
                          <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                            <div
                              className={`h-full ${getBucketColor(dist.range)} transition-all flex items-center justify-end pr-2`}
                              style={{ width: `${barWidth}%` }}
                            >
                              {dist.count > 0 && (
                                <span className="text-xs font-semibold text-white">{dist.count}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Performance Distribution</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-red-500" />
                        <span>Poor (0-30%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-orange-500" />
                        <span>Fair (31-50%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-yellow-500" />
                        <span>Good (51-70%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded bg-green-500" />
                        <span>Excellent (71-100%)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && reports.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">No reports available</p>
            <p className="text-sm text-muted-foreground">Reports will appear once evaluations are completed</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
