import React from 'react';
import { CheckCircle, TrendingUp, AlertCircle, FileText, BarChart3, ArrowLeft } from 'lucide-react';
import Button from './Button';
import { useLanguage } from '../../hooks/useLanguage';

const QuizResults = ({ quizType, results, onClose, onRetake }) => {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
  const renderPersonalityResults = () => {
    if (!results?.traits) return null;

    const traitIcons = {
      openness: '🎨',
      conscientiousness: '📋',
      extraversion: '👥',
      agreeableness: '🤝',
      neuroticism: '😰'
    };

    const getScoreColor = (score) => {
      if (score >= 70) return 'text-green-600 bg-green-100';
      if (score >= 40) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    };

    return (
      <div className="space-y-6">
        <div className="text-center pb-6 border-b dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary bg-opacity-10 dark:bg-primary/20 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-textPrimary dark:text-white mb-2">
            {t.patient.quizzes.yourPersonalityProfile}
          </h2>
          <p className="text-textSecondary dark:text-gray-400">
            {t.patient.quizzes.basedOnBigFive}
          </p>
        </div>

        <div className="grid gap-6">
          {Object.entries(results.traits).map(([trait, data]) => {
            const score = data.score || 0;
            const percentage = Math.round(score);
            
            return (
              <div key={trait} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-3xl">{traitIcons[trait.toLowerCase()]}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-textPrimary dark:text-white capitalize">
                        {trait}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(percentage)}`}>
                        {percentage}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                      <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    {/* Interpretation */}
                    {data.interpretation && (
                      <p className="text-sm text-textSecondary dark:text-gray-400 leading-relaxed">
                        {data.interpretation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {results.summary && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t.patient.quizzes.overallSummary}
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              {results.summary}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderPHQ9Results = () => {
    if (results?.score === undefined) return null;

    const score = results.score;
    const getSeverityLevel = () => {
      if (score <= 4) return { level: 'Minimal', color: 'green', description: 'Minimal or no depression' };
      if (score <= 9) return { level: 'Mild', color: 'yellow', description: 'Mild depression' };
      if (score <= 14) return { level: 'Moderate', color: 'orange', description: 'Moderate depression' };
      if (score <= 19) return { level: 'Moderately Severe', color: 'red', description: 'Moderately severe depression' };
      return { level: 'Severe', color: 'red', description: 'Severe depression' };
    };

    const severity = getSeverityLevel();
    const colorClasses = {
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <div className="space-y-6">
        <div className="text-center pb-6 border-b dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-textPrimary dark:text-white mb-2">
            {t.patient.quizzes.depressionScreeningResults}
          </h2>
          <p className="text-textSecondary dark:text-gray-400">
            {t.patient.quizzes.depressionSeverityScore}
          </p>
        </div>

        {/* Score Display */}
        <div className={`rounded-lg p-8 border-2 ${colorClasses[severity.color]}`}>
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">{score}</div>
            <div className="text-xl font-semibold mb-2">{severity.level}</div>
            <p className="text-sm">{severity.description}</p>
          </div>
        </div>

        {/* Score Scale */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
          <h4 className="font-semibold text-textPrimary dark:text-white mb-4">{t.patient.quizzes.scoreInterpretation}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-textSecondary dark:text-gray-400">0-4: {t.patient.quizzes.minimalDepression}</span>
              <span className="font-medium text-green-600">✓</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary dark:text-gray-400">5-9: {t.patient.quizzes.mildDepression}</span>
              <span className="font-medium text-yellow-600">!</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary dark:text-gray-400">10-14: {t.patient.quizzes.moderateDepression}</span>
              <span className="font-medium text-orange-600">!!</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary dark:text-gray-400">15-19: {t.patient.quizzes.moderatelySevereDepression}</span>
              <span className="font-medium text-red-600">!!!</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary dark:text-gray-400">20-27: {t.patient.quizzes.severeDepression}</span>
              <span className="font-medium text-red-600">!!!!</span>
            </div>
          </div>
        </div>

        {/* Critical Alert - Safety Notice */}
        {results.hasCriticalAlert && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-700 rounded-lg p-6 animate-pulse">
            <h4 className="font-bold text-red-900 dark:text-red-300 mb-3 flex items-center gap-2 text-lg">
              <AlertCircle className="w-6 h-6" />
              🚨 {t.patient.quizzes.criticalSafetyAlert}
            </h4>
            <p className="text-red-800 dark:text-red-200 leading-relaxed mb-4 font-semibold">
              {isArabic ? results.alertMessageAr : results.alertMessage}
            </p>
            <div className="mt-4 pt-4 border-t border-red-300 dark:border-red-700">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                {t.patient.quizzes.emergencyResources}
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                <li>• {t.patient.quizzes.hotline988}</li>
                <li>• {t.patient.quizzes.crisisText}</li>
                <li>• {t.patient.quizzes.emergency911}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {score >= 10 && !results.hasCriticalAlert && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {t.patient.quizzes.recommendation}
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 leading-relaxed">
              {t.patient.quizzes.phq9Recommendation}
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">{t.patient.quizzes.nextSteps}</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
            <li>• {t.patient.quizzes.nextStep1}</li>
            <li>• {t.patient.quizzes.nextStep2}</li>
            <li>• {t.patient.quizzes.nextStep3}</li>
            <li>• {t.patient.quizzes.nextStep4}</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderGenericResults = () => {
    return (
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-textPrimary dark:text-white">
          {t.patient.quizzes.assessmentCompleted}
        </h2>
        <p className="text-textSecondary dark:text-gray-400">
          {t.patient.quizzes.responsesRecorded}
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
          <pre className="text-left text-sm overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-8">
        {/* Render appropriate results based on quiz type */}
        {quizType === 'phq9' && renderPHQ9Results()}
        {(quizType === 'ipip50' || quizType === 'ipip120') && renderPersonalityResults()}
        {!['phq9', 'ipip50', 'ipip120'].includes(quizType) && renderGenericResults()}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t dark:border-gray-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.patient.quizzes.backToAssessments}
          </Button>
          
          <Button
            onClick={onRetake}
            className="flex items-center gap-2"
          >
            {t.patient.quizzes.retakeAssessment}
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-textSecondary dark:text-gray-400 text-center">
            <strong>{t.patient.quizzes.disclaimerTitle}</strong> {t.patient.quizzes.disclaimerText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
