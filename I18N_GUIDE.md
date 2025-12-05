# 🌍 TSUSwap Internationalization Guide

TSUSwap now supports both **English** and **Russian** languages with an easy-to-use language switcher!

## Features

### 🎯 Language Support
- ✅ **English (EN)** - Default for international students
- ✅ **Russian (РУ)** - For Russian-speaking students
- ✅ Easy toggle in the navbar
- ✅ Preference saved in browser

### 🔄 How It Works
1. **Default Language**: English
2. **Language Switcher**: Top-right corner of navbar (EN | РУ)
3. **Persistent**: Choice saved in localStorage
4. **Instant**: Changes apply immediately

## For Users

### Switching Languages

**In the Navigation Bar:**
- Click **EN** for English
- Click **РУ** for Russian

Your choice is automatically saved and will be remembered next time you visit!

### What Gets Translated

✅ **Fully Translated:**
- Homepage
- Navigation menu
- All button labels
- Form fields
- Error messages
- Item listings
- Dashboard
- Messages
- Create item page
- Auth pages (login/register)

💰 **Currency Display:**
- Always shown in Rubles (₽)
- Proper Russian number formatting: 65,000 ₽

## For Developers

### File Structure

```
lib/
├── i18n.ts                    # Translation definitions
components/
├── LanguageContext.tsx        # Context provider
└── LanguageSwitcher.tsx       # Language toggle button
```

### Using Translations

#### In Client Components

```typescript
'use client'

import { useLanguage } from '@/components/LanguageContext'

export default function MyComponent() {
  const { t, language } = useLanguage()
  
  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>Current language: {language}</p>
    </div>
  )
}
```

#### Translation Keys

All translations are in `lib/i18n.ts`:

```typescript
const { t } = useLanguage()

// Navigation
t('nav.items')      // "Browse Items" / "Товары"
t('nav.sell')       // "Sell" / "Продать"
t('nav.messages')   // "Messages" / "Сообщения"

// Homepage
t('home.title')     // "Welcome to TSUSwap" / "Добро пожаловать..."
t('home.subtitle')  // Subtitle text
t('home.description') // Description text

// Items
t('items.title')    // "Browse Items" / "Просмотр товаров"
t('items.search')   // "Search items..." / "Поиск товаров..."

// And many more...
```

### Adding New Translations

1. **Open** `lib/i18n.ts`
2. **Add to English**:
```typescript
export const translations = {
  en: {
    'my.new.key': 'My English Text',
    // ...
  },
```
3. **Add to Russian**:
```typescript
  ru: {
    'my.new.key': 'Мой русский текст',
    // ...
  },
}
```
4. **Use in component**:
```typescript
{t('my.new.key')}
```

### Programmatically Change Language

```typescript
const { setLanguage } = useLanguage()

// Set to English
setLanguage('en')

// Set to Russian
setLanguage('ru')
```

### Get Current Language

```typescript
const { language } = useLanguage()

if (language === 'ru') {
  // Do something for Russian users
}
```

## Translation Categories

### Complete Translation Coverage

#### 1. Navigation (`nav.*`)
- Items, Sell, Messages, Dashboard
- Login, Register, Logout

#### 2. Homepage (`home.*`)
- Title, subtitle, description
- Features (4 sections)
- How it works (3 steps)
- Call to action

#### 3. Items (`items.*`)
- Browse page
- Filters and search
- Item cards

#### 4. Item Detail (`item.*`)
- Full item page
- Bidding interface
- Purchase options
- Seller info

#### 5. Dashboard (`dashboard.*`)
- Statistics
- My listings
- My purchases

#### 6. Messages (`messages.*`)
- Chat interface
- Input fields

#### 7. Create Item (`create.*`)
- All form fields
- Listing types
- Validation messages

#### 8. Authentication (`auth.*`)
- Login page
- Register page
- All form fields

#### 9. Categories (`category.*`)
- Electronics, Furniture, Books, etc.

