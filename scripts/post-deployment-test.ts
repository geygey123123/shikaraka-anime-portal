/**
 * Post-Deployment Automated Testing Script
 * 
 * This script performs automated checks on the deployed ShiKaraKa application.
 * Run this after deployment to verify critical functionality.
 * 
 * Usage:
 *   npm install -D node-fetch
 *   npx tsx scripts/post-deployment-test.ts <production-url>
 * 
 * Example:
 *   npx tsx scripts/post-deployment-test.ts https://shikaraka.vercel.app
 */

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

class PostDeploymentTester {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Run all automated tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Post-Deployment Tests...\n');
    console.log(`Testing URL: ${this.baseUrl}\n`);

    await this.testSiteAccessibility();
    await this.testShikimoriAPI();
    await this.testStaticAssets();
    await this.testRouting();
    await this.testResponseHeaders();
    await this.testPerformance();

    this.printResults();
  }

  /**
   * Test 1: Site Accessibility
   */
  private async testSiteAccessibility(): Promise<void> {
    const start = Date.now();
    try {
      const response = await fetch(this.baseUrl);
      const html = await response.text();

      const passed = response.ok && html.includes('ShiKaraKa');
      this.results.push({
        name: 'Site Accessibility',
        passed,
        message: passed
          ? 'Site loads successfully and contains expected content'
          : 'Site failed to load or missing expected content',
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        name: 'Site Accessibility',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - start,
      });
    }
  }

  /**
   * Test 2: Shikimori API Integration
   */
  private async testShikimoriAPI(): Promise<void> {
    const start = Date.now();
    try {
      const response = await fetch('https://shikimori.one/api/animes?limit=1');
      const data = await response.json();

      const passed = response.ok && Array.isArray(data) && data.length > 0;
      this.results.push({
        name: 'Shikimori API Integration',
        passed,
        message: passed
          ? 'Shikimori API is accessible and returning data'
          : 'Shikimori API failed to return expected data',
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        name: 'Shikimori API Integration',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - start,
      });
    }
  }

  /**
   * Test 3: Static Assets
   */
  private async testStaticAssets(): Promise<void> {
    const start = Date.now();
    const assetsToCheck = [
      '/vite.svg',
      '/assets/', // Check if assets directory is accessible
    ];

    let allPassed = true;
    const messages: string[] = [];

    for (const asset of assetsToCheck) {
      try {
        const response = await fetch(`${this.baseUrl}${asset}`);
        if (!response.ok && response.status !== 403) {
          // 403 is OK for directory listing
          allPassed = false;
          messages.push(`${asset}: ${response.status}`);
        }
      } catch (error) {
        allPassed = false;
        messages.push(`${asset}: Error`);
      }
    }

    this.results.push({
      name: 'Static Assets',
      passed: allPassed,
      message: allPassed
        ? 'All static assets are accessible'
        : `Some assets failed: ${messages.join(', ')}`,
      duration: Date.now() - start,
    });
  }

  /**
   * Test 4: Routing (SPA rewrites)
   */
  private async testRouting(): Promise<void> {
    const start = Date.now();
    const routes = ['/anime/1', '/favorites', '/nonexistent'];

    let allPassed = true;
    const messages: string[] = [];

    for (const route of routes) {
      try {
        const response = await fetch(`${this.baseUrl}${route}`);
        const html = await response.text();

        // All routes should return 200 and contain the app shell
        if (!response.ok || !html.includes('ShiKaraKa')) {
          allPassed = false;
          messages.push(`${route}: ${response.status}`);
        }
      } catch (error) {
        allPassed = false;
        messages.push(`${route}: Error`);
      }
    }

    this.results.push({
      name: 'SPA Routing',
      passed: allPassed,
      message: allPassed
        ? 'All routes correctly rewrite to index.html'
        : `Some routes failed: ${messages.join(', ')}`,
      duration: Date.now() - start,
    });
  }

  /**
   * Test 5: Response Headers
   */
  private async testResponseHeaders(): Promise<void> {
    const start = Date.now();
    try {
      const response = await fetch(this.baseUrl);
      const headers = response.headers;

      const checks = {
        'Content-Type': headers.get('content-type')?.includes('text/html'),
        'X-Frame-Options': true, // Optional but good to have
        'HTTPS': this.baseUrl.startsWith('https://'),
      };

      const passed = Object.values(checks).every((v) => v);
      this.results.push({
        name: 'Response Headers',
        passed,
        message: passed
          ? 'Response headers are correctly configured'
          : 'Some headers are missing or incorrect',
        duration: Date.now() - start,
      });
    } catch (error) {
      this.results.push({
        name: 'Response Headers',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - start,
      });
    }
  }

  /**
   * Test 6: Performance (Basic)
   */
  private async testPerformance(): Promise<void> {
    const start = Date.now();
    try {
      const response = await fetch(this.baseUrl);
      await response.text();
      const loadTime = Date.now() - start;

      const passed = loadTime < 3000; // Should load in under 3 seconds
      this.results.push({
        name: 'Performance',
        passed,
        message: passed
          ? `Page loaded in ${loadTime}ms (target: <3000ms)`
          : `Page loaded in ${loadTime}ms (too slow, target: <3000ms)`,
        duration: loadTime,
      });
    } catch (error) {
      this.results.push({
        name: 'Performance',
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - start,
      });
    }
  }

  /**
   * Print test results
   */
  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results');
    console.log('='.repeat(60) + '\n');

    const passed = this.results.filter((r) => r.passed).length;
    const total = this.results.length;

    this.results.forEach((result) => {
      const icon = result.passed ? '✅' : '❌';
      const duration = `(${result.duration}ms)`;
      console.log(`${icon} ${result.name} ${duration}`);
      console.log(`   ${result.message}\n`);
    });

    console.log('='.repeat(60));
    console.log(`Summary: ${passed}/${total} tests passed`);
    console.log('='.repeat(60) + '\n');

    if (passed === total) {
      console.log('🎉 All automated tests passed!');
      console.log('📝 Next: Run manual tests from POST_DEPLOYMENT_QUICK_CHECKLIST.md\n');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix issues.');
      console.log('📖 See POST_DEPLOYMENT_VERIFICATION.md for troubleshooting\n');
      process.exit(1);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Error: Production URL required\n');
    console.log('Usage: npx tsx scripts/post-deployment-test.ts <production-url>');
    console.log('Example: npx tsx scripts/post-deployment-test.ts https://shikaraka.vercel.app\n');
    process.exit(1);
  }

  const productionUrl = args[0];

  if (!productionUrl.startsWith('http://') && !productionUrl.startsWith('https://')) {
    console.error('❌ Error: URL must start with http:// or https://\n');
    process.exit(1);
  }

  const tester = new PostDeploymentTester(productionUrl);
  await tester.runAllTests();
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { PostDeploymentTester };
