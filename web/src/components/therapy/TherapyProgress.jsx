import { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import Button from '../common/Button';
import therapyProgressService from '../../services/therapyProgressService';
import { showToast } from '../../utils/toast';

/**
 * TherapyProgress Component
 * 
 * Displays assessment history with progress visualization.
 * Shows trends, improvements, and detailed history of all assessments.
 * 
 * Features:
 * - Assessment history timeline
 * - Progress charts and visualizations
 * - Score trends over time
 * - Summary statistics
 */
const TherapyProgress = () => {
  const { t } = useLanguage();
  const [progressData, setProgressData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, [selectedType]);

  const fetchProgressData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch both history and summary
      const [history, summaryData] = await Promise.all([
        therapyProgressService.getProgressHistory(),
        therapyProgressService.getProgressSummary()
      ]);
      
      setProgressData(history.content || []);
      setSummary(summaryData);
      
    } catch (error) {
      console.error('Error fetching therapy progress:', error);
      showToast.error(t.therapyProgress?.loadError || 'Failed to load therapy progress');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAssessmentName = (type) => {
    const names = {
      phq9: 'PHQ-9 Depression Screening',
      ipip50: 'IPIP-50 Personality Assessment',
      ipip120: 'IPIP-120 Comprehensive Assessment'
    };
    return names[type] || type;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'None': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Minimal': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'Mild': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Moderate': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'Moderately Severe': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'Severe': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') {
      return (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    }
    if (trend === 'declining') {
      return (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
      </svg>
    );
  };

  const filteredData = selectedType === 'all' 
    ? progressData 
    : progressData.filter(item => item.assessmentType === selectedType);

  const getTraitIcon = (traitName) => {
    const icons = {
      openness: '🎨',
      conscientiousness: '📋',
      extraversion: '👥',
      agreeableness: '🤝',
      neuroticism: '😰'
    };
    return icons[traitName] || '📊';
  };

  const getTraitLabel = (traitName) => {
    const labels = {
      openness: 'Openness',
      conscientiousness: 'Conscientiousness',
      extraversion: 'Extraversion',
      agreeableness: 'Agreeableness',
      neuroticism: 'Neuroticism'
    };
    return labels[traitName] || traitName;
  };

  const getTraitDescription = (traitName, score) => {
    const descriptions = {
      openness: score > 70 ? 'You are imaginative, curious, and open to new experiences.' : score > 40 ? 'You balance practicality with openness to new ideas.' : 'You prefer familiar routines and concrete concepts.',
      conscientiousness: score > 70 ? 'You are highly organized, reliable, and self-controlled.' : score > 40 ? 'You are reasonably reliable, organized, and self-controlled.' : 'You tend to be more spontaneous and flexible in your approach.',
      extraversion: score > 70 ? 'You are outgoing, energetic, and enjoy being around people.' : score > 40 ? 'Your score is average; you are neither a subdued loner nor a jovial chatterbox. You enjoy time with others but also time alone.' : 'You are more reserved and prefer solitary activities.',
      agreeableness: score > 70 ? 'You are very warm, kind, and cooperative with others.' : score > 40 ? 'You are generally warm and kind but can be competitive when necessary. You balance your own needs with the needs of others.' : 'You tend to be more competitive and assertive in your interactions.',
      neuroticism: score > 70 ? 'You tend to experience more negative emotions and stress.' : score > 40 ? 'You experience normal levels of emotional ups and downs.' : 'You are emotionally stable and resilient to stress.'
    };
    return descriptions[traitName] || '';
  };

  const toggleExpanded = (itemId) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (progressData.length === 0) {
    return (
      <div className="text-center p-12">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-2">
          {t.therapyProgress?.noData || 'No Progress Data Yet'}
        </h3>
        <p className="text-textSecondary dark:text-gray-400 mb-6">
          {t.therapyProgress?.noDataDesc || 'Complete assessments to start tracking your therapy progress'}
        </p>
        <Button variant="primary" onClick={() => window.location.href = '/assessments'}>
          {t.therapyProgress?.takeAssessment || 'Take Assessment'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Total Assessments */}
          <div className="bg-white dark:bg-[#241D30] rounded-lg shadow-md p-6 border border-gray-200 dark:border-[#3F3651]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary dark:text-gray-400 mb-1">
                  {t.therapyProgress?.totalAssessments || 'Total Assessments'}
                </p>
                <p className="text-3xl font-bold text-textPrimary dark:text-white">
                  {summary.totalAssessments}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Improvement Trend */}
          <div className="bg-white dark:bg-[#241D30] rounded-lg shadow-md p-6 border border-gray-200 dark:border-[#3F3651]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-textSecondary dark:text-gray-400 mb-1">
                  {t.therapyProgress?.trend || 'Trend'}
                </p>
                <p className="text-lg font-semibold text-textPrimary dark:text-white capitalize">
                  {summary.improvementTrend}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                {getTrendIcon(summary.improvementTrend)}
              </div>
            </div>
          </div>

          {/* Latest PHQ-9 Score */}
          {summary.latestScores?.phq9 && (
            <div className="bg-white dark:bg-[#241D30] rounded-lg shadow-md p-6 border border-gray-200 dark:border-[#3F3651]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-textSecondary dark:text-gray-400 mb-1">
                    {t.therapyProgress?.latestPHQ9 || 'Latest PHQ-9'}
                  </p>
                  <p className="text-3xl font-bold text-textPrimary dark:text-white">
                    {summary.latestScores.phq9.score}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(summary.latestScores.phq9.severity)}`}>
                    {summary.latestScores.phq9.severity}
                  </span>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedType === 'all'
              ? 'bg-primary text-white'
              : 'bg-white dark:bg-[#241D30] text-textSecondary dark:text-gray-400 border border-gray-200 dark:border-[#3F3651] hover:bg-gray-50 dark:hover:bg-[#2A2235]'
          }`}
        >
          {t.therapyProgress?.allAssessments || 'All Assessments'}
        </button>
        <button
          onClick={() => setSelectedType('phq9')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedType === 'phq9'
              ? 'bg-primary text-white'
              : 'bg-white dark:bg-[#241D30] text-textSecondary dark:text-gray-400 border border-gray-200 dark:border-[#3F3651] hover:bg-gray-50 dark:hover:bg-[#2A2235]'
          }`}
        >
          PHQ-9
        </button>
        <button
          onClick={() => setSelectedType('ipip50')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedType === 'ipip50'
              ? 'bg-primary text-white'
              : 'bg-white dark:bg-[#241D30] text-textSecondary dark:text-gray-400 border border-gray-200 dark:border-[#3F3651] hover:bg-gray-50 dark:hover:bg-[#2A2235]'
          }`}
        >
          IPIP-50
        </button>
        <button
          onClick={() => setSelectedType('ipip120')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedType === 'ipip120'
              ? 'bg-primary text-white'
              : 'bg-white dark:bg-[#241D30] text-textSecondary dark:text-gray-400 border border-gray-200 dark:border-[#3F3651] hover:bg-gray-50 dark:hover:bg-[#2A2235]'
          }`}
        >
          IPIP-120
        </button>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white dark:bg-[#241D30] rounded-lg shadow-md p-6 border border-gray-200 dark:border-[#3F3651]">
        <h3 className="text-lg font-semibold text-textPrimary dark:text-white mb-6">
          {t.therapyProgress?.progressTimeline || 'Progress Timeline'}
        </h3>

        <div className="space-y-4">
          {filteredData.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Timeline Line */}
              {index !== filteredData.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              )}

              {/* Timeline Item */}
              <div className="flex gap-4">
                {/* Timeline Dot */}
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center z-10">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-50 dark:bg-[#1A1625] rounded-lg p-4 border border-gray-200 dark:border-[#3F3651]">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-textPrimary dark:text-white">
                        {getAssessmentName(item.assessmentType)}
                      </h4>
                      <p className="text-sm text-textSecondary dark:text-gray-400">
                        {formatDate(item.completionDate)}
                      </p>
                    </div>
                    {item.severity && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                        {item.severity}
                      </span>
                    )}
                  </div>

                  {/* Score Display */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-textSecondary dark:text-gray-400">
                        {t.therapyProgress?.score || 'Score'}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {item.score}
                        {item.assessmentType === 'phq9' && '/27'}
                        {item.assessmentType.startsWith('ipip') && '%'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${item.assessmentType === 'phq9' 
                            ? (item.score / 27) * 100 
                            : item.score}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Personality Traits for IPIP assessments */}
                  {(item.assessmentType === 'ipip50' || item.assessmentType === 'ipip120') && item.results?.traits && (
                    <div className="mt-4">
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        {expandedItem === item.id ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                            </svg>
                            Hide Details
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                            View Full Personality Profile
                          </>
                        )}
                      </button>

                      {/* Expanded Personality Profile */}
                      {expandedItem === item.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="bg-white dark:bg-[#241D30] rounded-lg p-6 space-y-6">
                            {/* Header */}
                            <div className="text-center">
                              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-3xl">🧠</span>
                              </div>
                              <h3 className="text-2xl font-bold text-textPrimary dark:text-white mb-2">
                                Your Personality Profile
                              </h3>
                              <p className="text-sm text-textSecondary dark:text-gray-400">
                                Based on the Big Five personality traits model
                              </p>
                            </div>

                            {/* Traits */}
                            <div className="space-y-4">
                              {Object.entries(item.results.traits).map(([traitName, score]) => (
                                <div key={traitName} className="bg-gray-50 dark:bg-[#1A1625] rounded-lg p-4 border border-gray-200 dark:border-[#3F3651]">
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">{getTraitIcon(traitName)}</span>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold text-textPrimary dark:text-white">
                                          {getTraitLabel(traitName)}
                                        </h4>
                                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-bold">
                                          {score}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
                                    <div
                                      className="bg-gradient-to-r from-primary to-purple-600 h-3 rounded-full transition-all duration-500"
                                      style={{ width: `${score}%` }}
                                    ></div>
                                  </div>

                                  {/* Description */}
                                  <p className="text-sm text-textSecondary dark:text-gray-400 leading-relaxed">
                                    {getTraitDescription(traitName, score)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
              {t.therapyProgress?.aboutProgress || 'About Your Progress'}
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              {t.therapyProgress?.progressInfo || 'Your therapy progress is tracked over time to help you and your doctor understand your mental health journey. Regular assessments provide valuable insights into your well-being.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapyProgress;