#### 10. Conditions (`condition.*`)
- New, Like New, Good, Fair, Poor

#### 11. Sharing (`share.*`)
- Share dialog
- Social platforms

#### 12. Common (`common.*`)
- Loading, error, buttons
- Reusable phrases

## Best Practices

### 1. Always Use Translation Keys
```typescript
// ❌ Bad
<h1>Browse Items</h1>

// ✅ Good
<h1>{t('items.title')}</h1>
```

### 2. Keep Keys Organized
Use hierarchical structure:
```
home.title
home.subtitle
home.feature1.title
home.feature1.desc
```

### 3. Provide Context
```typescript
// ❌ Bad key name
t('button1')

// ✅ Good key name
t('auth.signInButton')
```

### 4. Handle Pluralization
For Russian, handle different plural forms:
```typescript
// In translation
'item.bids': 'bids' // EN
'item.bids': 'ставок' // RU (many)
```

## Language Detection

Currently uses:
1. **LocalStorage** - Saved preference
2. **Default** - English if no preference

### Future Enhancements
- Browser language detection
- URL-based language (`/en/`, `/ru/`)
- User profile language preference

## Testing

### Test Checklist
- [ ] Homepage in both languages
- [ ] Navigation menu switches
- [ ] Item listings display correctly
- [ ] Forms use translated labels
- [ ] Buttons show correct text
- [ ] Language persists on reload
- [ ] No untranslated text visible

### Quick Test
1. Open TSUSwap
2. Click РУ button
3. Navigate through pages
4. Verify all text is Russian
5. Reload page - should stay Russian
6. Switch to EN
7. Verify all text is English

## Common Issues

### Issue: Text Not Translating
**Solution:** Check if key exists in `i18n.ts` for both languages

### Issue: Language Not Persisting
**Solution:** Check browser localStorage is enabled

### Issue: Mixed Languages
**Solution:** Ensure all text uses `t()` function, not hardcoded

## Statistics

### Translation Coverage
- **Total Keys**: ~150+
- **Languages**: 2 (EN, RU)
- **Pages Translated**: All main pages
- **Components**: Fully translated

### Supported Content
- ✅ UI Elements
- ✅ Navigation
- ✅ Forms
- ✅ Buttons
- ✅ Messages
- ✅ Errors
- ✅ Help Text
- ✅ Labels
- ✅ Placeholders

## Future Languages

To add more languages:

1. **Add to type**:
```typescript
export type Language = 'en' | 'ru' | 'zh' // Add Chinese
```

2. **Add translations**:
```typescript
export const translations = {
  en: { /* ... */ },
  ru: { /* ... */ },
  zh: { /* Chinese translations */ }
}
```

3. **Update switcher**:
```typescript
<button onClick={() => setLanguage('zh')}>中文</button>
```

## Example Use Cases

### Scenario 1: International Student
- Opens site → sees English
- Uses platform in English
- Comfortable shopping

### Scenario 2: Russian Student
- Opens site → sees English
- Clicks РУ button → everything switches
- Shops in native language
- Choice remembered

### Scenario 3: Mixed Group
- Group chat discussing item
- Some use English, some Russian
- Everyone can use their preference
- Link works for everyone

## Integration with Other Features

### Currency
- Always displays in Rubles (₽)
- Number formatting respects language:
  - English: 65,000 ₽
  - Russian: 65 000 ₽

### Dates
- Uses `date-fns` with locale support
- "2 hours ago" / "2 часа назад"

### Share Links
- Share text translates based on user's language
- Link preview shows in shared language

## Support

### Adding Custom Translations
Create issue or contact team with:
- Page/component name
- Text that needs translation
- Suggested Russian translation

### Translation Quality
All translations reviewed for:
- Accuracy
- Natural phrasing
- Cultural appropriateness
- Technical correctness

---

**Happy Multilingual Trading!** 🌍🎓

TSUSwap - **Welcoming students from all backgrounds** ❤️





