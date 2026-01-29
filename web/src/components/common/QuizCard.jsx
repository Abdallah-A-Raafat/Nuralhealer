import { useState } from 'react';
import Button from '../common/Button';
import { Clock, CheckCircle, FileText, TrendingUp } from 'lucide-react';

const QuizCard = ({ quiz, onStart, onViewResults, hasResults, isCompleted }) => {
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
      ipip120: 'border-primary bg-primary/5',
      ipip50: 'border-blue-600 bg-blue-50',
      phq9: 'border-purple-600 bg-purple-50',
    };
    return colors[type] || 'border-gray-300 bg-gray-50';
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${getQuizColor(quiz.type)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getQuizIcon(quiz.type)}
          <div>
            <h3 className="text-lg font-bold text-textPrimary">{quiz.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-textSecondary" />
              <span className="text-sm text-textSecondary">{quiz.duration}</span>
            </div>
          </div>
        </div>
        {isCompleted && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        )}
      </div>

      <p className="text-sm text-textSecondary mb-4">{quiz.description}</p>

      <div className="flex items-center justify-between text-sm text-textSecondary mb-4">
        <span>{quiz.totalQuestions} questions</span>
      </div>

      <div className="flex gap-2">
        {hasResults && (
          <Button
            variant="outline"
            size="small"
            className="flex-1"
            onClick={() => onViewResults(quiz.type)}
          >
            View Results
          </Button>
        )}
        <Button
          variant="primary"
          size="small"
          className="flex-1"
          onClick={() => onStart(quiz.type)}
        >
          {isCompleted ? 'Retake Assessment' : 'Start Assessment'}
        </Button>
      </div>
    </div>
  );
};

export default QuizCard;
