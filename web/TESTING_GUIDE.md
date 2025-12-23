# How to Test Arabic Language Support

## Quick Test Guide

### 1. Start the Development Server

```bash
npm run dev
```

The app should start at `http://localhost:5173`

### 2. Test Language Toggle

#### In Navbar (Desktop):

1. Look at the top-right corner of the navbar
2. You should see a button showing "العربية" (Arabic)
3. Click it - the entire UI should switch to Arabic
4. All text should change to Arabic
5. The layout should flip to right-to-left (RTL)
6. Click again to switch back to English

#### In Navbar (Mobile):

1. Resize browser to mobile size (or test on actual mobile)
2. Click the hamburger menu (three lines)
3. Scroll to bottom of mobile menu
4. You should see the language toggle button
5. Click to switch language
6. UI should update in real-time

### 3. Verify Translations

**English Version Should Show:**

- "Home" → تranslates to "الرئيسية"
- "Chat" → translates to "الدردشة"
- "Doctors" → translates to "الأطباء"
- "Profile" → translates to "الملف الشخصي"
- "Dashboard" → translates to "لوحة التحكم"
- "Logout" → translates to "تسجيل الخروج"

**Arabic Version Should Show:**

- "الرئيسية" (Home)
- "الدردشة" (Chat)
- "الأطباء" (Doctors)
- "الملف الشخصي" (Profile)
- "لوحة التحكم" (Dashboard)
- "تسجيل الخروج" (Logout)

### 4. Test RTL Layout

**When in Arabic Mode, Verify:**
✅ Text flows from right to left
✅ Navbar elements are mirrored
✅ Buttons are properly positioned
✅ Margins and padding adjusted
✅ No text overflow or clipping
✅ Layout remains responsive

### 5. Test Persistence

1. Switch to Arabic
2. Refresh the page (F5 or Cmd+R)
3. Arabic should still be selected (preference persisted)
4. Switch back to English
5. Refresh again
6. English should still be selected

### 6. Test on Different Pages

**Navigate to and test:**

- Home page (/)
- About page (/about)
- Contact page (/contact)
- Login page (/login)
- Register page (/register)

Each page should display translated navbar items.

### 7. Test Responsive Layout

**Test on different screen sizes:**

- Desktop (1920px)
- Tablet (768px)
- Mobile (375px)

Language toggle should work smoothly on all sizes.

### 8. Browser DevTools Check

Open DevTools (F12) and verify:

```html
<!-- When in Arabic mode, <html> should have: -->
<html dir="rtl" lang="ar">
  <!-- When in English mode, <html> should have: -->
  <html dir="ltr" lang="en"></html>
</html>
```

**Check Console:**

- Should be no errors
- Should be no warnings
- localStorage key "neuralhealer-language" should contain "en" or "ar"

### 9. Test LocalStorage

In DevTools Console:

```javascript
// Check saved language
localStorage.getItem('neuralhealer-language')
// Output: "en" or "ar"

// Manually switch (for testing)
localStorage.setItem('neuralhealer-language', 'ar')
location.reload()

// Should reload in Arabic
```

### 10. Performance Check

In DevTools Network tab:

- Bundle size should not significantly increase
- No additional large files loaded
- Language switching should be instant

---

## Testing Checklist

### Functionality ✓

- [ ] Language toggle appears in navbar
- [ ] Toggle button shows correct language
- [ ] Clicking toggle switches language
- [ ] All translated text updates
- [ ] RTL layout applies for Arabic
- [ ] LTR layout applies for English

### Persistence ✓

- [ ] Language persists after page refresh
- [ ] Language persists after navigating pages
- [ ] localStorage contains correct value
- [ ] Different browsers remember preference

### Layout ✓

- [ ] No text overflow in Arabic
- [ ] Navbar elements properly positioned
- [ ] Buttons properly aligned
- [ ] Mobile menu responsive
- [ ] All content visible

### Compatibility ✓

- [ ] Works on Chrome
- [ ] Works on Firefox
- [ ] Works on Safari
- [ ] Works on Edge
- [ ] Works on mobile browsers

### Performance ✓

- [ ] No console errors
- [ ] No console warnings
- [ ] Page loads quickly
- [ ] Language switch is instant
- [ ] No memory leaks

---

## Troubleshooting During Testing

### Issue: Language toggle not appearing

**Solution:**

- Clear browser cache
- Check console for errors
- Verify Navbar.jsx was updated
- Restart dev server

### Issue: Text not switching to Arabic

**Solution:**

- Check that useLanguage hook is imported
- Verify translations.js has the key in both en and ar
- Check console for warnings
- Verify component uses `t.key` correctly

### Issue: RTL layout not working

**Solution:**

- Check DevTools - should show `dir="rtl"` on `<html>`
- Check for CSS conflicts
- Clear browser cache
- Restart dev server

### Issue: Language not persisting

**Solution:**

- Check localStorage in DevTools
- Verify browser allows localStorage
- Check for privacy mode (blocks localStorage)
- Try incognito/private window

### Issue: Navbar looks broken in RTL

**Solution:**

- Check index.css for RTL rules
- Verify Tailwind classes handle RTL
- Check for hardcoded left/right margins
- Use logical properties instead (start/end)

---

## Test Scenarios

### Scenario 1: First Time User

1. Open app - should be in English (default)
2. Click language toggle
3. Should switch to Arabic with RTL
4. Preferences saved for next visit

### Scenario 2: Returning User (Arabic)

1. If user previously selected Arabic
2. App should load directly in Arabic
3. No need to toggle
4. Click toggle to switch to English

### Scenario 3: Mobile User

1. Open on mobile device
2. Click hamburger menu
3. Scroll to language toggle at bottom
4. Switch language
5. All mobile responsive breakpoints should work

### Scenario 4: Cross-Page Navigation

1. In English on home page
2. Switch to Arabic
3. Navigate to different pages
4. Arabic should persist
5. Each page should show Arabic navbar items

### Scenario 5: Multiple Tabs

1. Open app in tab 1 (English)
2. Open app in tab 2 (different site)
3. In tab 1, switch to Arabic
4. localStorage updates
5. Refresh tab 2 - should now show Arabic (because localStorage is shared)

---

## Expected Results After Implementation

✅ Users can switch between English and Arabic instantly
✅ UI automatically adjusts for RTL (Arabic)
✅ Language preference is remembered
✅ All navbar items translate correctly
✅ No errors in console
✅ Performance is not affected
✅ Works on all devices and browsers
✅ Documentation is comprehensive

---

## Next Phase: Complete Translation

After confirming this works, translate remaining pages:

1. Home.jsx - Add t.home.\* keys
2. About.jsx - Add t.about.\* keys
3. Contact.jsx - Add t.contact.\* keys
4. Login.jsx - Add t.auth.\* keys
5. Register.jsx - Add t.auth.\* keys
6. And all patient/doctor pages...

---

## Report Issues

If you find issues during testing:

1. Note the exact behavior
2. Take screenshot if layout is broken
3. Check browser console for errors
4. Check localStorage value
5. Note browser and device used
6. Report with version information

---

**Test Thoroughly Before Deploying! 🚀**
