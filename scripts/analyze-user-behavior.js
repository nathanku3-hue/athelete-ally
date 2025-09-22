#!/usr/bin/env node

/**
 * User Behavior Analysis Script
 * Analyzes user behavior data from the monitoring system during beta testing
 */

const fs = require('fs');
const path = require('path');

class UserBehaviorAnalyzer {
  constructor() {
    this.analysisResults = {
      timestamp: new Date().toISOString(),
      summary: {},
      insights: [],
      recommendations: []
    };
  }

  async analyzeOnboardingFunnel() {
    console.log('🔍 Analyzing onboarding funnel...');
    
    // Simulate data analysis (in real implementation, this would query Prometheus)
    const funnelData = {
      purpose: { completed: 100, dropped: 5 },
      proficiency: { completed: 95, dropped: 8 },
      availability: { completed: 87, dropped: 12 },
      equipment: { completed: 75, dropped: 15 },
      summary: { completed: 60, dropped: 20 }
    };

    const conversionRates = {};
    let previousStep = 100;
    
    for (const [step, data] of Object.entries(funnelData)) {
      if (step === 'summary') break;
      const rate = (data.completed / previousStep) * 100;
      conversionRates[step] = rate;
      previousStep = data.completed;
    }

    const insights = [];
    const recommendations = [];

    // Identify drop-off points
    const sortedSteps = Object.entries(conversionRates)
      .sort(([,a], [,b]) => a - b);

    if (sortedSteps[0][1] < 80) {
      insights.push(`High drop-off at ${sortedSteps[0][0]} step (${sortedSteps[0][1].toFixed(1)}% conversion)`);
      recommendations.push(`Investigate and optimize ${sortedSteps[0][0]} step user experience`);
    }

    this.analysisResults.summary.onboarding = {
      totalConversion: (funnelData.summary.completed / 100) * 100,
      conversionRates,
      totalDropOff: 100 - funnelData.summary.completed
    };

    this.analysisResults.insights.push(...insights);
    this.analysisResults.recommendations.push(...recommendations);
  }

  async analyzeAPIPerformance() {
    console.log('⚡ Analyzing API performance...');
    
    // Simulate performance data analysis
    const performanceData = {
      gatewayBFF: { p50: 120, p95: 800, p99: 2000, errorRate: 0.5 },
      planningEngine: { p50: 2000, p95: 5000, p99: 10000, errorRate: 2.1 },
      profileOnboarding: { p50: 80, p95: 200, p99: 500, errorRate: 0.2 },
      exercises: { p50: 100, p95: 300, p99: 800, errorRate: 0.8 },
      fatigue: { p50: 150, p95: 400, p99: 1000, errorRate: 1.2 },
      workouts: { p50: 90, p95: 250, p99: 600, errorRate: 0.3 }
    };

    const insights = [];
    const recommendations = [];

    // Check for performance issues
    for (const [service, metrics] of Object.entries(performanceData)) {
      if (metrics.p95 > 2000) {
        insights.push(`${service} has high P95 response time: ${metrics.p95}ms`);
        recommendations.push(`Optimize ${service} performance - consider caching or database optimization`);
      }

      if (metrics.errorRate > 1.0) {
        insights.push(`${service} has high error rate: ${metrics.errorRate}%`);
        recommendations.push(`Investigate and fix errors in ${service}`);
      }
    }

    this.analysisResults.summary.performance = performanceData;
    this.analysisResults.insights.push(...insights);
    this.analysisResults.recommendations.push(...recommendations);
  }

  async analyzeUserEngagement() {
    console.log('📊 Analyzing user engagement...');
    
    // Simulate engagement data analysis
    const engagementData = {
      averageSessionDuration: 12.5, // minutes
      workoutCompletionRate: 78.5, // percentage
      fatigueAssessmentUsage: 65.2, // percentage
      progressDashboardUsage: 45.8, // percentage
      personalRecordsSet: 23, // count
      averageWorkoutsPerWeek: 3.2
    };

    const insights = [];
    const recommendations = [];

    // Analyze engagement patterns
    if (engagementData.workoutCompletionRate < 80) {
      insights.push(`Workout completion rate is ${engagementData.workoutCompletionRate}% - room for improvement`);
      recommendations.push('Investigate workout completion barriers and improve user experience');
    }

    if (engagementData.progressDashboardUsage < 50) {
      insights.push(`Progress dashboard usage is low: ${engagementData.progressDashboardUsage}%`);
      recommendations.push('Improve progress dashboard visibility and user education');
    }

    if (engagementData.fatigueAssessmentUsage < 70) {
      insights.push(`Fatigue assessment usage is moderate: ${engagementData.fatigueAssessmentUsage}%`);
      recommendations.push('Consider making fatigue assessment more prominent or easier to access');
    }

    this.analysisResults.summary.engagement = engagementData;
    this.analysisResults.insights.push(...insights);
    this.analysisResults.recommendations.push(...recommendations);
  }

