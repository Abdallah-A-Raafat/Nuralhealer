# Quiz i18n Implementation Summary

## Overview

Complete bilingual support (English/Arabic) has been implemented for the quiz system, including questions, answers, and results. Quiz completion statistics have been added to the Therapy Progress section.

## Changes Made

### 1. Translation Keys Added (`web/src/i18n/translations.js`)

Added comprehensive `quizzes` section under both `en.patient` and `ar.patient` with 70+ translation keys covering:

#### Common UI Elements

- Navigation: `question`, `of`, `answered`, `complete`, `previous`, `next`, `submit`, `submitting`, `saveAndExit`, `backToAssessments`, `retakeAssessment`
- Loading/Error: `loadingQuestions`, `noQuestionsAvailable`, `error`, `tryAgain`, `cancel`, `failedToLoad`, `failedToSubmit`, `unansweredQuestions`

#### Answer Scales

- **Likert Scale (IPIP-50/120)**: `stronglyDisagree`, `disagree`, `neutral`, `agree`, `stronglyAgree`
- **PHQ-9 Scale**: `notAtAll`, `severalDays`, `moreThanHalf`, `nearlyEveryDay`

#### Quiz Information

- Names: `ipip120Name`, `ipip50Name`, `phq9Name`
- Descriptions: `ipip120Desc`, `ipip50Desc`, `phq9Desc`
- Duration: `duration`, `minutes`, `questions`

#### Results Display

- Headers: `yourPersonalityProfile`, `basedOnBigFive`, `depressionScreeningResults`, `depressionSeverityScore`
- Sections: `overallSummary`, `scoreInterpretation`, `recommendation`, `nextSteps`
- Completion: `assessmentCompleted`, `responsesRecorded`

#### PHQ-9 Specific

- Severity Levels: `minimalDepression`, `mildDepression`, `moderateDepression`, `moderatelySevereDepression`, `severeDepression`
- Safety: `criticalSafetyAlert`, `emergencyResources`, `hotline988`, `crisisText`, `emergency911`
- Recommendations: `phq9Recommendation`
- Next Steps: `nextStep1`, `nextStep2`, `nextStep3`, `nextStep4`

#### Personality Traits

- `extraversion`, `agreeableness`, `conscientiousness`, `neuroticism`, `opennessToExperience`

#### Stats

- `completedAssessments`, `noResultsYet`

#### Legal

- `disclaimerTitle`, `disclaimerText`

---

### 2. QuizCard Component (`web/src/components/common/QuizCard.jsx`)

**Changes:**

- ✅ Added `useTranslation()` hook
- ✅ Replaced "Completed" → `t('patient.profile.assessmentCompleted')`
- ✅ Replaced "questions" → `t('patient.quizzes.questions')`
- ✅ Replaced "View Results" → `t('patient.profile.viewResults')`
- ✅ Replaced "Start Assessment" / "Retake Assessment" → `t('patient.profile.startAssessment')` / `t('patient.profile.retakeAssessment')`

**Result:** All quiz card UI text now switches between English/Arabic dynamically.

---

### 3. QuizTaking Component (`web/src/components/common/QuizTaking.jsx`)

**Major Changes:**

- ✅ Added `useTranslation()` hook and `isArabic` language detection
- ✅ Question display now shows Arabic text when language is Arabic:
  ```jsx
  {
    isArabic && currentQuestion.textAr
      ? currentQuestion.textAr
      : currentQuestion.text
  }
  ```
- ✅ Answer options now use translation keys instead of hardcoded text:
  - Likert Scale: Uses `t('patient.quizzes.stronglyAgree')` etc.
  - PHQ-9 Scale: Uses `t('patient.quizzes.notAtAll')` etc.
- ✅ Progress indicators use translations:
  - "Question X of Y" → `{t('patient.quizzes.question')} {X} {t('patient.quizzes.of')} {Y}`
  - "answered" → `t('patient.quizzes.answered')`
  - "complete" → `t('patient.quizzes.complete')`
- ✅ Navigation buttons:
  - "Previous" → `t('patient.quizzes.previous')`
  - "Next" → `t('patient.quizzes.next')`
  - "Submit Quiz" → `t('patient.quizzes.submit')`
  - "Submitting..." → `t('patient.quizzes.submitting')`
  - "Save & Exit" → `t('patient.quizzes.saveAndExit')`
- ✅ Error messages use translations:
  - "Loading questions..." → `t('patient.quizzes.loadingQuestions')`
  - "Error" → `t('patient.quizzes.error')`
  - "Try Again" → `t('patient.quizzes.tryAgain')`
  - "Cancel" → `t('patient.quizzes.cancel')`
  - "Go Back" → `t('patient.quizzes.goBack')`
