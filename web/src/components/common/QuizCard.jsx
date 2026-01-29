import { useState } from 'react';
import Button from '../common/Button';
import { Clock, CheckCircle, FileText, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const QuizCard = ({ quiz, onStart, onViewResults, hasResults, isCompleted }) => {
  const { t } = useLanguage();
  const getQuizIcon = (type) => {
    const icons = {
      ipip120: <TrendingUp className="w-8 h-8 text-primary" />,
      ipip50: <TrendingUp className="w-8 h-8 text-blue-600" />,
      phq9: <FileText className="w-8 h-8 text-purple-600" />,
    };
    return icons[type] || <FileText className="w-8 h-8 text-gray-600" />;
  };

  const getQuizColor = (type) => {
    const colors = {
      ipip120: 'border-primary bg-primary/5 dark:bg-primary/10',
      ipip50: 'border-blue-600 bg-blue-50 dark:bg-blue-900/20',
      phq9: 'border-purple-600 bg-purple-50 dark:bg-purple-900/20',
    };
    return colors[type] || 'border-gray-300 bg-gray-50 dark:bg-gray-800';
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${getQuizColor(quiz.type)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getQuizIcon(quiz.type)}
          <div>
            <h3 className="text-lg font-bold text-textPrimary dark:text-white">{quiz.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-textSecondary dark:text-gray-400" />
              <span className="text-sm text-textSecondary dark:text-gray-400">{quiz.duration}</span>
            </div>
          </div>
        </div>
        {isCompleted && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="w-3 h-3" />
            {t.patient.profile.assessmentCompleted}
          </span>
        )}
      </div>

      <p className="text-sm text-textSecondary dark:text-gray-400 mb-4">{quiz.description}</p>

      <div className="flex items-center justify-between text-sm text-textSecondary dark:text-gray-400 mb-4">
        <span>{quiz.totalQuestions} {t.patient.quizzes.questions}</span>
      </div>

      <div className="flex gap-2">
        {hasResults && (
          <Button
            variant="outline"
            size="small"
            className="flex-1"
            onClick={() => onViewResults(quiz.type)}
          >
            {t.patient.profile.viewResults}
          </Button>
        )}
        <Button
          variant="primary"
          size="small"
          className="flex-1"
          onClick={() => onStart(quiz.type)}
        >
          {isCompleted ? t.patient.profile.retakeAssessment : t.patient.profile.startAssessment}
        </Button>
      </div>
    </div>
  );
};

export default QuizCard;
