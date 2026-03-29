'use client';

import { useState } from 'react';
import { ClaimForm } from '@/components/insurance/ClaimForm';
import { ClaimStatus } from '@/components/insurance/ClaimStatus';
import { InsurancePool } from '@/components/insurance/InsurancePool';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function InsurancePage() {
  const [selectedClaimId, setSelectedClaimId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock token address - in real app this would come from user's groups
  const tokenAddress = 'CAS3J7GYCCXG7YKS6273IKXJIBFGSK244U64S3E4L2UHSQUW6NWHI26B';
  
  // Mock data for form
  const mockCycles = [1, 2, 3, 4, 5];
  const mockMembers = [
    { address: 'GABC123DEFGHIJKLMNOPQRSTUVWXYZ456789ABCDEFGHIJKLMNOP', name: 'Alice' },
    { address: 'GDEF456GHIJKLMNOPQRSTUVWXYZ789012ABCDEFGHIJKLMNOPQR', name: 'Bob' },
    { address: 'GHIJ789KLMNOPQRSTUVWXYZ012345ABCDEFGHIJKLMNOPQRSTUV', name: 'Charlie' },
  ];

  const handleClaimFiled = (claimId: string) => {
    setSelectedClaimId(claimId);
    // Switch to status tab after filing
    const statusTab = document.querySelector('[value="status"]') as HTMLElement;
    if (statusTab) statusTab.click();
  };

  const handleClaimProcessed = () => {
    // Refresh the pool data
    setRefreshKey(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Insurance Center</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Protect your Ajo group contributions with automated insurance claims and verification.
        </p>
      </div>

      {/* Insurance Pool Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Pool Overview</h2>
        </div>
        <InsurancePool 
          key={`pool-${refreshKey}`}
          tokenAddress={tokenAddress}
          tokenSymbol="XLM"
          onRefresh={handleRefresh}
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="file" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="file">File Claim</TabsTrigger>
          <TabsTrigger value="status">Claim Status</TabsTrigger>
          <TabsTrigger value="history">Claim History</TabsTrigger>
        </TabsList>

        {/* File Claim Tab */}
        <TabsContent value="file" className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold">File Insurance Claim</h3>
            <p className="text-muted-foreground">
              Submit a claim for a defaulted contribution. Claims are automatically verified based on on-chain data.
            </p>
          </div>
          
          <ClaimForm
            availableCycles={mockCycles}
            members={mockMembers}
            tokenAddress={tokenAddress}
            onSuccess={handleClaimFiled}
          />
        </TabsContent>

        {/* Claim Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold">Claim Status</h3>
            <p className="text-muted-foreground">
              Track the status of your insurance claims and verify their progress.
            </p>
          </div>

          {/* Claim ID Input */}
          {!selectedClaimId && (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Enter Claim ID</CardTitle>
                <CardDescription>
                  Enter the claim ID to view its current status and details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter claim ID..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setSelectedClaimId(e.target.value)}
                  />
                  <button
                    onClick={() => setSelectedClaimId(selectedClaimId)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Claim Status
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Claim Status Display */}
          {selectedClaimId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Viewing claim: <code className="bg-gray-100 px-2 py-1 rounded">{selectedClaimId}</code>
                </p>
                <button
                  onClick={() => setSelectedClaimId('')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View different claim
                </button>
              </div>
              
              <ClaimStatus
                claimId={selectedClaimId}
                showActions={true}
                onClaimProcessed={handleClaimProcessed}
              />
            </div>
          )}
        </TabsContent>

        {/* Claim History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold">Claim History</h3>
            <p className="text-muted-foreground">
              View all insurance claims and their historical data.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Claims</CardTitle>
              <CardDescription>
                A history of all insurance claims filed in the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Claim history feature coming soon.</p>
                <p className="text-sm mt-2">
                  This will show a comprehensive list of all claims with filtering and search capabilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🛡️ Automatic Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Claims are automatically verified using on-chain contribution data. No manual intervention required.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">⚡ Fast Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Once verified, claims are processed instantly and funds are transferred directly to the claimant.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🔊 Transparent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All claim activities are recorded on-chain with full transparency and auditability.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
