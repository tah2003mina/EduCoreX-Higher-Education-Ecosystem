// ai_assistant.js - Optimized with emojis and no markdown

// Get CSRF token from cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// Cache for common responses
const responseCache = new Map();
const CACHE_SIZE = 50;

// Quick action templates
const quickActions = {
    'sop': 'I need help writing a Statement of Purpose (SOP) for my university application. Can you provide guidelines and a professional template?',
    'gm': 'I need to write a professional Good Morning message for my professor/colleague. Can you help me with some templates?',
    'research': 'I need guidance on how to start my research paper. Can you help me with the structure and key components?',
    'career': 'I need career guidance. Can you help me with professional development advice?',
    'ielts': 'I need help preparing for IELTS. Can you provide study tips and resources?',
    'resume': 'I need help writing a professional resume/CV. Can you provide tips and templates?',
    'interview': 'I need help preparing for a job interview. Can you provide tips and common questions?',
    'email': 'I need help writing a professional email. Can you provide templates for different situations?',
    'study': 'I need effective study techniques and tips. Can you help?',
    'scholarship': 'I need help finding and applying for scholarships. Can you provide guidance?'
};

// Strict response for off-topic questions
const OFF_TOPIC_RESPONSE = "🤖 I only answer questions related to this platform. Please ask about:\n\n📝 SOP guidelines\n💼 Professional messages\n🔬 Research help\n🎯 Career advice\n🌐 IELTS preparation\n📄 Resume writing\n🤝 Interview tips\n📚 Study techniques\n💰 Scholarships\n\nHow can I help you with your academic journey today?";

