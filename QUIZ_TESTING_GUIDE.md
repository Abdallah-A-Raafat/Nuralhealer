# Quiz System Testing Guide

## Quick Start

### Prerequisites
- Backend server running on port 8080
- Frontend dev server running on port 5173
- Patient account logged in

### Testing Steps

#### 1. Navigate to Assessments
```
1. Login as a patient
2. Click "View Profile" or navigate to /patient/profile
3. Click the "Assessments" tab
4. You should see 3 quiz cards
```

#### 2. Start PHQ-9 Depression Screening (Fastest - 9 questions)
```
1. Click "Start Assessment" on PHQ-9 card
2. Answer each question using the 4-point scale:
   - Not at all (0)
   - Several days (1)
   - More than half the days (2)
   - Nearly every day (3)
3. Watch the progress bar update
4. Click "Next" to advance
5. Click "Submit Quiz" on question 9
6. View your depression severity score (0-27)
```

#### 3. View Results
```
Results screen shows:
- Large score number
- Severity level (Minimal/Mild/Moderate/etc.)
- Color coding (green/yellow/orange/red)
- Score interpretation guide
- Recommendations (if score ≥ 10)
- Next steps suggestions
```

#### 4. Retake or Return
```
Options:
- "Back to Assessments" → Return to quiz list
- "Retake Assessment" → Start fresh quiz

After returning:
- Card shows "View Results" button
- Card shows completion badge
```

#### 5. Test IPIP-50 (50 questions)
```
1. Click "Start Assessment" on IPIP-50 card
2. Answer questions using 5-point Likert scale:
   - Strongly Disagree (1)
   - Disagree (2)
   - Neutral (3)
   - Agree (4)
   - Strongly Agree (5)
3. Complete all 50 questions
4. View Big Five personality traits:
   - Openness 🎨
   - Conscientiousness 📋
   - Extraversion 👥
   - Agreeableness 🤝
   - Neuroticism 😰
```

#### 6. Test IPIP-120 (120 questions - most comprehensive)
```
Similar to IPIP-50 but with more detailed results
- Takes 20-30 minutes
- More accurate personality assessment
- Same Big Five traits but deeper analysis
```

---

## Feature Testing Checklist

### Core Functionality
- [ ] Quiz cards display correctly
- [ ] "Start Assessment" button works
- [ ] Session creates successfully (check cookies)
- [ ] Questions load properly
- [ ] Progress bar updates
- [ ] Answer selection works (checkmarks appear)
- [ ] Previous/Next navigation works
- [ ] Can't go previous on first question
- [ ] Submit appears on last question
- [ ] Answer auto-saves on selection
- [ ] Completion warning if incomplete
- [ ] Results display correctly
- [ ] "View Results" button appears after completion
- [ ] Completion badge shows on completed quizzes
- [ ] "Retake Assessment" works
- [ ] "Back to Assessments" works

### PHQ-9 Specific
- [ ] 4-point scale (0-3) displays
- [ ] Score calculation correct (0-27)
- [ ] Severity levels display correctly:
  - 0-4: Green "Minimal"
  - 5-9: Yellow "Mild"
  - 10-14: Orange "Moderate"
  - 15-19: Red "Moderately Severe"
  - 20-27: Red "Severe"
- [ ] Recommendations show for scores ≥ 10
- [ ] Score interpretation guide visible

### IPIP (50 & 120) Specific
- [ ] 5-point Likert scale displays
- [ ] All 5 traits show in results
- [ ] Progress bars render for each trait
- [ ] Trait percentages calculate correctly
- [ ] Interpretations display
- [ ] Overall summary appears

### Error Handling
- [ ] Network error shows retry option
- [ ] Empty questions handled gracefully
- [ ] Session expiry detected
- [ ] Loading states show spinners
- [ ] Error toasts appear

### UI/UX
- [ ] Responsive on mobile
- [ ] Cards grid properly
- [ ] Colors match theme
- [ ] Icons display correctly
- [ ] Animations smooth
- [ ] Text readable
- [ ] Buttons clickable

### Translations
- [ ] English translations work
- [ ] Arabic translations work (if AR selected)
- [ ] Language toggle preserves state
- [ ] All keys have fallbacks

---

## API Testing

### Check Backend Endpoints

