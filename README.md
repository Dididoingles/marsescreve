# Mars Assistant

Mars Assistant is a free educational writing tool designed to help students practice English by allowing them to write naturally. When a student does not know a specific word in English, they can simply write it in Portuguese. The tool identifies these Portuguese terms to find the best English equivalent for that specific context, allowing the student to maintain their writing flow without stopping to use a dictionary.


## Features

- **Hybrid Language Translation:** Identifies Portuguese words mixed into English sentences and suggests the correct contextual translation. 
- **Grammar and Spelling Check:** Integrates with LanguageTool to identify and correct grammatical errors.
- **Text-to-Speech (TTS):** Allows students to listen to the pronunciation of their text or specific words.
- **PDF Export:** Generates a downloadable report containing the student's text and a dedicated "New Words" section based on highlighted terms.
- **Focus Mode:** A clean, distraction-free interface with a splash screen and smooth loading animations.


### Frontend
- **HTML5 / CSS3 / Vanilla JavaScript:** No heavy frameworks, ensuring fast load times.
- **Google Fonts:** Poppins, Shantell Sans, and JetBrains Mono.
- **html2pdf.js:** Used for generating PDF reports on the client side.
- **LanguageTool:** Utilized for grammar checking.

## Project Structure

/
├── index.html              # Landing page with introductory video
├── 404.html                # Custom error page
├──english/index.html       # Main application interface
  └──  css/
    └── style.css           # Main stylesheet
  └──  js/
    └──  script.js           # Core app logic (placeholders, panels, TTS, grammar)
    └──  clear-text.js       # Logic to clear the editor with a confirmation modal
    └──  download-pdf.js     # PDF generation logic
    └── integration.js      # Integration with core logic
├── terms/
│   └── index.html          # Terms of Use and Privacy Policy
└── assets/                 # Images and video files (icons, logos, splash video)


## How to Use
Open the application in a web browser (preferably on a desktop computer) using this link: https://dididoingles.github.io/marsescreve/

Start writing your text in English.

When you do not know an English word, type it in Portuguese.

Click the "Magnifying Glass" icon (Identify new words) to let Mars find the English translation.

Mars will highlight the translated words. You can choose to listen to the pronunciation or insert the corrected word directly into your text.

Use the "Wand" icon to check grammar and spelling via LanguageTool.

Use the "Download" icon to export your text and highlighted vocabulary as a PDF.

## Privacy and Data Handling
No Permanent Storage: The application does not store your text on any server. The processing is done in real-time and discarded immediately after the response.

LanguageTool: Text sent for grammar checking is processed according to their GDPR-compliant policies. They do not store the text.
For more details, please refer to the terms/index.html page within the app.

## License
This project is provided for free use for educational purposes.

You are permitted to use this tool in classrooms, study groups, or personal learning environments. However, you are strictly forbidden from modifying, distributing, or selling this software for commercial or non-educational purposes without explicit permission from the author.