// Comprehensive template responses with emojis and no markdown
const templateResponses = {
    // SOP Templates
    'sop': `📝 STATEMENT OF PURPOSE - Complete Guide

Hello! I'll help you create an impressive SOP. Here's a comprehensive guide:

🎯 PART 1: INTRODUCTION PARAGRAPH
Start with a compelling hook that shows your passion:
• A personal story that sparked your interest
• A moment that changed your perspective
• Your genuine motivation for this field

Example:
"Growing up in a small town with limited healthcare access, I witnessed firsthand how technology could bridge gaps in medical services. This experience ignited my passion for Biomedical Engineering."

📚 PART 2: ACADEMIC BACKGROUND
Highlight your educational journey:
• Relevant coursework and projects
• Research experience
• Academic achievements
• Technical skills gained

💼 PART 3: PROFESSIONAL EXPERIENCE
Showcase your practical exposure:
• Internships and jobs
• Key responsibilities
• Skills developed
• Impact you made

🎓 PART 4: WHY THIS PROGRAM
Be specific about your choice:
• Courses that excite you
• Professors you want to learn from
• Facilities and resources
• Unique program features

🌟 PART 5: CAREER GOALS
Share your vision:
• Short-term goals (during/after program)
• Long-term aspirations
• How this program fits your plans

✨ QUICK TEMPLATE:

Dear Admissions Committee,

[Share your passion and motivation in 2-3 sentences]

During my undergraduate studies at [University], I focused on [your field]. My research on [topic] taught me [key skills]. I also achieved [mention 1-2 key accomplishments].

Professionally, I gained experience at [company] where I [key responsibility]. This experience reinforced my interest in [specific area].

I am drawn to [University] because [specific reasons]. In particular, I'm excited to learn from [Professor] about [their research area].

After completing this program, I plan to [short-term goals]. Ultimately, I aspire to [long-term vision].

Thank you for considering my application. I look forward to contributing to your community.

Sincerely,
[Your Name]

Would you like me to help you write any specific section? Just ask! 😊`,

    // Professional Messages
    'gm': `📨 PROFESSIONAL MESSAGES GUIDE

👨‍🏫 To a Professor:
"Good morning Professor [Name]! ☀️ I hope you have a wonderful day ahead. I was reviewing [topic] from yesterday's lecture and had a question. Would it be convenient to discuss this during your office hours?"

👥 To a Colleague:
"Good morning [Name]! 🌅 Hope you had a great evening. I'm looking forward to our meeting at [time]. Let me know if you need anything from me before then."

👔 To a Supervisor:
"Good morning [Name]! ✨ I hope this message finds you well. I've completed [task] and it's ready for your review. Have a productive day!"

🤝 To a Team:
"Good morning team! 🌟 Hope everyone is refreshed and ready for a great day! Here's our agenda:
• 10:00 AM - Standup meeting
• 2:00 PM - Project review
• 4:00 PM - Client call

Let's make it a productive day! 💪"

📧 PROFESSIONAL EMAIL TEMPLATES

📅 Meeting Request:
Subject: Meeting Request - [Topic]

Dear [Name],

I hope this email finds you well! 😊 I would like to request a meeting to discuss [topic]. Would you be available on [date] at [time]? If not, please suggest a convenient time.

Looking forward to connecting!

Best regards,
[Your Name]

🔄 Follow-up Email:
Subject: Follow-up on [Topic]

Dear [Name],

Hope you're doing well! ✨ I'm writing to follow up on [previous discussion] regarding [topic]. Have you had a chance to [action item]?

Please let me know if you need any additional information from my side.

Thank you for your time!

Best regards,
[Your Name]

🙏 Thank You Email:
Subject: Thank You - [Reason]

Dear [Name],

Thank you so much for [meeting/help/opportunity]! 🙏 I truly appreciate your time and [specific thing you're thankful for].

I look forward to [next steps]!

Warm regards,
[Your Name]

Which type of message would you like me to help you with? 😊`,

    // Research Guide
    'research': `🔬 COMPREHENSIVE RESEARCH PAPER GUIDE

Let me guide you through the research process! 📚

📍 STEP 1: CHOOSE A TOPIC
• Select something you're passionate about ❤️
• Ensure sufficient resources are available
• Narrow down to a specific research question
• Get advisor approval ✓

📖 STEP 2: LITERATURE REVIEW
• Use academic databases (Google Scholar, JSTOR, PubMed)
• Focus on recent publications (last 5 years)
• Take organized notes 📝
• Identify the research gap

🎯 STEP 3: DEVELOP THESIS STATEMENT
• Make it clear and specific
• Ensure it's arguable
• Let it guide your research
• Example: "This study argues that..."

📋 STEP 4: CREATE OUTLINE

I. Introduction (1-2 pages)
   • Hook and background
   • Research problem
   • Research questions
   • Thesis statement
   • Paper roadmap

II. Literature Review (3-5 pages)
   • Previous research
   • Theoretical framework
   • Research gap
   • Your contribution

III. Methodology (2-3 pages)
   • Research design
   • Data collection methods
   • Analysis approach
   • Ethical considerations

IV. Results/Findings (3-4 pages)
   • Present data clearly
   • Use tables/figures 📊
   • Objective presentation
   • Key findings

V. Discussion (3-4 pages)
   • Interpret results
   • Compare with literature
   • Discuss implications
   • Acknowledge limitations

VI. Conclusion (1-2 pages)
   • Summary of findings
   • Answer research questions
   • Recommendations
   • Future research suggestions

✍️ STEP 5: WRITE FIRST DRAFT
• Start with the easiest section
• Don't worry about perfection
• Follow your outline
• Cite as you write

🔍 STEP 6: REVISE AND EDIT
• Check structure and flow
• Strengthen arguments
• Verify citations
• Proofread carefully

📌 STEP 7: FORMAT AND CITE
• Follow required style (APA, MLA, Chicago)
• Create reference list
• Check in-text citations
• Format headings correctly

🛠️ RESEARCH TOOLS:
• Zotero/Mendeley - Reference management
• Grammarly - Writing assistance ✨
• SPSS/R/Excel - Data analysis
• Canva - Create figures and graphics 🎨

What aspect of research would you like help with? I'm here to help! 😊`,

    // Career Guide
    'career': `🎯 COMPREHENSIVE CAREER DEVELOPMENT GUIDE

Let's build your successful career path! 🚀

🔍 STEP 1: SELF-ASSESSMENT
• Identify your strengths and weaknesses 💪
• Consider your interests and values ❤️
• Take career assessments (MBTI, Strong Interest Inventory)
• List your skills (technical and soft)

🗺️ STEP 2: CAREER EXPLORATION
• Research different industries
• Conduct informational interviews 👥
• Try job shadowing
• Attend career fairs
• Follow companies on LinkedIn

📚 STEP 3: SKILL DEVELOPMENT

Technical Skills:
• Take online courses (Coursera, Udemy) 💻
• Earn certifications 📜
• Build portfolio projects
• Learn industry tools

Soft Skills:
• Communication 🗣️
• Leadership 👑
• Problem-solving 🧩
• Teamwork 🤝
• Time management ⏰

📄 STEP 4: RESUME BUILDING
• Use a professional format
• Quantify achievements with numbers
• Tailor for each job
• Include relevant keywords
• Keep it concise (1-2 pages)

🌐 STEP 5: NETWORKING
• Create a strong LinkedIn profile
• Join professional associations
• Attend industry events
• Connect with alumni
• Follow up consistently

🔎 STEP 6: JOB SEARCH
• Use multiple platforms (LinkedIn, Indeed)
• Set up job alerts 🔔
• Apply strategically
• Track applications 📊
• Follow up appropriately

🤝 STEP 7: INTERVIEW PREPARATION
• Research the company thoroughly
• Practice common questions
• Prepare your stories (STAR method)
• Prepare questions to ask
• Do mock interviews

📈 STEP 8: PROFESSIONAL GROWTH
• Find a mentor 👤
• Continue learning
• Seek feedback
• Set career goals
• Build your personal brand

💡 QUICK TIPS:
• Update LinkedIn profile monthly
• Learn one new skill quarterly
• Network with 3 new people monthly
• Review and update resume every 6 months

What career topic would you like guidance on? I'm here to help! 😊`,

    // IELTS Guide
    'ielts': `🌐 COMPLETE IELTS PREPARATION GUIDE

Welcome! Let's prepare for your IELTS success! 🎯

📋 IELTS OVERVIEW
• Two versions: Academic (university) and General Training (work/migration)
• Four sections: Listening, Reading, Writing, Speaking
• Scoring: 0-9 band score
• Test duration: 2 hours 45 minutes

👂 LISTENING SECTION (30 minutes)

Format:
• 4 recordings, 40 questions
• Recordings: conversation, monologue, group discussion, lecture
• Question types: multiple choice, matching, map labeling, form completion

Tips:
• Read questions before each section 👀
• Listen for keywords and signposts
• Watch for plurals and word limits
• Practice with various accents 🌍

Practice Resources:
• BBC 6 Minute English 🎧
• TED Talks
• Cambridge IELTS practice tests
• British Council podcasts

📖 READING SECTION (60 minutes)

Format:
• 3 passages, 40 questions
• Texts from books, journals, newspapers
• Question types: True/False/NG, matching headings, summary completion

Tips:
• Skim first, then scan for answers
• 20 minutes per passage maximum ⏰
• Read questions before passage
• Don't leave any blank answers

✍️ WRITING SECTION (60 minutes)

Task 1 - Academic (20 minutes, 150 words):
• Describe graphs, charts, or diagrams 📊
• Structure: Introduction → Overview → Details
• Key phrases: "The graph illustrates...", "There was a significant increase..."

Task 1 - General Training:
• Write a letter (formal, semi-formal, or informal)
• Structure: Salutation → Purpose → Details → Closing

Task 2 - Both Versions (40 minutes, 250 words):
• Essay (opinion, discussion, problem-solution)
• Structure: Introduction → 2-3 body paragraphs → Conclusion

Writing Tips:
• Plan for 5-10 minutes
• Check word count
• Use paragraph structure
• Vary vocabulary
• Review for errors

🗣️ SPEAKING SECTION (11-14 minutes)

Part 1 - Introduction (4-5 minutes):
• General questions about work, study, home, family, hobbies
• Tip: Give detailed answers, not just yes/no

Part 2 - Cue Card (3-4 minutes):
• 1 minute preparation, 2 minutes speaking
• Topic card with prompts
• Structure: What, When, Where, Why, How

Part 3 - Discussion (4-5 minutes):
• Abstract questions related to Part 2
• Express and justify opinions
• Discuss issues and propose solutions

Speaking Tips:
• Speak naturally and fluently
• Use varied vocabulary
• Give examples
• Don't memorize answers
• Practice with timer ⏲️

📅 8-WEEK STUDY PLAN

Week 1-2: Assessment and Foundation
• Take diagnostic test
• Understand test format
• Build vocabulary
• Identify weak areas

Week 3-4: Section Practice
• Focus on one section daily
• Practice question types
• Learn strategies
• Take section tests

Week 5-6: Full Tests
• Take full practice tests
• Simulate test conditions
• Review mistakes thoroughly
• Focus on weak areas

Week 7-8: Final Preparation
• Daily full tests
• Time management practice
• Review strategies
• Rest before test day

📚 RECOMMENDED RESOURCES
• Cambridge IELTS series (1-17) 📘
• IELTS Liz (website/YouTube)
• IELTS Advantage
• British Council IELTS Prep App 📱
• BBC Learning English
• Grammarly for writing practice

⚠️ COMMON MISTAKES TO AVOID
❌ Not reading instructions carefully
❌ Poor time management
❌ Memorized answers (especially speaking)
❌ Off-topic essays
❌ Ignoring word limits
❌ Not reviewing answers

Which IELTS section would you like help with? Ask me anything! 😊`,

    // Resume Guide
    'resume': `📄 PROFESSIONAL RESUME WRITING GUIDE

Let's create an impressive resume that gets you hired! 🚀

📋 RESUME FORMAT OPTIONS

1. Chronological (most common):
   • Lists experience in reverse order
   • Best for: steady work history, traditional fields

2. Functional:
   • Focuses on skills, not timeline
   • Best for: career changers, employment gaps

3. Combination:
   • Mix of skills and chronological
   • Best for: experienced professionals

📌 RESUME SECTIONS

👤 1. CONTACT INFORMATION
• Full name
• Phone number 📞
• Professional email ✉️
• LinkedIn profile
• Portfolio/website (if relevant)
• Location (city, state)

🌟 2. PROFESSIONAL SUMMARY (2-3 sentences)
• Who you are
• Key strengths
• What you're seeking

Example:
"Results-driven marketing specialist with 5+ years of experience in digital campaigns and brand management. Proven track record of increasing engagement by 40% through data-driven strategies. Seeking to leverage expertise in a growth-focused role."

🎓 3. EDUCATION
• Degree and major
• University name and location
• Graduation date (or expected)
• GPA (if 3.5+)
• Relevant coursework
• Academic achievements

💼 4. WORK EXPERIENCE

For each position include:
• Job title
• Company name and location
• Dates employed
• 3-5 bullet points with achievements

Bullet Point Formula:
Action Verb + Task + Result (with metrics) 📊

Examples:
• "Increased sales by 30% within 6 months through targeted outreach" 📈
• "Managed team of 10 employees, improving productivity by 25%" 👥
• "Reduced costs by $50,000 annually through process optimization" 💰

🛠️ 5. SKILLS
• Technical skills (software, tools, languages) 💻
• Soft skills (leadership, communication) 🤝
• Languages (with proficiency) 🌐
• Certifications 📜

✨ 6. ADDITIONAL SECTIONS (optional)
• Projects
• Publications
• Volunteer work
• Awards and honors 🏆
• Professional memberships

📝 RESUME TEMPLATE

[YOUR NAME]
📞 [Phone] | ✉️ [Email] | 🔗 [LinkedIn]
📍 [Location]

🌟 PROFESSIONAL SUMMARY
[2-3 sentences highlighting your experience and strengths]

🎓 EDUCATION
[Degree] in [Field]
[University Name], [Location]
[Graduation Date] | GPA: [GPA if 3.5+]

💼 WORK EXPERIENCE

[Job Title] | [Company Name]
[Start Date] - [End Date]
• [Achievement 1 with metric] 📊
• [Achievement 2 with metric] 
• [Achievement 3 with metric]

[Previous Job Title] | [Previous Company]
[Start Date] - [End Date]
• [Achievement 1 with metric]
• [Achievement 2 with metric]

🛠️ SKILLS
• Technical: [List 5-7 technical skills] 💻
• Soft: [List 3-5 soft skills] 🤝
• Languages: [List languages and proficiency] 🌐

📜 CERTIFICATIONS & PROJECTS
• [Certification name], [Year] ✅
• [Project name] - [Brief description]

💡 RESUME TIPS:
• Tailor for each job application ✨
• Use keywords from job description
• Quantify achievements with numbers
• Keep it to 1-2 pages
• Use professional fonts (Arial, Calibri)
• Save as PDF 📄
• Proofread multiple times

⚡ ACTION VERBS TO USE:
• Achieved, Improved, Increased, Reduced
• Managed, Led, Coordinated, Organized
• Developed, Created, Designed, Implemented
• Analyzed, Researched, Evaluated, Assessed

Would you like help with a specific section or industry? I'm here to help! 😊`,

    // Interview Guide
    'interview': `🤝 COMPREHENSIVE INTERVIEW PREPARATION GUIDE

Let's get you ready for interview success! 🎯

📋 BEFORE THE INTERVIEW

🔍 1. RESEARCH THE COMPANY
• Mission, vision, values
• Products/services
• Recent news/achievements 📰
• Company culture
• Competitors
• Industry trends

📝 2. ANALYZE THE JOB DESCRIPTION
• Key requirements
• Required skills
• Responsibilities
• Keywords to mention

📚 3. PREPARE YOUR STORIES (STAR Method)

STAR Framework:
• Situation - Context (When? Where?)
• Task - What needed to be done?
• Action - What did YOU do?
• Result - What was the outcome? (with metrics) 📊

Prepare stories for:
• Leadership experience 👑
• Problem-solving situation 🧩
• Team conflict resolution 🤝
• Project success 🏆
• Failure and learning 📉
• Adaptability example 🔄

❓ 4. PRACTICE COMMON QUESTIONS

"Tell me about yourself":
"Currently, I'm [current role] where I [key responsibility]. Previously, I [previous experience]. I'm excited about this opportunity because [reason]."

"Why do you want this job?":
"I'm passionate about [industry/field]. This role excites me because [specific aspect]. My skills in [skill] would allow me to contribute to [company goal]."

"What are your strengths?":
"My greatest strength is [strength]. For example, when [situation], I [action] which resulted in [positive outcome]."

"What are your weaknesses?":
"I've been working on improving [actual weakness]. I've taken [specific steps] and have seen improvement in [area]."

"Where do you see yourself in 5 years?":
"In 5 years, I hope to have developed expertise in [area] and be in a position where I can contribute and lead. This role aligns with that path because [reason]."

"Why should we hire you?":
"Based on my experience in [area] and track record of [achievement], I believe I can [specific contribution]. My [skill] would help the team achieve [benefit]."

❓ 5. PREPARE QUESTIONS TO ASK

About the role:
• What does a typical day look like? 📅
• What are the biggest challenges?
• How is success measured? 📊

About the team:
• Who would I work with? 👥
• How would you describe team culture?
• How does the team collaborate?

About the company:
• What are the company's goals for next year? 🎯
• How does this role contribute?
• What growth opportunities exist? 📈

✨ DURING THE INTERVIEW

👔 1. FIRST IMPRESSIONS
• Arrive 10-15 minutes early ⏰
• Dress professionally
• Firm handshake
• Smile and make eye contact 😊
• Bring extra resumes and notebook

💬 2. COMMUNICATION TIPS
• Listen carefully 👂
• Pause before answering
• Use STAR method
• Be concise (2-3 minutes per answer)
• Show enthusiasm
• Use professional language

🧍 3. BODY LANGUAGE
• Sit up straight
• Maintain eye contact
• Don't cross arms
• Nod to show understanding
• Don't fidget

🎯 4. HANDLING DIFFICULT QUESTIONS

"Tell me about a weakness":
• Be honest but strategic
• Show improvement efforts
• Don't mention critical job requirements

"Why did you leave your last job":
• Stay positive
• Focus on growth opportunity
• Don't badmouth previous employer

"Tell me about a failure":
• Own the mistake
• Explain what you learned
• Show how you improved

🙏 AFTER THE INTERVIEW

📧 1. SEND THANK YOU EMAIL (within 24 hours)

Subject: Thank You - [Position] Interview

Dear [Interviewer Name],

Thank you so much for taking the time to meet with me today! 🙏 I truly enjoyed learning more about [company] and the [position] role.

Our conversation reinforced my excitement about this opportunity, especially [specific thing discussed]. I'm confident that my experience in [skill] would allow me to contribute to [company goal].

Please let me know if you need any additional information. I look forward to hearing from you!

Best regards,
[Your Name]
📞 [Phone]

⏰ 2. FOLLOW UP APPROPRIATELY
• Wait 1 week before following up
• Be polite and professional
• Reiterate your interest

🎥 COMMON INTERVIEW TYPES

📞 Phone Interview:
• Have resume and notes ready
• Find quiet location
• Smile (it affects your voice) 😊
• Take notes during call

💻 Video Interview:
• Test technology beforehand
• Professional background
• Good lighting 💡
• Look at camera, not screen
• Mute when not speaking

👥 Panel Interview:
• Address everyone
• Make eye contact with each person
• Direct answer to who asked
• Get business cards for thank yous

📊 Behavioral Interview:
• Focus on STAR stories
• Give specific examples
• Quantify results

❓ QUESTIONS TO ASK THE INTERVIEWER

Near the end, ask:
• "Is there anything about my background that makes you doubt I'm a good fit?" 🤔
• "What are the next steps in the process?"
• "When can I expect to hear back?" 📅

Would you like practice with any specific questions or interview type? I'm here to help! 😊`,

    // Study Techniques
    'study': `📚 EFFECTIVE STUDY TECHNIQUES GUIDE

Let's make your study time more productive! 🚀

🧠 SCIENTIFICALLY PROVEN STUDY METHODS

1. ACTIVE RECALL 🔄
• Test yourself instead of just reading
• Use flashcards (physical or apps like Anki) 🃏
• Close book and summarize
• Practice problems without looking at solutions

Why it works: Forces brain to retrieve information, strengthening neural pathways! 💪

2. SPACED REPETITION ⏰
• Review material at increasing intervals
• Day 1, Day 3, Day 7, Day 30
• Use apps like Anki or Quizlet
• Review before forgetting completely

Why it works: Moves information from short-term to long-term memory! 🧠

3. POMODORO TECHNIQUE 🍅
• 25 minutes focused study
• 5 minute break
• Repeat 4 times
• Take longer 15-30 minute break

Benefits:
• Prevents burnout
• Maintains focus 🎯
• Makes large tasks manageable
• Tracks study time

4. FEYNMAN TECHNIQUE 👨‍🏫
• Choose concept
• Teach it to a child (simple terms)
• Identify gaps in understanding
• Review and simplify

Perfect for: Understanding complex concepts deeply! ✨

5. SQ3R METHOD (for textbooks) 📖
• Survey - Skim headings, summaries
• Question - Turn headings into questions
• Read - Read actively to find answers
• Recite - Summarize in your own words
• Review - Review notes regularly

6. MIND MAPPING 🗺️
• Start with central concept
• Branch out with related ideas
• Use colors and images 🎨
• Make connections visible

Best for: Brainstorming and connecting ideas!

7. BLURTING METHOD 📝
• Read a section
• Close the book
• Write everything you remember
• Check what you missed
• Repeat until complete

🏠 STUDY ENVIRONMENT OPTIMIZATION

📍 1. LOCATION
• Consistent study spot
• Good lighting 💡
• Comfortable temperature
• Minimal distractions
• Organized workspace

📱 2. DIGITAL DISTRACTIONS
• Use website blockers (Freedom, Cold Turkey)
• Phone on silent, in another room 🔕
• Use focus mode on devices
• Close unnecessary tabs

🎵 3. BACKGROUND NOISE
• Silence for deep work
• Lo-fi or classical music 🎼
• White noise apps
• Coffee shop ambiance

📝 NOTE-TAKING METHODS

Cornell Method:
• Divide page into: Cue column, Notes column, Summary
• Review by covering notes and using cues

Outline Method:
• Main topics (I, II, III)
• Subtopics (A, B, C)
• Details (1, 2, 3)

Mapping Method:
• Visual representation
• Show relationships
• Great for visual learners

Charting Method:
• Create columns for categories
• Fill in rows with information
• Best for comparing information

📅 STUDY SCHEDULE TEMPLATE

Weekday Schedule (3 hours):
• 7:00 PM - Review previous material (30 min)
• 7:30 PM - New material study (60 min)
• 8:30 PM - Break (10 min) ☕
• 8:40 PM - Active recall practice (40 min)
• 9:20 PM - Practice problems (30 min)
• 9:50 PM - Review and plan tomorrow (10 min)

Weekend Schedule (6 hours):
• Morning session (3 hours) 🌅
• Break (1 hour) 🍽️
• Afternoon session (2 hours)
• Evening review (1 hour) 🌙

💡 MEMORY TECHNIQUES

1. Mnemonics
• Create acronyms (PEMDAS for math order)
• Make phrases ("My Very Educated Mother Just Served Us Nine Pizzas" for planets) 🌍

2. Memory Palace
• Visualize familiar place
• Place information along route
• Walk through to recall 🚶

3. Chunking
• Group related information
• Phone numbers: 555-123-4567 not 5551234567
• Connect new to known

4. Story Method
• Create narrative connecting facts
• More memorable than lists 📖

📋 BEFORE THE EXAM

1 Week Before:
• Review all material
• Take practice tests 📝
• Identify weak areas
• Group study sessions 👥

1 Day Before:
• Light review only
• Organize materials
• Prepare what to bring
• Get good sleep 😴

Exam Day:
• Eat healthy breakfast 🍳
• Arrive early ⏰
• Read questions carefully
• Start with easy questions
• Manage time
• Review answers

⚠️ COMMON STUDY MISTAKES

❌ Passive reading (just highlighting)
❌ Cramming the night before
❌ Multitasking while studying
❌ Not taking breaks
❌ Ignoring difficult topics
❌ No practice testing
❌ Studying in same way always

📱 RECOMMENDED APPS/TOOLS

• Anki/Quizlet - Flashcards 🃏
• Forest/Freedom - Focus apps 🌳
• Notion/OneNote - Note taking 📝
• Khan Academy/Coursera - Learning 🎓
• MyStudyLife - Schedule planner 📅
• Grammarly - Writing assistance ✨

What specific subject or technique would you like help with? I'm here to support your learning journey! 😊`,

    // Scholarship Guide
    'scholarship': `💰 COMPLETE SCHOLARSHIP GUIDE

Let's find and win scholarships for your education! 🎓

🎯 TYPES OF SCHOLARSHIPS

1. Merit-Based 🏆
• Based on academic achievement
• GPA requirements
• Test scores
• Extracurricular involvement

2. Need-Based 💵
• Based on financial need
• FAFSA required (for US)
• Family income considered

3. Athletic Scholarships ⚽
• For student-athletes
• Specific sport requirements
• Recruitment process

4. Demographic-Based 👥
• For specific groups
• Ethnicity, gender, background
• First-generation students

5. Field of Study 🔬
• For specific majors
• STEM, Arts, Business, etc.
• Professional organizations

6. International Student Scholarships 🌍
• For studying abroad
• Country-specific
• University-specific

🔍 WHERE TO FIND SCHOLARSHIPS

Online Databases:
• Fastweb.com 💻
• Scholarships.com
• Cappex.com
• Chegg.com/scholarships
• Unigo.com
• GoingMerry.com

Government Sources:
• FAFSA (US federal aid) 🇺🇸
• State grants
• StudyAbroad.gov
• Fulbright Program
• DAAD (Germany) 🇩🇪
• Chevening (UK) 🇬🇧
• Eiffel (France) 🇫🇷

University Sources:
• Financial aid office 🏛️
• Department scholarships
• International student office
• Alumni associations
• Application fee waivers

Private Organizations:
• Companies (Coca-Cola, Dell, Google) 💼
• Nonprofits
• Professional associations
• Religious organizations
• Community foundations

Local Sources:
• Local businesses 🏪
• Community organizations
• Rotary Club, Lions Club
• Parents' employers
• High school counselors

📝 SCHOLARSHIP APPLICATION COMPONENTS

👤 1. PERSONAL INFORMATION
• Basic contact details
• Academic history
• Extracurricular activities

📝 2. ESSAYS/STATEMENTS

Common Essay Topics:
• Your background and goals
• Why you deserve the scholarship
• Challenges you've overcome 💪
• Leadership experiences
• Community involvement

Essay Tips:
• Tell a compelling story
• Be authentic
• Show, don't tell
• Connect to scholarship mission
• Proofread carefully ✅
• Get feedback

📨 3. LETTERS OF RECOMMENDATION

Who to Ask:
• Teachers (core subjects) 👨‍🏫
• Counselors
• Employers
• Mentors
• Coaches

How to Ask:
• Ask 3-4 weeks before deadline ⏰
• Provide resume and essay
• Give clear instructions
• Share scholarship details
• Send reminder 1 week before
• Send thank you note 🙏

📊 4. TRANSCRIPTS
• Official transcripts required
• Request early (processing time)
• Check GPA requirements
• Explain any grade issues

📄 5. RESUME/ACTIVITIES
• List all activities
• Leadership positions
• Volunteer work
• Work experience
• Awards and honors 🏆
• Include hours per week

💰 6. FINANCIAL INFORMATION
• Tax returns
• Income statements
• FAFSA results (for US)
• Bank statements

📝 SCHOLARSHIP ESSAY TEMPLATES

Template 1: Personal Background

"Growing up in [place/context], I learned [value/lesson]. This experience shaped my goal to [career goal]. Through [activity/achievement], I developed [skill] that will help me succeed in [field].

At [school], I plan to [specific goal]. This scholarship would enable me to focus on my studies and contribute to [community/field]. After graduation, I hope to [future impact]."

Template 2: Overcoming Challenges

"When I faced [challenge], I learned [lesson]. Rather than giving up, I [action taken]. This experience taught me [skill/quality] that I now apply to [current activity].

This scholarship would allow me to continue pursuing my passion for [field] and eventually help others facing similar challenges by [future plan]."

Template 3: Leadership/Service

"My experience as [leadership role] taught me the importance of [lesson]. When I [specific example of leadership], I [action and result]. This confirmed my commitment to [value/field].

With this scholarship, I will continue developing as a leader in [area] and use my education to [future contribution]."

📅 APPLICATION TIMELINE

Junior Year:
• September: Start research
• October: Create scholarship list 📋
• November: Request recommendation letters
• December: Draft essays
• January-March: Apply for early deadlines
• April-June: Continue applications

Senior Year:
• August-October: FAFSA opens (Oct 1)
• September-December: Fall deadlines
• January-March: Spring deadlines
• April: Compare offers
• May: Accept scholarship 🎉

🤝 SCHOLARSHIP INTERVIEW TIPS

Common Questions:
• Tell us about yourself
• Why do you deserve this?
• What are your goals? 🎯
• How will you give back?
• Tell us about a challenge

Preparation:
• Research organization
• Practice common questions
• Prepare questions to ask
• Bring extra copies
• Dress professionally 👔
• Arrive early

📊 SCHOLARSHIP TRACKING SYSTEM

Create spreadsheet with:
• Scholarship name
• Deadline 📅
• Amount 💰
• Requirements
• Status (not started, drafting, submitted)
• Link to application
• Notes

⚠️ RED FLAGS TO AVOID

❌ Scholarships that charge application fees
❌ Guaranteed win promises
❌ Requests for bank account info
❌ No contact information
❌ Poor grammar/spelling

💡 TIPS FOR SUCCESS

• Start early (9-12 months before college) ⏰
• Apply for EVERY scholarship you qualify for
• Don't ignore small amounts (they add up) ➕
• Reuse and adapt essays
• Meet ALL deadlines
• Follow instructions exactly
• Proofread everything ✅
• Apply even if requirements seem strict
• Keep copies of all applications
• Send thank you notes 🙏

Would you like help with a specific scholarship application or essay? I'm here to guide you! 😊`,

    // Platform Information
    'platform_info': `🤖 About EduCoreX AI Assistant

Hello! I'm your dedicated AI Study Assistant for the EduCoreX platform. Let me tell you about myself and why I'm here! ✨

🎯 My Purpose:
I'm designed to be your 24/7 academic companion, providing instant support for:
• Statement of Purpose (SOP) writing 📝
• Professional messages and emails 💼
• Research guidance and paper structure 🔬
• Career development advice 🎯
• IELTS preparation tips 🌐
• Resume and CV building 📄
• Interview preparation 🤝
• Study techniques and methods 📚
• Scholarship guidance 💰

💡 Why I'm Meaningful for EduCoreX:

1. 24/7 Availability ⏰
   - I'm always here, ready to help whenever you need academic support
   - No waiting for office hours or appointments

2. Instant Guidance ⚡
   - Get immediate answers to common academic questions
   - Quick access to templates and guidelines
   - No more searching through multiple resources

3. Personalized Support 👤
   - Tailored advice based on your specific needs
   - Adaptable to different academic levels and goals

4. Comprehensive Resource 📚
   - All academic writing help in one place
   - From SOPs to scholarship essays
   - Professional communication templates

5. Learning Companion 🌟
   - Helps you understand complex topics
   - Guides you through academic processes
   - Builds your confidence in academic writing

6. Time-Saving ⏱️
   - Instant templates and structures
   - Quick tips and guidelines
   - Efficient problem-solving

7. Career Support 🚀
   - Resume and interview guidance
   - Professional message templates
   - Career path advice

What Makes Me Unique:

• 🎓 Academic Focus: Specialized in educational and professional content
• 🌍 Global Perspective: Helps with international applications (SOPs, IELTS)
• 📊 Structured Guidance: Provides organized, step-by-step assistance
• 🔄 Always Learning: Continuously updated with new information
• 💬 Interactive: Engages with you through questions and personalized help

How I Can Help You Today:

I can assist you with:
✓ Writing your Statement of Purpose
✓ Crafting professional emails
✓ Structuring research papers
✓ Preparing for interviews
✓ Building your resume
✓ IELTS preparation
✓ Study techniques
✓ Scholarship applications

Just ask me about any of these topics, and I'll provide detailed guidance! 😊

What would you like help with today?`,

    // About Me
    'about_me': `🤖 Hi there! I'm your EduCoreX AI Study Assistant!

I'm here to make your academic journey easier and more successful. Here's what you should know about me:

🌟 My Role:
I'm your 24/7 companion for all things academic - from writing SOPs to preparing for interviews!

📚 What I Can Help With:
• 📝 Statement of Purpose (SOP) writing
• 💼 Professional messages and emails
• 🔬 Research papers and theses
• 🎯 Career guidance
• 🌐 IELTS preparation
• 📄 Resume building
• 🤝 Interview tips
• 📚 Study techniques
• 💰 Scholarships

✨ Why I'm Here:
I was created to ensure every EduCoreX user has instant access to academic guidance, anytime, anywhere. No more waiting - just immediate, helpful responses!

💡 Fun Fact:
I'm designed to understand your specific needs and provide personalized guidance. Whether you're applying to Harvard or preparing for your first job interview, I've got your back!

What brings you to EduCoreX today? I'm here to help! 😊`
};

