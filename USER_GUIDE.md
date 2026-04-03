# StudyFlow User Guide

A complete guide to every feature in StudyFlow — your AI-powered study platform.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Notes](#notes)
4. [AI Features](#ai-features)
5. [Flashcard Review](#flashcard-review)
6. [Quizzes](#quizzes)
7. [Analytics](#analytics)
8. [Theme & Navigation](#theme--navigation)
9. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## Getting Started

### Creating an Account

1. Navigate to the landing page and click **Get Started**.
2. On the **Sign Up** page, enter:
   - **Name** (minimum 2 characters)
   - **Email** (must be unique)
   - **Password** (minimum 6 characters)
3. Click **Create Account**. You will be redirected to the sign-in page.

### Signing In

Three sign-in methods are available:

- **Google OAuth** — Click "Continue with Google" and authorize.
- **GitHub OAuth** — Click "Continue with GitHub" and authorize.
- **Email / Password** — Enter the credentials you registered with.

After signing in, you land on the **Dashboard**.

### Development Login

When running locally in development mode, use these credentials to skip OAuth setup:

- **Email:** `dev@studyflow.local`
- **Password:** `devpassword`

This automatically creates a test user on first use.

---

## Dashboard

The dashboard is your study hub. It shows:

### Stats Cards

Four cards at the top summarize your progress:

| Card | Description |
|------|-------------|
| **Total Notes** | Number of study notes you have created |
| **Cards Due** | Flashcards scheduled for review today (based on spaced repetition) |
| **Quizzes Completed** | Total quizzes you have finished |
| **Study Streak** | Consecutive days you have studied |

### Recent Activity

A feed of your last 5 study sessions showing:
- Session type (Review, Quiz, or Note Reading)
- Duration
- Key metric (cards reviewed or quiz score)
- Date

### Quick Actions

Four shortcut buttons:
- **Create Note** — Opens the note editor
- **Review Cards** — Starts a flashcard review session (shows a badge with the number of due cards)
- **Take Quiz** — Browse your quizzes
- **Browse Notes** — View all your notes

### New User Welcome

If you have no data yet, the dashboard shows a getting-started guide:
1. Create your first study note
2. Generate flashcards from your notes with AI
3. Review cards daily to build your streak

---

## Notes

### Browsing Notes

Navigate to **Notes** in the sidebar to see all your notes.

**Search and Filter:**
- Type in the search bar to find notes by title or content (search updates after a short delay)
- Use the **Subject** dropdown to filter by subject
- Notes are paginated (12 per page)

**Each note card displays:**
- Title
- Subject badge
- Tags (up to 3 visible, with "+X more" if there are additional tags)
- Content preview (first 100 characters)
- Creation date
- Flashcard and quiz counts

Click any card to open the note.

### Creating a Note

1. Click **Create Note** from the dashboard or the notes page.
2. Fill in the form:
   - **Title** — A descriptive name for your note (required, max 200 characters)
   - **Subject** — Pick from 17 predefined subjects: Mathematics, Physics, Chemistry, Biology, Computer Science, History, Geography, English, Economics, Psychology, Philosophy, Law, Medicine, Engineering, Art, Music, Other
   - **Tags** — Optional, comma-separated keywords (e.g., "newton, motion, physics")
   - **Content** — Write your study material using the rich text editor
3. Click **Create Note** to save.

### Rich Text Editor

The editor includes a formatting toolbar with:

| Button | Action |
|--------|--------|
| **B** | Bold text |
| *I* | Italic text |
| **H2** | Heading |
| Bullet list icon | Unordered list |
| Number list icon | Ordered list |
| `<>` | Code block |
| Highlight icon | Highlight text |
| Undo/Redo arrows | Undo and redo changes |

You can paste content from other sources (web pages, documents) and the editor preserves formatting.

### Editing a Note

1. Click on a note from the notes list.
2. Modify any field (title, subject, tags, content).
3. Click **Save Changes**.

### Deleting a Note

1. Open the note you want to delete.
2. Click the red **Delete** button in the top-right corner.
3. Confirm in the dialog.

**Important:** Deleting a note also deletes all flashcards and quizzes generated from it.

---

## AI Features

Every note has an **AI section** below the edit form with three tabs: **Flashcards**, **Quiz**, and **Ask AI**.

### Generating Flashcards

1. Open a note and scroll to the AI section.
2. Select the **Flashcards** tab.
3. Choose how many cards to generate: **5**, **10**, or **15**.
4. Click **Generate Flashcards**.
5. The AI reads your note content and creates question/answer pairs.
6. **Preview the results:**
   - Each card shows the front (question) and back (answer)
   - Remove individual cards by clicking the trash icon
   - Click **Regenerate** to get a fresh set
7. Click **Save** to add the cards to your collection.

Saved flashcards appear in the **Review** section and are scheduled using the spaced repetition algorithm.

### Generating Quizzes

1. Open a note and select the **Quiz** tab in the AI section.
2. Choose the number of questions: **5**, **10**, or **15**.
3. Select a difficulty level: **Easy**, **Medium**, or **Hard**.
4. Click **Generate Quiz**.
5. **Preview the results:**
   - Each question shows the question text, four options, the correct answer (highlighted), and an explanation
   - Remove individual questions with the trash icon
   - Click **Regenerate** for new questions
6. Click **Save** to create the quiz.

The saved quiz appears on the **Quizzes** page, ready to take.

### Ask AI (Study Chat)

1. Open a note and select the **Ask AI** tab.
2. Type a question about your note content in the input field (e.g., "Explain Newton's second law in simpler terms").
3. Press Enter or click the send button.
4. The AI responds in real-time (you see the answer stream in as it generates).
5. The chat remembers your conversation, so you can ask follow-up questions.

**Use cases:**
- Ask for clarification on a concept in your notes
- Request examples or analogies
- Ask the AI to summarize specific sections
- Get help understanding difficult topics

### Rate Limits

AI features are rate-limited to prevent abuse:
- **Flashcard/Quiz generation:** 10 requests per minute
- **AI Chat:** 20 messages per minute

If you hit the limit, wait briefly and try again.

---

## Flashcard Review

The spaced repetition review system is the core learning feature of StudyFlow.

### How Spaced Repetition Works

StudyFlow uses the **SM-2 algorithm** (the same system behind Anki):

1. When you review a flashcard, you rate how well you knew the answer.
2. Based on your rating, the algorithm calculates when you should see that card again:
   - **Cards you forgot** are shown again the next day
   - **Cards you found hard** are shown in a few days
   - **Cards you knew well** are pushed out to weeks or months
3. Over time, you spend less time on things you already know and more time on things you need to practice.

### Starting a Review Session

1. Navigate to **Review** in the sidebar.
2. If cards are due, you see the count (e.g., "4 cards due for review").
3. The review session starts automatically with the first card.

### Reviewing a Card

1. **Read the question** on the front of the card.
2. **Think of your answer** before flipping.
3. **Flip the card** by clicking it or pressing **Space**.
4. **Read the answer** and compare with what you recalled.
5. **Rate your recall** using one of four buttons:

| Rating | When to Use | What Happens |
|--------|-------------|--------------|
| **Again** (red) | You completely forgot | Card resets — shown again tomorrow |
| **Hard** (orange) | You remembered, but it was difficult | Short interval (a few days) |
| **Good** (blue) | You recalled it correctly | Standard interval increase |
| **Easy** (green) | You knew it instantly | Long interval (weeks/months) |

6. The next card appears automatically.

### Progress Tracking

During a session, the top of the page shows:
- **Card counter:** "Card 3 of 10"
- **Progress bar:** Gradient bar filling from left to right
- **Percentage:** Shows completion percentage

### Session Summary

After reviewing all due cards, you see a summary:
- **Cards Reviewed** — Total count
- **Accuracy** — Percentage of cards rated Good or Easy
- **Time Taken** — Duration of the session

Two options:
- **Back to Dashboard** — Return home
- **Review More** — Continue if additional cards are due

Sessions are automatically logged to your study history and contribute to your streak.

---

## Quizzes

### Browsing Quizzes

Navigate to **Quizzes** in the sidebar. Each quiz card shows:
- Title
- Source note
- Status: **Pending** (not yet taken) or **Completed**
- Score (for completed quizzes, e.g., "8/10 — 80%")
- Question count
- Creation date

### Taking a Quiz

1. Click on a **Pending** quiz.
2. The quiz player loads with a timer that starts immediately.

**For each question:**
- Read the question text.
- Click one of the four options (A, B, C, D) to select your answer.
- Your selection is highlighted.
- Navigate between questions with **Previous** and **Next** buttons.
- You can change answers freely before submitting.

3. On the last question, when all questions are answered, a **Submit Quiz** button appears.
4. Click **Submit Quiz** to finish.

### Quiz Results

After submission, you see:

**Score Banner:**
- Large fraction display (e.g., "8/10")
- Percentage (e.g., "80%")
- Color-coded: green (80%+), yellow (60-79%), red (below 60%)
- Time taken

**Per-Question Breakdown:**
Each question shows:
- Green checkmark or red X icon
- The question text
- Your answer (green if correct, red if incorrect)
- The correct answer (shown when you got it wrong)
- An explanation of why the correct answer is right

Click **Back to Quizzes** to return to the list.

### Creating New Quizzes

Quizzes are generated from notes using AI. See the [AI Features](#generating-quizzes) section.

---

## Analytics

Navigate to **Analytics** in the sidebar to visualize your study patterns.

### Period Filter

Filter all data by time period using the buttons at the top:
- **7d** — Last 7 days
- **30d** — Last 30 days (default)
- **90d** — Last 90 days

### Summary Stats

Four metrics displayed at the top:

| Stat | Description |
|------|-------------|
| **Total Study Time** | Cumulative minutes studied in the period |
| **Sessions** | Number of study sessions completed |
| **Avg Session** | Average session duration in minutes |
| **Avg Quiz Score** | Average score across all quizzes |

### Charts

Three charts provide visual insights:

1. **Study Time Chart** — Area chart showing minutes studied per day. Helps you spot study patterns and consistency.

2. **Quiz Performance Chart** — Line chart showing quiz score trends over time. Helps you see if your understanding is improving.

3. **Subject Breakdown** — Bar chart showing how many notes you have per subject. Helps you identify where you are focusing your effort.

---

## Theme & Navigation

### Dark / Light Mode

Click the **sun/moon icon** in the header to toggle between light and dark themes. Your preference is saved and persists across sessions.

### Desktop Navigation

A sidebar on the left provides quick links to all sections:
- Dashboard
- Notes
- Review
- Quizzes
- Analytics

The active page is highlighted in the sidebar.

### Mobile Navigation

On smaller screens, the sidebar is hidden. Tap the **hamburger menu icon** (three lines) in the top-left corner to open a slide-out navigation panel with the same links.

---

## Keyboard Shortcuts

### Flashcard Review

| Key | Action |
|-----|--------|
| **Space** | Flip the current card |
| **1** | Rate as "Again" (after flipping) |
| **2** | Rate as "Hard" (after flipping) |
| **3** | Rate as "Good" (after flipping) |
| **4** | Rate as "Easy" (after flipping) |

These shortcuts are disabled when you are typing in a text field.

---

## Tips for Effective Studying

1. **Write detailed notes** — The more content in your notes, the better the AI-generated flashcards and quizzes will be.

2. **Review daily** — Even 5 minutes of flashcard review per day builds strong long-term memory. The spaced repetition algorithm does the scheduling for you.

3. **Be honest with ratings** — Rate cards accurately during review. Marking a card "Easy" when you struggled means it will not come back soon enough. The algorithm works best with honest feedback.

4. **Use the AI chat** — If you do not understand a concept in your notes, ask the AI to explain it differently before reviewing flashcards.

5. **Check your analytics** — Use the analytics page to spot gaps in your study routine and track improvement over time.

6. **Mix subjects** — Create notes across different subjects to keep your study sessions varied and engaging.
