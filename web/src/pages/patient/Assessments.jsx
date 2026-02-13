import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import QuizCard from '../../components/common/QuizCard';
import QuizTaking from '../../components/common/QuizTaking';
import QuizResults from '../../components/common/QuizResults';
import Button from '../../components/common/Button';
import quizService from '../../services/quizService';
import therapyProgressService from '../../services/therapyProgressService';
import { showToast } from '../../utils/toast';

const Assessments = () => {
  const { t } = useLanguage();
  
  // Quiz states
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizView, setQuizView] = useState('list'); // 'list', 'taking', 'results'
  const [quizResults, setQuizResults] = useState({});
  const [completedQuizzes, setCompletedQuizzes] = useState({});

  // Quiz handlers
  const handleStartQuiz = async (quizType) => {
    try {
      const service = quizService[quizType];
      await service.start();
      
      setActiveQuiz(quizType);
      setQuizView('taking');
      showToast.success(`Starting ${quizService.getQuizName(quizType)}...`);
    } catch (error) {
      console.error('Error starting quiz:', error);
      showToast.error('Failed to start assessment. Please try again.');
    }
  };

  const handleQuizComplete = (results) => {
    console.log('📊 [QUIZ] Quiz completed:', { activeQuiz, results });
    
    if (!activeQuiz) {
      console.error('❌ [QUIZ] No active quiz set!');
      showToast.error('Error: No active quiz');
      return;
    }
    
    // Transform backend data format to match QuizResults component expectations
    let transformedResults = results;
    
    // For personality tests (IPIP-50, IPIP-120)
    if ((activeQuiz === 'ipip50' || activeQuiz === 'ipip120') && results.result?.scores) {
      const traits = {};
      results.result.scores.forEach(item => {
        const traitName = item.trait.toLowerCase().replace(/\s+/g, '');
        traits[traitName] = {
          score: item.score,
          interpretation: item.description,
          level: item.level
        };
      });
      
      transformedResults = {
        traits: traits,
        summary: results.result.summary || results.result.arabicSummary,
        completionDate: results.completionDate,
        totalScore: results.totalScore
      };
      
      console.log('🔄 [QUIZ] Transformed personality results:', transformedResults);
    }
    
    // For PHQ-9 depression screening
    if (activeQuiz === 'phq9' && results.result) {
      const scoreDetail = Array.isArray(results.result.scores) ? results.result.scores[0] : null;
      const totalScore = results.totalScore ?? results.result?.totalScore ?? scoreDetail?.score;

      transformedResults = {
        totalScore,
        severity: scoreDetail?.level || results.result.severity,
        severityAr: scoreDetail?.arabicLevel,
        description: scoreDetail?.description,
        descriptionAr: scoreDetail?.arabicDescription,
        hasCriticalAlert: scoreDetail?.metadata?.hasCriticalAlert,
        alertMessage: scoreDetail?.metadata?.alertMessageEn,
        alertMessageAr: scoreDetail?.metadata?.alertMessageAr,
        completionDate: results.completionDate,
        scores: scoreDetail ? [scoreDetail] : results.result.itemScores,
        summary: results.result.summary || results.result.arabicSummary
      };
      
      console.log('🔄 [QUIZ] Transformed PHQ-9 results:', transformedResults);
    }
    
    // Save to therapy progress
    try {
      therapyProgressService.saveAssessmentResults(activeQuiz, transformedResults);
      console.log('✅ [THERAPY PROGRESS] Assessment results saved');
    } catch (error) {
      console.error('❌ [THERAPY PROGRESS] Failed to save results:', error);
      // Don't block user flow if saving fails
    }
    
    // Store results
    setQuizResults(prev => {
      const updated = {
        ...prev,
        [activeQuiz]: transformedResults
      };
      console.log('💾 [QUIZ] Stored results:', updated);
      return updated;
    });
    
    // Mark quiz as completed
    setCompletedQuizzes(prev => ({
      ...prev,
      [activeQuiz]: true
    }));
    
    // Switch to results view
    setQuizView('results');
    
    showToast.success('Assessment completed successfully!');
  };

  const handleViewResults = (quizType) => {
    console.log('👁️ [QUIZ] View results for:', quizType);
    console.log('📦 [QUIZ] Available results:', quizResults);
    
    if (quizResults[quizType]) {
      setActiveQuiz(quizType);
      setQuizView('results');
    } else {
      showToast.error('No results available for this assessment yet.');
    }
  };

  const handleRetakeQuiz = async (quizType) => {
    try {
      showToast.success('Retaking assessment...');
      await handleStartQuiz(quizType);
    } catch (error) {
      showToast.error('Failed to retake assessment. Please try again.');
    }
  };

  const handleBackToQuizList = () => {
    setQuizView('list');
    setActiveQuiz(null);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#1A1625] pt-20 px-4 pb-12">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textPrimary dark:text-white mb-2">
            {t.navigation.assessments || 'Psychological Assessments'}
          </h1>
          <p className="text-textSecondary dark:text-gray-400">
            {t.patient.profile.assessmentsDesc || 'Complete these assessments to help understand your mental health and track your progress over time.'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quiz List View */}
          {quizView === 'list' && (
            <div className="bg-white bg-gradient-to-br from-white via-[#F8F9FA] to-primary/5 dark:bg-[#241D30] dark:bg-none rounded-lg shadow-md p-8 border border-primary/10 dark:border-[#3F3651]">
              <div className="grid md:grid-cols-2 gap-6">
                {/* PHQ-9 Depression Screening */}
                <QuizCard
                  quiz={{
                    type: 'phq9',
                    name: t.assessments?.phq9Name || 'PHQ-9 Depression Screening',
                    description: t.assessments?.phq9Desc || 'A 9-question screening tool widely used to assess depression severity',
                    duration: t.assessments?.phq9Duration || '5 minutes',
                    totalQuestions: t.assessments?.phq9Questions || 9,
                  }}
                  onStart={handleStartQuiz}
                  onViewResults={handleViewResults}
                  hasResults={!!quizResults.phq9}
                  isCompleted={completedQuizzes.phq9}
                />

                {/* IPIP-50 Personality */}
                <QuizCard
                  quiz={{
                    type: 'ipip50',
                    name: t.assessments?.ipip50Name || 'IPIP-50 Personality Assessment',
                    description: t.assessments?.ipip50Desc || 'Discover your personality traits based on the Big Five model',
                    duration: t.assessments?.ipip50Duration || '10-15 minutes',
                    totalQuestions: t.assessments?.ipip50Questions || 50,
                  }}
                  onStart={handleStartQuiz}
                  onViewResults={handleViewResults}
                  hasResults={!!quizResults.ipip50}
                  isCompleted={completedQuizzes.ipip50}
                />

                {/* IPIP-120 Comprehensive */}
                <QuizCard
                  quiz={{
                    type: 'ipip120',
                    name: t.assessments?.ipip120Name || 'IPIP-120 Comprehensive Assessment',
                    description: t.assessments?.ipip120Desc || 'In-depth personality analysis with 120 questions for detailed insights',
                    duration: t.assessments?.ipip120Duration || '20-30 minutes',
                    totalQuestions: t.assessments?.ipip120Questions || 120,
                  }}
                  onStart={handleStartQuiz}
                  onViewResults={handleViewResults}
                  hasResults={!!quizResults.ipip120}
                  isCompleted={completedQuizzes.ipip120}
                />
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-primary/5 dark:bg-blue-900/20 border border-primary/10 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-textPrimary dark:text-blue-300 mb-2">
                  {t.patient.profile.assessmentInfo || 'Why Take Assessments?'}
                </h4>
                <ul className="text-sm text-textSecondary dark:text-blue-400 space-y-1">
                  <li>✓ {t.patient.profile.assessmentBenefit1 || 'Better understand your mental health status'}</li>
                  <li>✓ {t.patient.profile.assessmentBenefit2 || 'Track your progress over time'}</li>
                  <li>✓ {t.patient.profile.assessmentBenefit3 || 'Help your doctor provide better care'}</li>
                  <li>✓ {t.patient.profile.assessmentBenefit4 || 'All results are confidential and secure'}</li>
                </ul>
              </div>
            </div>
          )}

          {/* Quiz Taking View */}
          {quizView === 'taking' && activeQuiz && (
            <QuizTaking
              quizType={activeQuiz}
              onComplete={handleQuizComplete}
              onCancel={handleBackToQuizList}
            />
          )}

          {/* Quiz Results View */}
          {(() => {
            console.log('🔍 [QUIZ] Results view check:', { 
              quizView, 
              activeQuiz, 
              hasResults: !!quizResults[activeQuiz],
              results: quizResults[activeQuiz]
            });
            
            if (quizView === 'results' && activeQuiz && quizResults[activeQuiz]) {
              return (
                <QuizResults
                  quizType={activeQuiz}
                  results={quizResults[activeQuiz]}
                  onClose={handleBackToQuizList}
                  onRetake={handleRetakeQuiz}
                />
              );
            }
            
            if (quizView === 'results' && activeQuiz && !quizResults[activeQuiz]) {
              return (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                  <p className="text-yellow-800 dark:text-yellow-300">No results available for this quiz yet.</p>
                  <Button onClick={handleBackToQuizList} className="mt-4">Back to Assessments</Button>
                </div>
              );
            }
            
            return null;
          })()}
        </div>
      </div>
    </div>
  );
};

export default Assessments;
