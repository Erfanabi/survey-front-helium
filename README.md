# Helium Park Customer Survey System

This project is a customer feedback survey system for Helium Park, built with
Next.js and modern React libraries. It provides a dynamic, multi-step survey
form for collecting customer satisfaction data.

## Key Features

- Dynamic fetching of survey questions from the backend
- Supports rating (1-10), boolean (yes/no), and text questions
- Multi-step form with progress and navigation
- Form validation using Formik and Yup
- Responsive and modern UI with HeroUI and Tailwind CSS
- Displays a thank you message after successful submission
- Prevents duplicate participation with a dedicated UI

## Technologies Used

- **Next.js**: React framework for web application development
- **Formik**: Form management
- **Yup**: Form validation
- **HeroUI**: Modern UI components
- **Tailwind CSS**: CSS framework for UI design

## Prerequisites

- Node.js version 18 or higher
- npm or yarn

## Installation and Setup

1. Clone the project:

```bash
git clone [repository-url]
cd survey-front-helium
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

The project will be available at `http://localhost:3000`

## Project Structure

```
survey-front-helium/
├── src/
│   ├── app/
│   │   ├── layout.js        # Main application layout
│   │   └── page.js          # Main survey page
│   └── components/          # Reusable components (e.g., LoadingOverlay, ShowThankYou)
├── public/                  # Static files (images, fonts)
├── tailwind.config.js       # Tailwind CSS configuration
```

## How to Use

1. Open the survey page in your browser
2. Answer each question (rating, yes/no, or text)
3. Click the submit button to proceed to the next question
4. After the last question, your answers are submitted to the backend
5. You will see a thank you message and cannot submit the survey again

## Environment Setup

If you need to proxy API requests to a backend server, configure
`next.config.mjs` accordingly. Example:

```js
// next.config.mjs
export default {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://your-backend-ip:3000/api/:path*",
      },
    ];
  },
};
```

## Development

- To add or modify survey logic, edit `src/app/page.js`
- To customize UI, edit components in `src/components/` and styles in
  `globals.css`
- To change survey questions, update the backend API

## Contributing

We welcome your contributions to improve this project. Please create a Pull
Request for any suggested changes.