// Get template response with keyword matching
function getTemplateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Platform information questions
    if (lowerMessage.includes('educorex') || 
        lowerMessage.includes('about yourself') || 
        lowerMessage.includes('who are you') || 
        lowerMessage.includes('what can you do') ||
        lowerMessage.includes('tell me about you') ||
        lowerMessage.includes('your purpose') ||
        lowerMessage.includes('why are you here') ||
        lowerMessage.includes('meaningful') ||
        lowerMessage.includes('what do you do')) {
        
        if (lowerMessage.includes('educorex') || lowerMessage.includes('project')) {
            return templateResponses.platform_info;
        } else {
            return templateResponses.about_me;
        }
    }
    
    // SOP templates
    if (lowerMessage.includes('sop') || lowerMessage.includes('statement of purpose') || lowerMessage.includes('personal statement')) {
        if (lowerMessage.includes('guideline') || lowerMessage.includes('guide') || lowerMessage.includes('how to') || lowerMessage.includes('help')) {
            return templateResponses.sop;
        }
    }
    
    // GM/Professional messages
    if (lowerMessage.includes('good morning') || lowerMessage.includes('gm') || lowerMessage.includes('professional message') || lowerMessage.includes('email')) {
        return templateResponses.gm;
    }
    
    // Research templates
    if (lowerMessage.includes('research') || lowerMessage.includes('paper') || lowerMessage.includes('thesis') || lowerMessage.includes('dissertation') || lowerMessage.includes('publication')) {
        if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('structure') || lowerMessage.includes('guide') || lowerMessage.includes('how to')) {
            return templateResponses.research;
        }
    }
    
    // Career templates
    if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('professional') || lowerMessage.includes('work')) {
        if (lowerMessage.includes('advice') || lowerMessage.includes('guidance') || lowerMessage.includes('help') || lowerMessage.includes('tip')) {
            return templateResponses.career;
        }
    }
    
    // IELTS templates
    if (lowerMessage.includes('ielts') || lowerMessage.includes('english test') || lowerMessage.includes('band score') || lowerMessage.includes('language test')) {
        if (lowerMessage.includes('prepare') || lowerMessage.includes('preparation') || lowerMessage.includes('study') || lowerMessage.includes('tips') || lowerMessage.includes('guide')) {
            return templateResponses.ielts;
        }
        if (lowerMessage.includes('listening')) {
            return "👂 IELTS Listening Tips:\n\n• Practice with various accents (British, Australian, American) 🌍\n• Read questions before each section 👀\n• Listen for keywords and signposts\n• Watch for plurals and word limits\n• Resources: BBC 6 Minute English, TED Talks 🎧\n\nWould you like specific practice strategies?";
        }
        if (lowerMessage.includes('reading')) {
            return "📖 IELTS Reading Tips:\n\n• Skim first, then scan for answers\n• 20 minutes per passage maximum ⏰\n• Read questions before passage\n• Practice with academic journals\n• Resources: Cambridge IELTS series 📚\n\nNeed help with any specific question type?";
        }
        if (lowerMessage.includes('writing')) {
            return "✍️ IELTS Writing Tips:\n\nTask 1: Describe graphs/charts (Academic) or write letters (General)\nTask 2: Opinion/Discussion Essay\n\nKey elements:\n• Clear structure\n• Task achievement\n• Coherence and cohesion\n• Lexical resource\n• Grammatical range 📊\n\nWant me to explain any task in detail?";
        }
        if (lowerMessage.includes('speaking')) {
            return "🗣️ IELTS Speaking Tips:\n\nPart 1 (4-5 min): Introduction & general questions\nPart 2 (3-4 min): Cue card topic\nPart 3 (4-5 min): Abstract discussion\n\nTips:\n• Speak naturally, not memorized\n• Use varied vocabulary\n• Give detailed answers with examples\n• Practice with timer ⏲️\n\nWould you like sample topics?";
        }
        return templateResponses.ielts;
    }
    
    // Resume templates
    if (lowerMessage.includes('resume') || lowerMessage.includes('cv') || lowerMessage.includes('curriculum vitae')) {
        if (lowerMessage.includes('write') || lowerMessage.includes('create') || lowerMessage.includes('make') || lowerMessage.includes('help')) {
            return templateResponses.resume;
        }
    }
    
    // Interview templates
    if (lowerMessage.includes('interview') || lowerMessage.includes('job interview')) {
        if (lowerMessage.includes('prepare') || lowerMessage.includes('preparation') || lowerMessage.includes('tip') || lowerMessage.includes('guide')) {
            return templateResponses.interview;
        }
    }
    
    // Study techniques
    if (lowerMessage.includes('study') || lowerMessage.includes('learn') || lowerMessage.includes('exam') || lowerMessage.includes('test')) {
        if (lowerMessage.includes('technique') || lowerMessage.includes('method') || lowerMessage.includes('how to') || lowerMessage.includes('tip')) {
            return templateResponses.study;
        }
    }
    
    // Scholarship templates
    if (lowerMessage.includes('scholarship') || lowerMessage.includes('financial aid') || lowerMessage.includes('funding') || lowerMessage.includes('grant')) {
        if (lowerMessage.includes('find') || lowerMessage.includes('apply') || lowerMessage.includes('help') || lowerMessage.includes('guide')) {
            return templateResponses.scholarship;
        }
    }
    
    return null;
}

