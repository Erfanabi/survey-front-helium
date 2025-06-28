# Helium Park Customer Survey System - Documentation

## Overview

The Helium Park Customer Survey System is a Next.js-based web application
designed to collect customer feedback through a dynamic, multi-step survey form.
The system supports various question types and provides a seamless user
experience with proper validation and state management.

## Project Structure

```
survey-front-helium/
├── src/
│   ├── app/
│   │   ├── layout.js          # Main application layout
│   │   ├── page.js            # Main survey component
│   │   ├── globals.css        # Global styles
│   │   └── loading.js         # Loading component
│   └── components/
│       ├── LoadingOverlay.js  # Loading overlay component
│       └── ShowThankYou.js    # Thank you/error message component
├── public/                    # Static assets
├── next.config.mjs           # Next.js configuration
└── package.json              # Dependencies and scripts
```

## Core Components

### 1. Main Survey Component (`src/app/page.js`)

The main component that handles the entire survey flow.

#### Key Features:

- **Dynamic Question Loading**: Fetches questions from backend API
- **Multi-step Navigation**: Step-by-step question progression
- **Form Validation**: Comprehensive validation using Formik and Yup
- **State Management**: Manages survey progress and user responses
- **API Integration**: Handles data submission to backend

#### State Management:

```javascript
// Combined state for questions fetching
const [questionsState, setQuestionsState] = useState({
  questions: [],
  loading: true,
  fetchError: null,
});

// Combined state for participation status
const [participationState, setParticipationState] = useState({
  flag: false, // Whether user has already participated
  sentFlag: false, // Whether the survey link is valid
});

// Survey progress state
const [step, setStep] = useState(0);
const [answers, setAnswers] = useState({});
const [submitting, setSubmitting] = useState(false);
const [showThankYou, setShowThankYou] = useState(false);
```

#### Question Types Support:

1. **Rating Questions (TypeId: 1)**

   - 1-10 rating scale (mapped from 5-star display)
   - Optional explanation for scores 1, 2, 9, 10
   - Visual emoji feedback

2. **Boolean Questions (TypeId: 2)**

   - Yes/No selection
   - Optional text explanation
   - Manual progression (no auto-submit)

3. **Text Questions (TypeId: 3)**
   - Free-form text input
   - Required for submission

#### API Integration:

```javascript
// Fetch questions
const res = await fetch(process.env.NEXT_PUBLIC_API_QUESTIONS);

// Check participation status
const res = await fetch(`${process.env.NEXT_PUBLIC_API_SUBMIT_SURVEY}/${id}`);

// Submit survey responses
const res = await fetch(`${process.env.NEXT_PUBLIC_API_SUBMIT_SURVEY}/${id}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ response }),
});
```

### 2. ShowThankYou Component (`src/components/ShowThankYou.js`)

Displays appropriate messages based on user participation status.

#### Props:

- `alreadyParticipated` (boolean): Shows different message if user has already
  participated

#### Usage:

```javascript
<ShowThankYou alreadyParticipated={participationState.flag} />
```

### 3. LoadingOverlay Component (`src/components/LoadingOverlay.js`)

Provides loading feedback during API calls and form submission.

## Form Validation

The system uses Yup for comprehensive form validation:

```javascript
const getValidationSchema = Yup.object().shape({
  score: Yup.number()
    .min(0, "حداقل امتیاز ۰ است")
    .max(10, "حداکثر امتیاز ۱۰ است")
    .nullable()
    .when(["$type"], {
      is: val => val === "text",
      then: schema => schema.notRequired(),
    }),
  badReason: Yup.string().when(["score", "$type"], {
    is: (score, type) => type === "rating" && [1, 2, 9, 10].includes(score),
    then: schema => schema.required("لطفاً توضیحات را وارد کنید"),
    otherwise: schema => schema.notRequired(),
  }),
  finalComment: Yup.string().when(["$type"], {
    is: val => val === "text",
    then: schema => schema.required("لطفاً نظر خود را وارد کنید"),
    otherwise: schema => schema.notRequired(),
  }),
});
```

## Data Flow

### 1. Initial Load

1. Extract `id` from URL parameters
2. Validate `id` presence
3. Fetch participation status from backend
4. Fetch survey questions from backend
5. Display appropriate UI based on status

### 2. Survey Navigation

1. User answers current question
2. Validate response
3. Store answer in local state
4. Navigate to next question or submit

### 3. Data Submission

1. Collect all answers from state
2. Format data according to backend requirements
3. Submit via POST request
4. Show thank you message

## API Response Format

### Questions API Response:

```json
{
  "data": {
    "questions": [
      {
        "id": 1,
        "Description": "Question text",
        "TypeId": 1
      }
    ]
  }
}
```

### Participation Check Response:

```json
{
  "data": {
    "flag": false,
    "sentFlag": true
  }
}
```

### Survey Submission Request:

```json
{
  "response": [
    {
      "questionId": 1,
      "value": "5",
      "desc": "Optional explanation"
    }
  ]
}
```

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_API_QUESTIONS=/api/manager/crm/customers/questions
NEXT_PUBLIC_API_SUBMIT_SURVEY=/api/manager/crm/sms-survey
```

## Error Handling

The system handles various error scenarios:

1. **Invalid/Missing ID**: Shows "لینک نامعتبر" message
2. **API Errors**: Displays appropriate error messages
3. **Network Issues**: Graceful fallback with user feedback
4. **Validation Errors**: Inline form validation with helpful messages

## Styling

The application uses:

- **Tailwind CSS**: Utility-first CSS framework
- **HeroUI**: Modern UI component library
- **Custom Background**: K2.jpg background image
- **Responsive Design**: Mobile-first approach

## Browser Compatibility

- Modern browsers with ES6+ support
- Mobile-responsive design
- Touch-friendly interface

## Performance Considerations

- Lazy loading of components
- Efficient state management
- Optimized API calls
- Minimal re-renders through proper state structure

## Security Features

- Input validation and sanitization
- CSRF protection through proper API design
- Secure data transmission
- No sensitive data stored in client-side state

## Future Enhancements

Potential improvements:

- Offline support with service workers
- Advanced analytics and reporting
- Multi-language support
- Accessibility improvements
- Progressive Web App features
