/**
 * Assessments Screen
 * Quiz/Assessment interface matching web version
 * Supports PHQ-9, IPIP-50, IPIP-120
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/themeStore';
import quizService from '../../services/quizService';

// Types
interface QuizInfo {
  type: 'phq9' | 'ipip50' | 'ipip120';
  name: string;
  description: string;
  duration: string;
  totalQuestions: number;
  icon: string;
}

interface Question {
  id: string | number;
  text: string;
  textAr?: string;
  order?: number;
}

// Quiz Card Component
const QuizCard: React.FC<{
  quiz: QuizInfo;
  onStart: () => void;
  onViewResults: () => void;
  hasResults: boolean;
  isCompleted: boolean;
  theme: any;
}> = ({ quiz, onStart, onViewResults, hasResults, isCompleted, theme }) => {
  const { t } = useTranslation();

  return (
    <View style={[styles.quizCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.quizCardHeader}>
        <Text style={styles.quizIcon}>{quiz.icon}</Text>
        <View style={styles.quizMeta}>
          <Text style={[styles.quizDuration, { color: theme.colors.textSecondary }]}>
            ⏱️ {quiz.duration}
          </Text>
          <Text style={[styles.quizQuestions, { color: theme.colors.textSecondary }]}>
            📝 {quiz.totalQuestions} {t('assessments.questions')}
          </Text>
        </View>
      </View>
      <Text style={[styles.quizName, { color: theme.colors.text }]}>{quiz.name}</Text>
      <Text style={[styles.quizDescription, { color: theme.colors.textSecondary }]}>
        {quiz.description}
      </Text>
      {isCompleted && (
        <View style={[styles.completedBadge, { backgroundColor: '#22C55E20' }]}>
          <Text style={[styles.completedText, { color: '#22C55E' }]}>
            ✓ {t('assessments.completed')}
          </Text>
        </View>
      )}
      <View style={styles.quizActions}>
        <TouchableOpacity
          style={[styles.startQuizBtn, { backgroundColor: theme.colors.primary }]}
          onPress={onStart}
        >
          <Text style={styles.startQuizBtnText}>
            {isCompleted ? t('assessments.retake') : t('assessments.start')}
          </Text>
        </TouchableOpacity>
        {hasResults && (
          <TouchableOpacity
            style={[styles.viewResultsBtn, { borderColor: theme.colors.primary }]}
            onPress={onViewResults}
          >
            <Text style={[styles.viewResultsBtnText, { color: theme.colors.primary }]}>
              {t('assessments.viewResults')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Quiz List View
const QuizListView: React.FC<{
  onStartQuiz: (type: string) => void;
  onViewResults: (type: string) => void;
  completedQuizzes: Record<string, boolean>;
  quizResults: Record<string, any>;
  theme: any;
}> = ({ onStartQuiz, onViewResults, completedQuizzes, quizResults, theme }) => {
  const { t } = useTranslation();

  const quizzes: QuizInfo[] = [
    {
      type: 'phq9',
      name: 'PHQ-9 Depression Screening',
      description: 'A 9-question screening tool widely used to assess depression severity',
      duration: '5 minutes',
      totalQuestions: 9,
      icon: '📋',
    },
    {
      type: 'ipip50',
      name: 'IPIP-50 Personality Assessment',
      description: 'Discover your personality traits based on the Big Five model',
      duration: '10-15 minutes',
      totalQuestions: 50,
      icon: '🧠',
    },
    {
      type: 'ipip120',
      name: 'IPIP-120 Comprehensive Assessment',
      description: 'In-depth personality analysis with 120 questions for detailed insights',
      duration: '20-30 minutes',
      totalQuestions: 120,
      icon: '📊',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t('assessments.title')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {t('assessments.subtitle')}
          </Text>
        </View>

        {/* Quiz Cards */}
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz.type}
            quiz={quiz}
            theme={theme}
            onStart={() => onStartQuiz(quiz.type)}
            onViewResults={() => onViewResults(quiz.type)}
            hasResults={!!quizResults[quiz.type]}
            isCompleted={!!completedQuizzes[quiz.type]}
          />
        ))}

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: '#EBF5FF', borderColor: '#3B82F6' }]}>
          <Text style={[styles.infoTitle, { color: '#1E40AF' }]}>
            💡 {t('assessments.whyTakeTitle')}
          </Text>
          <Text style={[styles.infoItem, { color: '#1E3A8A' }]}>
            ✓ {t('assessments.benefit1')}
          </Text>
          <Text style={[styles.infoItem, { color: '#1E3A8A' }]}>
            ✓ {t('assessments.benefit2')}
          </Text>
          <Text style={[styles.infoItem, { color: '#1E3A8A' }]}>
            ✓ {t('assessments.benefit3')}
          </Text>
          <Text style={[styles.infoItem, { color: '#1E3A8A' }]}>
            ✓ {t('assessments.benefit4')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Quiz Taking View
const QuizTakingView: React.FC<{
  quizType: string;
  onComplete: (results: any) => void;
  onCancel: () => void;
  theme: any;
}> = ({ quizType, onComplete, onCancel, theme }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const quizName = quizService.getQuizName(quizType);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const service = quizService[quizType as keyof typeof quizService];
      if (typeof service === 'object' && 'getQuestions' in service) {
        const questionsData = await service.getQuestions();
        setQuestions(questionsData);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading questions:', err);
      setError('Failed to load questions. Please try again.');
      setLoading(false);
    }
  }, [quizType]);

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const service = quizService[quizType as keyof typeof quizService];
        if (typeof service === 'object' && 'start' in service) {
          await service.start();
        }
        await loadQuestions();
      } catch (err) {
        console.error('Error starting quiz:', err);
        setError('Failed to start quiz');
        setLoading(false);
      }
    };
    startQuiz();
  }, [quizType, loadQuestions]);

  const handleAnswerSelect = async (questionId: string | number, answer: number) => {
    setAnswers((prev) => ({ ...prev, [String(questionId)]: answer }));
    try {
      const service = quizService[quizType as keyof typeof quizService];
      if (typeof service === 'object' && 'submitQuestion' in service) {
        const numericId = typeof questionId === 'string' ? parseInt(questionId, 10) : questionId;
        await service.submitQuestion(numericId, answer);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      Alert.alert(
        t('assessments.warning'),
        `You have ${unanswered} unanswered questions. Submit anyway?`,
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('assessments.submit'), onPress: submitQuiz },
        ]
      );
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      setSubmitting(true);
      const service = quizService[quizType as keyof typeof quizService];
      if (typeof service === 'object' && 'submitQuiz' in service) {
        const result = await service.submitQuiz();
        onComplete(result);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const getLikertOptions = () => [
    { value: 1, label: t('assessments.stronglyDisagree') },
    { value: 2, label: t('assessments.disagree') },
    { value: 3, label: t('assessments.neutral') },
    { value: 4, label: t('assessments.agree') },
    { value: 5, label: t('assessments.stronglyAgree') },
  ];

  const getPHQ9Options = () => [
    { value: 0, label: t('assessments.notAtAll') },
    { value: 1, label: t('assessments.severalDays') },
    { value: 2, label: t('assessments.moreThanHalf') },
    { value: 3, label: t('assessments.nearlyEveryDay') },
  ];

  const options = quizType === 'phq9' ? getPHQ9Options() : getLikertOptions();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            {t('assessments.loadingQuestions')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={loadQuestions}
          >
            <Text style={styles.retryButtonText}>{t('common.tryAgain')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            No questions available
          </Text>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={[styles.cancelButtonText, { color: theme.colors.primary }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = (Object.keys(answers).length / questions.length) * 100;
  const isLast = currentIndex === questions.length - 1;
  const isFirst = currentIndex === 0;
  const currentAnswer = answers[currentQuestion.id];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.takingHeader, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.takingTitle, { color: theme.colors.text }]}>{quizName}</Text>
        <Text style={[styles.takingProgress, { color: theme.colors.textSecondary }]}>
          {t('assessments.question')} {currentIndex + 1} / {questions.length}
        </Text>
        {/* Progress Bar */}
        <View style={[styles.progressBarBg, { backgroundColor: theme.colors.inputBackground }]}>
          <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: theme.colors.primary }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.takingContent} showsVerticalScrollIndicator={false}>
        {/* Question */}
        <View style={[styles.questionCard, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.questionBadge, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.questionBadgeText, { color: theme.colors.primary }]}>
              {t('assessments.question')} {currentIndex + 1}
            </Text>
          </View>
          <Text style={[styles.questionText, { color: theme.colors.text }]}>
            {isArabic && currentQuestion.textAr ? currentQuestion.textAr : currentQuestion.text}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                { 
                  backgroundColor: theme.colors.card,
                  borderColor: currentAnswer === option.value ? theme.colors.primary : theme.colors.border,
                  borderWidth: currentAnswer === option.value ? 2 : 1,
                },
              ]}
              onPress={() => handleAnswerSelect(currentQuestion.id, option.value)}
            >
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{option.label}</Text>
              {currentAnswer === option.value && (
                <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={[styles.navigation, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.navButton, { opacity: isFirst ? 0.5 : 1 }]}
          onPress={() => setCurrentIndex((i) => i - 1)}
          disabled={isFirst}
        >
          <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>← {t('assessments.previous')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelNavButton} onPress={onCancel}>
          <Text style={[styles.cancelNavText, { color: theme.colors.textSecondary }]}>{t('common.cancel')}</Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>{t('assessments.submit')} ✓</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton]}
            onPress={() => setCurrentIndex((i) => i + 1)}
          >
            <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>{t('assessments.next')} →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

