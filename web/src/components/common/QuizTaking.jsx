import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Button from './Button';
import quizService from '../../services/quizService';
import { useLanguage } from '../../hooks/useLanguage';

const QuizTaking = ({ quizType, onComplete, onCancel }) => {
  const { t, language } = useLanguage();
  const isArabic = language === 'ar';
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
      const message = t.patient.quizzes.unansweredQuestions.replace('{count}', unansweredCount);
      if (!window.confirm(message)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const service = quizService[quizType];
      const result = await service.submitQuiz();
      
      console.log('✅ [QUIZ] Quiz submitted successfully:', { quizType, result });
      
      // Call onComplete with results
      onComplete(result);
    } catch (err) {
      console.error('❌ [QUIZ] Error submitting quiz:', err);
      setError(t.patient.quizzes.failedToSubmit);
      setSubmitting(false);
    }
  };

  const renderLikertScale = (question) => {
    const currentAnswer = answers[question.id];
    const options = [
      { value: 1, label: t.patient.quizzes.stronglyDisagree },
      { value: 2, label: t.patient.quizzes.disagree },
      { value: 3, label: t.patient.quizzes.neutral },
      { value: 4, label: t.patient.quizzes.agree },
      { value: 5, label: t.patient.quizzes.stronglyAgree }
    ];

    return (
      <div className="space-y-3">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => handleAnswerSelect(question.id, option.value)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              currentAnswer === option.value
                ? 'border-primary bg-primary/10 dark:bg-primary/20 font-semibold'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-textPrimary dark:text-white">{option.label}</span>
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
      { value: 0, label: t.patient.quizzes.notAtAll },
      { value: 1, label: t.patient.quizzes.severalDays },
      { value: 2, label: t.patient.quizzes.moreThanHalf },
      { value: 3, label: t.patient.quizzes.nearlyEveryDay }
    ];

    return (
      <div className="space-y-3">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => handleAnswerSelect(question.id, option.value)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              currentAnswer === option.value
                ? 'border-primary bg-primary/10 dark:bg-primary/20 font-semibold'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-textPrimary dark:text-white">{option.label}</span>
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
          <p className="text-textSecondary dark:text-gray-400">{t.patient.quizzes.loadingQuestions}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3 text-red-800 dark:text-red-300">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">{t.patient.quizzes.error}</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button onClick={loadQuestions} variant="outline">
            {t.patient.quizzes.tryAgain}
          </Button>
          <Button onClick={onCancel} variant="ghost">
            {t.patient.quizzes.cancel}
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-textSecondary dark:text-gray-400">{t.patient.quizzes.noQuestionsAvailable}</p>
        <Button onClick={onCancel} className="mt-4">
          {t.patient.quizzes.goBack}
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
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-textPrimary dark:text-white">{quizName}</h2>
          <div className="flex items-center gap-2 text-textSecondary dark:text-gray-400">
            <Clock className="w-5 h-5" />
            <span>{t.patient.quizzes.question} {currentIndex + 1} {t.patient.quizzes.of} {totalQuestions}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-textSecondary dark:text-gray-400 mt-2">
          <span>{progress.current} {t.patient.quizzes.answered}</span>
          <span>{Math.round(progressPercentage)}% {t.patient.quizzes.complete}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-8 mb-6">
        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-light text-sm font-medium rounded-full mb-4">
            {t.patient.quizzes.question} {currentIndex + 1}
          </span>
          
          <h3 className="text-xl font-semibold text-textPrimary dark:text-white leading-relaxed">
            {isArabic && currentQuestion.textAr ? currentQuestion.textAr : currentQuestion.text}
          </h3>
          {!isArabic && currentQuestion.textAr && (
            <p className="text-lg text-textSecondary dark:text-gray-400 mt-3 font-arabic" dir="rtl">
              {currentQuestion.textAr}
            </p>
          )}
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
          {t.patient.quizzes.previous}
        </Button>

        <div className="flex gap-3">
          <Button onClick={onCancel} variant="ghost">
            {t.patient.quizzes.saveAndExit}
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="flex items-center gap-2"
            >
              {submitting ? t.patient.quizzes.submitting : t.patient.quizzes.submit}
              <CheckCircle className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {t.patient.quizzes.next}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;