- ✅ Unanswered questions warning: `t('patient.quizzes.unansweredQuestions', { count: unansweredCount })`

**Result:** Complete language switching for entire quiz-taking experience.

---

### 4. QuizResults Component (`web/src/components/common/QuizResults.jsx`)

**Major Changes:**

- ✅ Added `useTranslation()` hook and `isArabic` language detection
- ✅ **Personality Results:**
  - Header: "Your Personality Profile" → `t('patient.quizzes.yourPersonalityProfile')`
  - Subtitle: "Based on the Big Five..." → `t('patient.quizzes.basedOnBigFive')`
  - Summary section: "Overall Summary" → `t('patient.quizzes.overallSummary')`
- ✅ **PHQ-9 Results:**
  - Header: "PHQ-9 Depression Screening Results" → `t('patient.quizzes.depressionScreeningResults')`
  - Subtitle: "Your depression severity score" → `t('patient.quizzes.depressionSeverityScore')`
  - Score Interpretation section: `t('patient.quizzes.scoreInterpretation')`
  - Severity levels: `t('patient.quizzes.minimalDepression')` etc.
  - Critical Alert: `t('patient.quizzes.criticalSafetyAlert')`
  - Alert message shows Arabic when language is Arabic:
    ```jsx
    {
      isArabic ? results.alertMessageAr : results.alertMessage
    }
    ```
  - Emergency resources: All hotlines use translation keys
  - Recommendation: `t('patient.quizzes.recommendation')` and `t('patient.quizzes.phq9Recommendation')`
  - Next Steps: `t('patient.quizzes.nextSteps')`, `t('patient.quizzes.nextStep1')`, etc.
- ✅ **Generic Results:**
  - "Assessment Completed!" → `t('patient.quizzes.assessmentCompleted')`
  - "Your responses have been recorded..." → `t('patient.quizzes.responsesRecorded')`
- ✅ **Action Buttons:**
  - "Back to Assessments" → `t('patient.quizzes.backToAssessments')`
  - "Retake Assessment" → `t('patient.quizzes.retakeAssessment')`
- ✅ **Disclaimer:**
  - "Disclaimer:" → `t('patient.quizzes.disclaimerTitle')`
  - Full disclaimer text → `t('patient.quizzes.disclaimerText')`

**Result:** Complete bilingual results display with backend Arabic data integration.

---

### 5. Profile Component (`web/src/pages/patient/Profile.jsx`)

**Changes:**

- ✅ Added 5th stat card to Therapy Progress section:
  ```jsx
  <div className="text-center p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
      {Object.keys(quizResults).length}
    </div>
    <p className="text-sm text-textSecondary dark:text-gray-400">
      {t.patient.quizzes.completedAssessments}
    </p>
  </div>
  ```
- ✅ Updated grid layout to accommodate 5 items:
  - `grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6`
- ✅ Added dark mode support to all stat cards
- ✅ Displays count of completed quizzes dynamically

**Result:** Therapy Progress now shows quiz completion count alongside therapy session statistics.

---

## How Language Switching Works

### 1. **UI Text (Buttons, Labels, etc.)**

- Uses translation keys from `translations.js`
- Automatically switches when user changes language via language button
- Pattern: `t('patient.quizzes.keyName')`

### 2. **Question Text**

- Backend provides both `text` (English) and `textAr` (Arabic)
- Component detects current language: `const isArabic = i18n.language === 'ar'`
- Displays appropriate field:
  ```jsx
  {
    isArabic && currentQuestion.textAr
      ? currentQuestion.textAr
      : currentQuestion.text
  }
  ```

### 3. **Answer Options**

- Previously hardcoded with both English and Arabic
- Now uses translation keys that switch based on language
- Example: "Strongly Agree" becomes `t('patient.quizzes.stronglyAgree')` → switches to "أوافق بشدة" in Arabic

### 4. **Results Interpretation**

- Backend provides bilingual fields:
  - `arabicTrait`, `arabicDescription`, `arabicLevel`
  - `alertMessageEn`, `alertMessageAr`
- Component shows Arabic versions when language is Arabic
- UI labels use translation keys

---

## Testing Checklist

### Quiz Card

- [ ] Language button switches "Start Assessment" / "Retake Assessment"
- [ ] Language button switches "View Results"
- [ ] Language button switches "Completed" badge
- [ ] Language button switches "questions" text

### Quiz Taking

- [ ] Language button switches question text (from backend `textAr`)
- [ ] Language button switches all answer options (Likert scale)
- [ ] Language button switches all answer options (PHQ-9 scale)
- [ ] Language button switches "Question X of Y"
- [ ] Language button switches "Previous" / "Next" buttons
- [ ] Language button switches "Submit Assessment" button
- [ ] Language button switches "Save & Exit" button
- [ ] Progress indicators show correct translations