// Quiz Results View
const QuizResultsView: React.FC<{
  quizType: string;
  results: any;
  onClose: () => void;
  onRetake: () => void;
  theme: any;
}> = ({ quizType, results, onClose, onRetake, theme }) => {
  const { t } = useTranslation();
  const quizName = quizService.getQuizName(quizType);

  const renderPHQ9Results = () => (
    <View style={styles.resultsContent}>
      <View style={[styles.scoreCard, { backgroundColor: theme.colors.primary + '15' }]}>
        <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>Total Score</Text>
        <Text style={[styles.scoreValue, { color: theme.colors.primary }]}>{results.totalScore}/27</Text>
        <Text style={[styles.severityLabel, { color: theme.colors.text }]}>
          Severity: {results.severity}
        </Text>
      </View>
      {results.recommendation && (
        <View style={[styles.recommendationBox, { backgroundColor: '#FEF3C720', borderColor: '#F59E0B' }]}>
          <Text style={[styles.recommendationTitle, { color: '#92400E' }]}>💡 Recommendation</Text>
          <Text style={[styles.recommendationText, { color: '#78350F' }]}>{results.recommendation}</Text>
        </View>
      )}
    </View>
  );

  const renderPersonalityResults = () => (
    <View style={styles.resultsContent}>
      {results.traits && Object.entries(results.traits).map(([trait, data]: [string, any]) => (
        <View key={trait} style={[styles.traitCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.traitHeader}>
            <Text style={[styles.traitName, { color: theme.colors.text }]}>
              {trait.charAt(0).toUpperCase() + trait.slice(1)}
            </Text>
            <Text style={[styles.traitScore, { color: theme.colors.primary }]}>{data.score}%</Text>
          </View>
          <View style={[styles.traitBarBg, { backgroundColor: theme.colors.inputBackground }]}>
            <View style={[styles.traitBarFill, { width: `${data.score}%`, backgroundColor: theme.colors.primary }]} />
          </View>
          {data.interpretation && (
            <Text style={[styles.traitInterpretation, { color: theme.colors.textSecondary }]}>
              {data.interpretation}
            </Text>
          )}
        </View>
      ))}
      {results.summary && (
        <View style={[styles.summaryBox, { backgroundColor: theme.colors.inputBackground }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Summary</Text>
          <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>{results.summary}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsIcon}>🎉</Text>
          <Text style={[styles.resultsTitle, { color: theme.colors.text }]}>
            {t('assessments.completed')}!
          </Text>
          <Text style={[styles.resultsSubtitle, { color: theme.colors.textSecondary }]}>
            {quizName}
          </Text>
        </View>

        {quizType === 'phq9' ? renderPHQ9Results() : renderPersonalityResults()}

        <View style={styles.resultsActions}>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>{t('assessments.backToList')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.retakeButton, { borderColor: theme.colors.primary }]}
            onPress={onRetake}
          >
            <Text style={[styles.retakeButtonText, { color: theme.colors.primary }]}>
              {t('assessments.retake')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Main Assessments Screen
const AssessmentsScreen: React.FC = () => {
  const { theme } = useThemeStore();
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [quizView, setQuizView] = useState<'list' | 'taking' | 'results'>('list');
  const [quizResults, setQuizResults] = useState<Record<string, any>>({});
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, boolean>>({});

  const handleStartQuiz = (quizType: string) => {
    setActiveQuiz(quizType);
    setQuizView('taking');
  };

  const handleQuizComplete = (results: any) => {
    if (!activeQuiz) return;

    let transformedResults = results;

    // Transform personality results
    if ((activeQuiz === 'ipip50' || activeQuiz === 'ipip120') && results.result?.scores) {
      const traits: Record<string, any> = {};
      results.result.scores.forEach((item: any) => {
        const traitName = item.trait.toLowerCase().replace(/\s+/g, '');
        traits[traitName] = {
          score: item.score,
          interpretation: item.description,
          level: item.level,
        };
      });
      transformedResults = {
        traits,
        summary: results.result.summary || results.result.arabicSummary,
        completionDate: results.completionDate,
        totalScore: results.totalScore,
      };
    }

    // Transform PHQ-9 results
    if (activeQuiz === 'phq9' && results.result) {
      transformedResults = {
        totalScore: results.totalScore,
        severity: results.result.severity,
        recommendation: results.result.recommendation,
        completionDate: results.completionDate,
        scores: results.result.itemScores,
      };
    }

    setQuizResults((prev) => ({ ...prev, [activeQuiz]: transformedResults }));
    setCompletedQuizzes((prev) => ({ ...prev, [activeQuiz]: true }));
    setQuizView('results');
  };

  const handleViewResults = (quizType: string) => {
    if (quizResults[quizType]) {
      setActiveQuiz(quizType);
      setQuizView('results');
    }
  };

  const handleBackToList = () => {
    setQuizView('list');
    setActiveQuiz(null);
  };

  const handleRetake = () => {
    if (activeQuiz) {
      handleStartQuiz(activeQuiz);
    }
  };

  if (quizView === 'taking' && activeQuiz) {
    return (
      <QuizTakingView
        quizType={activeQuiz}
        theme={theme}
        onComplete={handleQuizComplete}
        onCancel={handleBackToList}
      />
    );
  }

  if (quizView === 'results' && activeQuiz && quizResults[activeQuiz]) {
    return (
      <QuizResultsView
        quizType={activeQuiz}
        results={quizResults[activeQuiz]}
        theme={theme}
        onClose={handleBackToList}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <QuizListView
      theme={theme}
      onStartQuiz={handleStartQuiz}
      onViewResults={handleViewResults}
      completedQuizzes={completedQuizzes}
      quizResults={quizResults}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContainer: { padding: 16 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  headerSubtitle: { fontSize: 15, lineHeight: 22 },
  quizCard: { borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  quizCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  quizIcon: { fontSize: 32 },
  quizMeta: { alignItems: 'flex-end' },
  quizDuration: { fontSize: 12, marginBottom: 2 },
  quizQuestions: { fontSize: 12 },
  quizName: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  quizDescription: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  completedBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
  completedText: { fontSize: 13, fontWeight: '500' },
  quizActions: { flexDirection: 'row', gap: 12 },
  startQuizBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  startQuizBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  viewResultsBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  viewResultsBtnText: { fontSize: 15, fontWeight: '600' },
  infoBox: { borderRadius: 12, padding: 16, borderWidth: 1, marginTop: 8 },
  infoTitle: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  infoItem: { fontSize: 14, marginBottom: 6 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorText: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginBottom: 12 },
  retryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  cancelButton: { padding: 12 },
  cancelButtonText: { fontSize: 16 },
  takingHeader: { padding: 16, borderBottomWidth: 1 },
  takingTitle: { fontSize: 20, fontWeight: '600', marginBottom: 4 },
  takingProgress: { fontSize: 14, marginBottom: 12 },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  takingContent: { padding: 16 },
  questionCard: { borderRadius: 16, padding: 20, marginBottom: 20 },
  questionBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12 },
  questionBadgeText: { fontSize: 13, fontWeight: '600' },
  questionText: { fontSize: 18, lineHeight: 28, fontWeight: '500' },
  optionsContainer: { gap: 12 },
  optionButton: { borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionText: { fontSize: 15, flex: 1 },
  checkmark: { fontSize: 18, fontWeight: '600' },
  navigation: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1 },
  navButton: { padding: 12 },
  navButtonText: { fontSize: 15, fontWeight: '500' },
  cancelNavButton: { padding: 12 },
  cancelNavText: { fontSize: 14 },
  submitButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  resultsContainer: { padding: 16 },
  resultsHeader: { alignItems: 'center', marginBottom: 24 },
  resultsIcon: { fontSize: 48, marginBottom: 12 },
  resultsTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  resultsSubtitle: { fontSize: 16 },
  resultsContent: { gap: 16 },
  scoreCard: { borderRadius: 16, padding: 24, alignItems: 'center' },
  scoreLabel: { fontSize: 14, marginBottom: 8 },
  scoreValue: { fontSize: 48, fontWeight: 'bold', marginBottom: 8 },
  severityLabel: { fontSize: 18, fontWeight: '500' },
  recommendationBox: { borderRadius: 12, padding: 16, borderWidth: 1 },
  recommendationTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  recommendationText: { fontSize: 14, lineHeight: 22 },
  traitCard: { borderRadius: 12, padding: 16, marginBottom: 12 },
  traitHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  traitName: { fontSize: 16, fontWeight: '600' },
  traitScore: { fontSize: 16, fontWeight: '600' },
  traitBarBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  traitBarFill: { height: '100%', borderRadius: 4 },
  traitInterpretation: { fontSize: 13, lineHeight: 18 },
  summaryBox: { borderRadius: 12, padding: 16, marginTop: 8 },
  summaryTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  summaryText: { fontSize: 14, lineHeight: 22 },
  resultsActions: { marginTop: 24, gap: 12 },
  closeButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  closeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  retakeButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  retakeButtonText: { fontSize: 16, fontWeight: '600' },
});

export default AssessmentsScreen;
