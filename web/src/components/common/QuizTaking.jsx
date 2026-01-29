import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Button from './Button';
import quizService from '../../services/quizService';

const QuizTaking = ({ quizType, onComplete, onCancel }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const quizName = quizService.getQuizName(quizType);
  const totalQuestions = quizService.getTotalQuestions(quizType);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const service = quizService[quizType];
      const questionsData = await service.getQuestions();
      
      setQuestions(questionsData);
      setProgress({ current: 0, total: questionsData.length });
      setLoading(false);
    } catch (err) {
      console.error('Error loading questions:', err);
      setError('Failed to load questions. Please try again.');
      setLoading(false);
    }
  }, [quizType]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleAnswerSelect = async (questionId, answer) => {
    try {
      // Update local state
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));

      // Submit answer to backend
      const service = quizService[quizType];
      await service.submitQuestion(questionId, answer);

      // Update progress
      const answeredCount = Object.keys({ ...answers, [questionId]: answer }).length;
      setProgress({ current: answeredCount, total: questions.length });

    } catch (err) {
      console.error('Error submitting answer:', err);
      // Still allow local progress even if submission fails
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Check if all questions are answered
    const unansweredCount = questions.length - Object.keys(answers).length;
    
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const service = quizService[quizType];
      const result = await service.submitQuiz();
      
      // Call onComplete with results
      onComplete(result);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  const renderLikertScale = (question) => {
    const currentAnswer = answers[question.id];
    const options = [
      { value: 1, label: 'Strongly Disagree' },
      { value: 2, label: 'Disagree' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Agree' },
      { value: 5, label: 'Strongly Agree' }
    ];

    return (
      <div className="space-y-3">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => handleAnswerSelect(question.id, option.value)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              currentAnswer === option.value
                ? 'border-primary bg-primary bg-opacity-10 font-semibold'
                : 'border-gray-200 hover:border-primary hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-textPrimary">{option.label}</span>
              {currentAnswer === option.value && (
                <CheckCircle className="w-5 h-5 text-primary" />
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderPHQ9Scale = (question) => {
    const currentAnswer = answers[question.id];
    const options = [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' }
    ];

    return (
      <div className="space-y-3">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => handleAnswerSelect(question.id, option.value)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              currentAnswer === option.value
                ? 'border-primary bg-primary bg-opacity-10 font-semibold'
                : 'border-gray-200 hover:border-primary hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-textPrimary">{option.label}</span>
              {currentAnswer === option.value && (
                <CheckCircle className="w-5 h-5 text-primary" />
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textSecondary">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-red-800">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Error</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button onClick={loadQuestions} variant="outline">
            Try Again
          </Button>
          <Button onClick={onCancel} variant="ghost">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-textSecondary">No questions available.</p>
        <Button onClick={onCancel} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercentage = (progress.current / progress.total) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-textPrimary">{quizName}</h2>
          <div className="flex items-center gap-2 text-textSecondary">
            <Clock className="w-5 h-5" />
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-textSecondary mt-2">
          <span>{progress.current} answered</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-primary bg-opacity-10 text-primary text-sm font-medium rounded-full mb-4">
            Question {currentIndex + 1}
          </span>
          <h3 className="text-xl font-semibold text-textPrimary leading-relaxed">
            {currentQuestion.text}
          </h3>
        </div>

        {/* Render appropriate scale based on quiz type */}
        {quizType === 'phq9' ? renderPHQ9Scale(currentQuestion) : renderLikertScale(currentQuestion)}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-3">
          <Button onClick={onCancel} variant="ghost">
            Save & Exit
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="flex items-center gap-2"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
              <CheckCircle className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;
