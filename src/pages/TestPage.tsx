import React, { useEffect, useState } from 'react';
import { testIntegration } from '../lib/api/test-integration';
import { Loader2 } from 'lucide-react';

const TestPage: React.FC = () => {
  const [status, setStatus] = useState<{
    loading: boolean;
    success?: boolean;
    error?: any;
  }>({ loading: true });

  useEffect(() => {
    async function runTest() {
      try {
        const result = await testIntegration();
        setStatus({ loading: false, success: result.success });
      } catch (error) {
        setStatus({ loading: false, success: false, error });
      }
    }
    runTest();
  }, []);

  if (status.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-cosmic-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="cosmos-card p-8">
          <h1 className="text-2xl font-display mb-6">API Integration Test</h1>
          
          {status.success ? (
            <div className="text-green-400">
              ✓ API integrations are working correctly
            </div>
          ) : (
            <div className="text-red-400">
              ✗ API integration test failed
              {status.error && (
                <pre className="mt-4 p-4 bg-cosmic-black/50 rounded-md overflow-auto">
                  {JSON.stringify(status.error, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;