// Fallback responses when API is slow
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Platform questions fallback
    if (lowerMessage.includes('educorex') || lowerMessage.includes('about you') || lowerMessage.includes('who are you')) {
        return "🤖 I'm your EduCoreX AI Study Assistant! I'm here to help with SOPs, professional messages, research, career advice, IELTS, resumes, interviews, study techniques, and scholarships. What would you like help with today? 😊";
    }
    
    if (lowerMessage.includes('ielts')) {
        return "🌐 I'm preparing detailed IELTS guidance for you! While you wait, here's a quick tip:\n\nFocus on all four sections equally. The Listening and Reading sections require regular practice, while Writing and Speaking need structured preparation. 📚\n\nWould you like specific tips for any particular section?";
    }
    
    if (lowerMessage.includes('sop') || lowerMessage.includes('statement')) {
        return "📝 I'm working on your SOP request! Quick tip: A strong SOP should include your motivation, academic background, relevant experience, and future goals. ✨\n\nWould you like me to elaborate on any specific section?";
    }
    
    if (lowerMessage.includes('research') || lowerMessage.includes('paper')) {
        return "🔬 I'm generating your research guidance! Quick tip: Start with a clear research question, review existing literature, and choose appropriate methodology. 📊\n\nNeed help with any particular aspect?";
    }
    
    if (lowerMessage.includes('career')) {
        return "🎯 I'm preparing career advice for you! Remember that career development involves self-assessment, skill building, networking, and continuous learning. 🚀\n\nWhat area interests you most?";
    }
    
    if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
        return "📄 I'm working on your resume help! Quick tip: Use action verbs and quantify achievements with numbers. Keep it to 1-2 pages and tailor it for each job. ✨\n\nNeed help with a specific section?";
    }
    
    if (lowerMessage.includes('interview')) {
        return "🤝 I'm preparing interview tips for you! Key advice: Research the company, practice STAR method stories, and prepare questions to ask. 💪\n\nWould you like to practice specific questions?";
    }
    
    if (lowerMessage.includes('study')) {
        return "📚 I'm gathering study techniques! Remember: Active recall, spaced repetition, and the Pomodoro technique are scientifically proven methods. ⏰\n\nWhat subject are you studying?";
    }
    
    if (lowerMessage.includes('scholarship')) {
        return "💰 I'm working on scholarship guidance! Start early, apply for every scholarship you qualify for, and don't ignore small amounts - they add up! ✨\n\nNeed help with essays or finding scholarships?";
    }
    
    return "🤖 I'm processing your question! For faster responses, you can use the quick action buttons above for:\n\n📝 SOP\n💼 Professional messages\n🔬 Research\n🎯 Career\n🌐 IELTS\n📄 Resume\n🤝 Interview\n📚 Study tips\n💰 Scholarships\n\nWhat would you like help with?";
}