#### PHQ-9
```bash
# Start session
curl -X POST http://localhost:8080/api/quiz/phq9/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -c cookies.txt

# Get questions
curl http://localhost:8080/api/quiz/phq9/questions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -b cookies.txt

# Submit answer
curl -X POST http://localhost:8080/api/quiz/phq9/submit-question \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"questionId": 1, "answer": 2}' \
  -b cookies.txt

# Submit quiz
curl -X POST http://localhost:8080/api/quiz/phq9/submit-quiz \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -b cookies.txt

# Get progress
curl http://localhost:8080/api/quiz/phq9/progress \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -b cookies.txt

# Reset
curl -X DELETE http://localhost:8080/api/quiz/phq9/reset \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -b cookies.txt
```

#### IPIP-50
```bash
# Replace 'phq9' with 'ipip50' in above commands
```

#### IPIP-120
```bash
# Replace 'phq9' with 'ipip120' in above commands
# Note: No /reset endpoint for IPIP-120
```

---

## Browser DevTools Testing

### Check Network Tab
```
1. Open DevTools (F12)
2. Go to Network tab
3. Start a quiz
4. Verify requests:
   - POST /start → 200 OK
   - GET /questions → 200 OK with JSON array
   - POST /submit-question → 200 OK (for each answer)
   - POST /submit-quiz → 200 OK with results
```

### Check Cookies
```
1. Open DevTools → Application → Cookies
2. After starting quiz, look for:
   - JSESSIONID cookie
   - Should be httpOnly
   - Domain: localhost
   - Path: /
```

### Check Console
```
1. Open DevTools → Console
2. Should see no errors
3. May see info logs from service
4. Check for any warnings
```

### Check Local State (React DevTools)
```
If you have React DevTools installed:
1. Open Components tab
2. Find Profile component
3. Check state:
   - activeQuiz: should match current quiz
   - quizView: 'list'/'taking'/'results'
   - quizResults: object with results
   - completedQuizzes: boolean flags
```

---

## Performance Testing

### Check Load Times
- Quiz cards load: < 500ms
- Questions load: < 1s
- Answer submission: < 300ms
- Quiz submission: < 2s
- Results display: < 500ms

### Check Memory
- No memory leaks on navigation
- State clears properly on unmount
- No duplicate API calls

---

## Mobile Testing

### Responsive Breakpoints
```
Desktop: ≥768px
- 2-column grid for quiz cards
- Full navigation visible

Mobile: <768px
- 1-column stack for quiz cards
- Tabs may scroll horizontally
- Touch-friendly buttons
```

### Test on Mobile Devices
- [ ] Cards stack vertically
- [ ] Buttons large enough to tap
- [ ] Text readable without zoom
- [ ] Progress bar visible
- [ ] No horizontal scroll

---

## Common Issues & Solutions

### Issue: Questions not loading
**Solution**: Check if session was created (look for JSESSIONID cookie)

### Issue: Answers not saving
**Solution**: Check network tab for 200 OK on submit-question

### Issue: Results not displaying
**Solution**: Check if quiz was submitted successfully (POST /submit-quiz)

### Issue: Can't retake quiz
**Solution**: Check if reset endpoint is available for that quiz type

### Issue: Session expired
**Solution**: Restart quiz, backend will create new session

### Issue: Incomplete results
**Solution**: Check if all questions were answered before submission

---

## Expected Results

### PHQ-9 Example
```javascript
{
  "score": 15,
  "severity": "Moderately Severe",
  "interpretation": "You may be experiencing significant symptoms of depression..."
}
```

### IPIP-50/120 Example
```javascript
{
  "traits": {
    "openness": {
      "score": 75,
      "interpretation": "You are very open to new experiences..."
    },
    "conscientiousness": {
      "score": 60,
      "interpretation": "You show moderate organization..."
    },
    // ... other traits
  },
  "summary": "Overall, you demonstrate..."
}
```

---

## Next Steps After Testing

1. **Fix any bugs found**
2. **Add quiz history to Sessions tab** (TODO)
3. **Persist results to backend** (currently client-side only)
4. **Add PDF export** (nice to have)
5. **Add doctor sharing** (integration with doctor dashboard)
6. **Build notification system** (Phase 2 as per user request)

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify backend is running
4. Check backend logs
5. Clear cookies and try again
6. Review QUIZ_IMPLEMENTATION.md for details

Happy testing! 🎯