  async analyzeFeatureUsage() {
    console.log('🎯 Analyzing feature usage...');
    
    // Simulate feature usage data
    const featureUsage = {
      planGeneration: { usage: 95, satisfaction: 4.2 },
      workoutTracking: { usage: 88, satisfaction: 4.5 },
      progressDashboard: { usage: 45, satisfaction: 4.0 },
      fatigueManagement: { usage: 65, satisfaction: 3.8 },
      exerciseLibrary: { usage: 72, satisfaction: 4.1 },
      personalRecords: { usage: 38, satisfaction: 4.7 }
    };

    const insights = [];
    const recommendations = [];

    // Identify popular and underutilized features
    const sortedByUsage = Object.entries(featureUsage)
      .sort(([,a], [,b]) => b.usage - a.usage);

    const mostPopular = sortedByUsage[0];
    const leastUsed = sortedByUsage[sortedByUsage.length - 1];

    insights.push(`Most popular feature: ${mostPopular[0]} (${mostPopular[1].usage}% usage, ${mostPopular[1].satisfaction}/5 satisfaction)`);
    insights.push(`Least used feature: ${leastUsed[0]} (${leastUsed[1].usage}% usage, ${leastUsed[1].satisfaction}/5 satisfaction)`);

    if (leastUsed[1].usage < 50) {
      recommendations.push(`Investigate why ${leastUsed[0]} is underutilized - consider UX improvements or user education`);
    }

    // Check satisfaction scores
    const lowSatisfaction = Object.entries(featureUsage)
      .filter(([, data]) => data.satisfaction < 4.0);

    if (lowSatisfaction.length > 0) {
      insights.push(`Features with low satisfaction: ${lowSatisfaction.map(([name]) => name).join(', ')}`);
      recommendations.push('Prioritize improvements for low-satisfaction features');
    }

    this.analysisResults.summary.featureUsage = featureUsage;
    this.analysisResults.insights.push(...insights);
    this.analysisResults.recommendations.push(...recommendations);
  }

  async generateReport() {
    console.log('📝 Generating analysis report...');
    
    const report = {
      ...this.analysisResults,
      keyFindings: this.analysisResults.insights.slice(0, 5),
      topRecommendations: this.analysisResults.recommendations.slice(0, 5),
      nextSteps: [
        'Review detailed metrics in Grafana dashboard',
        'Conduct user interviews for qualitative feedback',
        'Prioritize recommendations based on impact and effort',
        'Plan next iteration of improvements',
        'Schedule follow-up analysis in 1 week'
      ]
    };

    // Save report
    const reportPath = path.join(__dirname, '..', 'docs', 'beta-testing-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Analysis report saved to: ${reportPath}`);
    return report;
  }

  async run() {
    console.log('🚀 Starting user behavior analysis...\n');
    
    await this.analyzeOnboardingFunnel();
    await this.analyzeAPIPerformance();
    await this.analyzeUserEngagement();
    await this.analyzeFeatureUsage();
    
    const report = await this.generateReport();
    
    console.log('\n📋 Analysis Summary:');
    console.log(`- Onboarding conversion: ${report.summary.onboarding?.totalConversion?.toFixed(1)}%`);
    console.log(`- Key insights: ${report.insights.length}`);
    console.log(`- Recommendations: ${report.recommendations.length}`);
    
    console.log('\n🎯 Top Recommendations:');
    report.topRecommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    
    console.log('\n✅ Analysis complete!');
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new UserBehaviorAnalyzer();
  analyzer.run().catch(console.error);
}

module.exports = UserBehaviorAnalyzer;