// Check if message is within system scope
function isWithinSystemScope(message) {
    const lowerMessage = message.toLowerCase();
    const scopeKeywords = [
        'sop', 'statement of purpose', 'personal statement',
        'good morning', 'good evening', 'professional message',
        'email', 'gm', 'good afternoon',
        'research', 'paper', 'thesis', 'dissertation',
        'career', 'job', 'interview', 'resume', 'cv',
        'study', 'academic', 'university', 'college',
        'application', 'admission', 'scholarship',
        'writing', 'essay', 'guideline', 'template',
        'professor', 'lecturer', 'teacher',
        'professional', 'formal', 'business',
        'homework', 'assignment', 'project',
        'internship', 'placement', 'training',
        'course', 'subject', 'class', 'lecture',
        'degree', 'program', 'major', 'minor',
        'grade', 'gpa', 'score', 'result',
        'library', 'resource', 'material',
        'alumni', 'network', 'connection',
        'forum', 'discussion', 'community',
        'opportunity', 'scholarship', 'fellowship',
        'guidance', 'advice', 'help', 'support',
        'ielts', 'toefl', 'pte', 'gre', 'gmat', 'sat', 'act',
        'english test', 'language test', 'proficiency test',
        'exam preparation', 'test preparation', 'study abroad test',
        'band score', 'ielts score', 'reading', 'writing', 'listening', 'speaking',
        'educorex', 'about yourself', 'who are you', 'what can you do'
    ];
    
    return scopeKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Send message function with instant template responses
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Disable input and button while sending
    messageInput.disabled = true;
    sendBtn.disabled = true;

    // Add user message to chat
    addMessage(message, 'user');

    // Clear input
    messageInput.value = '';

    // Check if message is within system scope
    if (!isWithinSystemScope(message)) {
        addMessage(OFF_TOPIC_RESPONSE, 'ai');
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
        return;
    }

    // Check for template responses (instant)
    const templateResponse = getTemplateResponse(message);
    if (templateResponse) {
        addMessage(templateResponse, 'ai');
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
        
        // Save to history in background
        saveToHistory(message, templateResponse);
        return;
    }

    // Check cache for similar questions
    const cachedResponse = getCachedResponse(message);
    if (cachedResponse) {
        addMessage(cachedResponse, 'ai');
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
        return;
    }

    // Show typing indicator for backend queries
    showTypingIndicator();

    try {
        // Send to backend with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const formData = new FormData();
        formData.append('message', message);

        const response = await fetch('/api/chat/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
            },
            body: formData,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        // Remove typing indicator
        removeTypingIndicator();

        if (data.status === 'success') {
            // Cache the response
            cacheResponse(message, data.response);
            
            // Add AI response
            addMessage(data.response, 'ai');
            
            // Refresh history in background
            setTimeout(() => refreshHistory(), 100);
        } else {
            // Show error with fallback
            addMessage(getFallbackResponse(message), 'ai');
        }
    } catch (error) {
        removeTypingIndicator();
        
        if (error.name === 'AbortError') {
            addMessage(getFallbackResponse(message), 'ai');
        } else {
            addMessage('🌐 Network error. Please check your connection and try again.', 'ai');
        }
    } finally {
        // Re-enable input and button
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

// Cache management
function cacheResponse(query, response) {
    const key = query.toLowerCase().split(' ').slice(0, 5).join(' ');
    
    if (responseCache.size >= CACHE_SIZE) {
        const firstKey = responseCache.keys().next().value;
        responseCache.delete(firstKey);
    }
    
    responseCache.set(key, {
        response: response,
        timestamp: Date.now()
    });
}

function getCachedResponse(query) {
    const key = query.toLowerCase().split(' ').slice(0, 5).join(' ');
    const cached = responseCache.get(key);
    
    if (cached && (Date.now() - cached.timestamp) < 3600000) { // Cache for 1 hour
        return cached.response;
    }
    
    return null;
}

// Save to history in background
async function saveToHistory(query, response) {
    try {
        const formData = new FormData();
        formData.append('message', query);
        formData.append('response', response);
        
        await fetch('/api/chat/save/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken,
            },
            body: formData
        });
    } catch (error) {
        console.error('Error saving to history:', error);
    }
}