### Quiz Results - Personality

- [ ] Header "Your Personality Profile" switches
- [ ] "Based on the Big Five..." switches
- [ ] "Overall Summary" section header switches
- [ ] "Back to Assessments" button switches
- [ ] "Retake Assessment" button switches
- [ ] Disclaimer text switches

### Quiz Results - PHQ-9

- [ ] Header "PHQ-9 Depression Screening Results" switches
- [ ] Severity levels (Minimal, Mild, Moderate, etc.) switch
- [ ] "Score Interpretation" section switches
- [ ] Critical alert shows correct language message (from backend)
- [ ] Emergency resources text switches
- [ ] Recommendation text switches
- [ ] Next Steps list items switch
- [ ] Disclaimer switches

### Profile - Therapy Progress

- [ ] "Completed Assessments" stat card shows count
- [ ] Count updates after completing quiz
- [ ] Label switches language
- [ ] Dark mode colors display correctly
- [ ] Grid layout responsive on all screen sizes

---

## Backend Data Dependencies

The frontend expects the backend to provide:

### IPIP-50/120 Response:

```json
{
  "result": {
    "scores": [
      {
        "trait": "Openness",
        "arabicTrait": "الانفتاح",
        "score": 75,
        "level": "High",
        "arabicLevel": "عالي",
        "description": "You are very open to new experiences...",
        "arabicDescription": "أنت منفتح جدًا على التجارب الجديدة..."
      }
    ]
  },
  "completionDate": "2024-01-15T10:30:00Z",
  "sessionId": "uuid",
  "totalScore": 375
}
```

### PHQ-9 Response:

```json
{
  "result": {
    "scores": [
      {
        "trait": "Depression Severity",
        "score": 15,
        "level": "Moderately Severe",
        "description": "Your score indicates moderately severe depression...",
        "hasCriticalAlert": false,
        "alertMessageEn": "If you are experiencing thoughts of self-harm...",
        "alertMessageAr": "إذا كنت تعاني من أفكار إيذاء النفس..."
      }
    ]
  },
  "completionDate": "2024-01-15T11:00:00Z",
  "sessionId": "uuid"
}
```

### Questions Format:

```json
{
  "id": "q1",
  "text": "I am the life of the party.",
  "textAr": "أنا روح الحفلة."
}
```

---

## Files Modified

1. `/web/src/i18n/translations.js` - Added 70+ translation keys
2. `/web/src/components/common/QuizCard.jsx` - i18n integration
3. `/web/src/components/common/QuizTaking.jsx` - Full i18n + Arabic question display
4. `/web/src/components/common/QuizResults.jsx` - Full i18n + Arabic results display
5. `/web/src/pages/patient/Profile.jsx` - Added quiz completion stat card

---

## Key Features Implemented

✅ **Complete Bilingual Support**

- All UI text translates instantly when language changes
- Questions display in selected language (from backend data)
- Results show Arabic interpretations when available
- Answer options fully translated

✅ **Quiz Statistics Integration**

- Therapy Progress shows completed assessments count
- Updates dynamically after quiz completion
- Matches design style of other stat cards

✅ **Dark Mode Compatibility**

- All quiz components support dark mode
- Stat cards have appropriate dark mode colors
- Text visibility maintained in both modes

✅ **Responsive Design**

- Grid layouts adapt to screen size
- 5-card grid: 2 cols (mobile), 3 cols (tablet), 5 cols (desktop)
- All text readable on mobile devices

✅ **Backend Integration**

- Uses backend's bilingual data (textAr, arabicTrait, etc.)
- No hardcoded translations for dynamic content
- Proper data transformation in Profile.jsx

---

## No Breaking Changes

- All existing functionality preserved
- Backward compatible with current backend API
- No changes to data transformation logic
- Existing quiz results still display correctly

---

## Next Steps (Optional Enhancements)

1. **Add Loading States with Translations**
   - Ensure all loading spinners show translated text

2. **Quiz History View**
   - Show list of completed quizzes with dates
   - Display in Assessments tab with "View Results" links

3. **Export Results Feature**
   - PDF export in current language
   - Share results with healthcare provider

4. **Progress Tracking**
   - Chart showing PHQ-9 scores over time
   - Personality trait changes comparison

5. **Assessment Recommendations**
   - Suggest relevant quizzes based on chat sessions
   - Remind users to retake PHQ-9 periodically

---

## Implementation Date

January 2024

## Status

✅ Complete - Ready for testing and deployment
