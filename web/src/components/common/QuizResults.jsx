import React from 'react';
import { CheckCircle, TrendingUp, AlertCircle, FileText, BarChart3, ArrowLeft } from 'lucide-react';
import Button from './Button';

const QuizResults = ({ quizType, results, onClose, onRetake }) => {
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
        <div className="text-center pb-6 border-b">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary bg-opacity-10 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-textPrimary mb-2">
            Your Personality Profile
          </h2>
          <p className="text-textSecondary">
            Based on the Big Five personality traits model
          </p>
        </div>

        <div className="grid gap-6">
          {Object.entries(results.traits).map(([trait, data]) => {
            const score = data.score || 0;
            const percentage = Math.round(score);
            
            return (
              <div key={trait} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-3xl">{traitIcons[trait.toLowerCase()]}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-textPrimary capitalize">
                        {trait}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(percentage)}`}>
                        {percentage}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                      <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    {/* Interpretation */}
                    {data.interpretation && (
                      <p className="text-sm text-textSecondary leading-relaxed">
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Overall Summary
            </h4>
            <p className="text-sm text-blue-800 leading-relaxed">
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
        <div className="text-center pb-6 border-b">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-textPrimary mb-2">
            PHQ-9 Depression Screening Results
          </h2>
          <p className="text-textSecondary">
            Your depression severity score
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
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-textPrimary mb-4">Score Interpretation</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">0-4: Minimal depression</span>
              <span className="font-medium text-green-600">✓</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">5-9: Mild depression</span>
              <span className="font-medium text-yellow-600">!</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">10-14: Moderate depression</span>
              <span className="font-medium text-orange-600">!!</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">15-19: Moderately severe depression</span>
              <span className="font-medium text-red-600">!!!</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textSecondary">20-27: Severe depression</span>
              <span className="font-medium text-red-600">!!!!</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {score >= 10 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Recommendation
            </h4>
            <p className="text-sm text-yellow-800 leading-relaxed">
              Your score indicates you may be experiencing significant symptoms of depression. 
              We recommend discussing these results with a mental health professional who can 
              provide proper assessment and treatment options.
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-2">Next Steps</h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Share these results with your healthcare provider</li>
            <li>• Consider scheduling a therapy session</li>
            <li>• Retake this assessment periodically to track changes</li>
            <li>• Explore our mental health resources and support groups</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderGenericResults = () => {
    return (
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-textPrimary">
          Assessment Completed!
        </h2>
        <p className="text-textSecondary">
          Your responses have been recorded successfully.
        </p>
        <div className="bg-gray-50 rounded-lg p-6">
          <pre className="text-left text-sm overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Render appropriate results based on quiz type */}
        {quizType === 'phq9' && renderPHQ9Results()}
        {(quizType === 'ipip50' || quizType === 'ipip120') && renderPersonalityResults()}
        {!['phq9', 'ipip50', 'ipip120'].includes(quizType) && renderGenericResults()}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assessments
          </Button>
          
          <Button
            onClick={onRetake}
            className="flex items-center gap-2"
          >
            Retake Assessment
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-textSecondary text-center">
            <strong>Disclaimer:</strong> This assessment is a screening tool and does not constitute 
            a clinical diagnosis. For professional evaluation and treatment, please consult with a 
            qualified mental health professional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