// Add message to chat with smooth animation
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender} smooth-text`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    if (sender === 'user') {
        avatar.innerHTML = `<div class="avatar-user">${getUserInitial()}</div>`;
    } else {
        avatar.innerHTML = `<div class="avatar-ai">AI</div>`;
    }

    const content = document.createElement('div');
    content.className = 'message-content';
    
    const paragraph = document.createElement('p');
    
    // Format text (remove any remaining markdown)
    const formattedText = formatResponse(text);
    paragraph.textContent = formattedText;
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    content.appendChild(paragraph);
    content.appendChild(time);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    // Remove welcome message if it exists
    const welcomeMsg = document.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Get user initial from the page
function getUserInitial() {
    const placeholder = document.querySelector('.avatar-placeholder');
    return placeholder ? placeholder.textContent : 'U';
}

// Format response to remove any markdown
function formatResponse(text) {
    // Remove any remaining markdown symbols
    text = text.replace(/\*\*/g, '');
    text = text.replace(/\*/g, '');
    text = text.replace(/#{1,6}\s+/g, '');
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '$1'); // Remove markdown links
    
    return text;
}

// Show typing indicator
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message ai';
    indicator.id = 'typingIndicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<div class="avatar-ai">AI</div>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    indicator.appendChild(avatar);
    indicator.appendChild(content);
    
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Handle Enter key
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Quick action handler
function quickAction(action) {
    if (quickActions[action]) {
        messageInput.value = quickActions[action];
        sendMessage();
    }
}

// New chat
function startNewChat() {
    const userName = document.querySelector('.user-name')?.textContent || 'User';
    
    messagesContainer.innerHTML = `
        <div class="welcome-message">
            <i class="fas fa-robot" style="font-size: 4rem; color: #00BFA6; margin-bottom: 20px;"></i>
            <h2 style="color: #FFFFFF; margin-bottom: 10px;">Hello, ${userName}! 👋</h2>
            <p style="max-width: 500px; margin: 0 auto; color: #B8B8B8;">I'm your AI Study Assistant. I only answer questions related to this platform. Ask me about:</p>
            <div class="quick-actions" style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px; justify-content: center; max-width: 600px; margin-left: auto; margin-right: auto;">
                <button class="quick-action-btn" onclick="quickAction('sop')" style="background: rgba(0, 191, 166, 0.1); border: 1px solid rgba(0, 191, 166, 0.3); color: #00BFA6; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; cursor: pointer;">
                    📝 SOP Guidelines
                </button>
                <button class="quick-action-btn" onclick="quickAction('gm')" style="background: rgba(0, 191, 166, 0.1); border: 1px solid rgba(0, 191, 166, 0.3); color: #00BFA6; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; cursor: pointer;">
                    💼 Professional GM
                </button>
                <button class="quick-action-btn" onclick="quickAction('research')" style="background: rgba(0, 191, 166, 0.1); border: 1px solid rgba(0, 191, 166, 0.3); color: #00BFA6; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; cursor: pointer;">
                    🔬 Research Help
                </button>
                <button class="quick-action-btn" onclick="quickAction('career')" style="background: rgba(0, 191, 166, 0.1); border: 1px solid rgba(0, 191, 166, 0.3); color: #00BFA6; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; cursor: pointer;">
                    🎯 Career Advice
                </button>
                <button class="quick-action-btn" onclick="quickAction('ielts')" style="background: rgba(0, 191, 166, 0.1); border: 1px solid rgba(0, 191, 166, 0.3); color: #00BFA6; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; cursor: pointer;">
                    🌐 IELTS Prep
                </button>
                <button class="quick-action-btn" onclick="quickAction('resume')" style="background: rgba(0, 191, 166, 0.1); border: 1px solid rgba(0, 191, 166, 0.3); color: #00BFA6; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; cursor: pointer;">
                    📄 Resume Help
                </button>
                <button class="quick-action-btn" onclick="quickAction('interview')" style="background: rgba(0, 191, 166, 0.1); border: 1px solid rgba(0, 191, 166, 0.3); color: #00BFA6; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; cursor: pointer;">
                    🤝 Interview Tips
                </button>
                <button class="quick-action-btn" onclick="quickAction('study')" style="background: rgba(0, 191, 166, 0.1); border: 1px solid rgba(0, 191, 166, 0.3); color: #00BFA6; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; cursor: pointer;">
                    📚 Study Techniques
                </button>
                <button class="quick-action-btn" onclick="quickAction('scholarship')" style="background: rgba(0, 191, 166, 0.1); border: 1px solid rgba(0, 191, 166, 0.3); color: #00BFA6; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; cursor: pointer;">
                    💰 Scholarships
                </button>
            </div>
            <p style="max-width: 500px; margin: 20px auto 0; color: #B8B8B8; font-size: 0.9rem;">How can I help you with your academic journey today? 😊</p>
        </div>
    `;
}

// Load specific chat
async function loadChat(chatId) {
    try {
        showTypingIndicator();
        
        const response = await fetch(`/api/chat/${chatId}/`);
        const data = await response.json();
        
        removeTypingIndicator();
        
        if (data.status === 'success') {
            messagesContainer.innerHTML = '';
            data.messages.forEach(msg => {
                addMessage(msg.content, msg.sender);
            });
        }
    } catch (error) {
        removeTypingIndicator();
        console.error('Error loading chat:', error);
    }
}

// Refresh history
async function refreshHistory() {
    try {
        const response = await fetch('/api/chat/history/');
        const data = await response.json();
        
        const historyList = document.getElementById('historyList');
        if (data.history && data.history.length > 0) {
            historyList.innerHTML = data.history.map(chat => `
                <div class="history-item" onclick="loadChat(${chat.id})">
                    <div class="history-item-title">${chat.query.substring(0, 30)}${chat.query.length > 30 ? '...' : ''}</div>
                    <div class="history-item-meta">
                        <span><i class="far fa-clock"></i> ${chat.time_ago}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error refreshing history:', error);
    }
}

// Attach file
function attachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            addMessage(`📎 Uploaded: ${file.name}`, 'user');
            
            const formData = new FormData();
            formData.append('file', file);
            
            showTypingIndicator();
            
            try {
                const response = await fetch('/api/upload/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrftoken,
                    },
                    body: formData
                });
                
                const data = await response.json();
                removeTypingIndicator();
                
                if (data.status === 'success') {
                    addMessage(data.response, 'ai');
                } else {
                    addMessage('❌ File upload failed. Please try again.', 'ai');
                }
            } catch (error) {
                removeTypingIndicator();
                addMessage('❌ Error uploading file. Please try again.', 'ai');
            }
        }
    };
    input.click();
}

// Focus input on load
document.addEventListener('DOMContentLoaded', function() {
    messageInput.focus();
});

// Make functions globally available
window.sendMessage = sendMessage;
window.handleKeyPress = handleKeyPress;
window.quickAction = quickAction;
window.startNewChat = startNewChat;
window.loadChat = loadChat;
window.attachFile = attachFile;