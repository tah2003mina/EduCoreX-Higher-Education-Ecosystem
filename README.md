# EduCoreX – Higher Education Ecosystem

EduCoreX is a university capstone project designed to create a connected platform for higher education.

The main idea is to connect **students, alumni, mentors, academic resources, higher-study opportunities, and career preparation** in one platform.

Instead of focusing only on classroom learning, EduCoreX focuses on the things students often need **outside the classroom** — finding guidance, connecting with seniors and alumni, discovering scholarships and university opportunities, and preparing for their future.

---

## What Problem Are We Solving?

University students often have to use different platforms to find information about:

- Higher studies
- Scholarships
- Universities
- Alumni and mentors
- Academic resources
- Career preparation
- Events and opportunities

The information may be available, but it is often scattered across different websites and social platforms.

EduCoreX tries to bring these resources and connections together in one place.

---

## Main Features

### Student Dashboard

Students can access important parts of the platform from their dashboard, including resources, opportunities, alumni, mentors, forums, and their profile.

### Alumni Network

Students can explore alumni profiles and learn from people who have already completed their university journey.

Alumni can share their experiences and provide guidance to students.

### Mentorship

The platform provides a way for students to connect with mentors based on their interests and needs.

Mentors can share their knowledge and experience with students.

### Opportunity Hub

Students can explore different opportunities such as:

- Scholarships
- Higher-study opportunities
- Universities
- Events
- Other academic and professional opportunities

### Resource Portal

Students can find useful academic resources such as notes, videos, and other learning materials.

### Forum

Students can ask questions, share knowledge, and discuss different academic topics with other users.

### AI Assistant

EduCoreX also includes a working AI chatbot using a **local Ollama model**.

The current chatbot is designed to answer selected questions related to the EduCoreX platform and help users understand different parts of the website.

It is currently a prototype, and we plan to improve its capabilities in the future.

---

## Technology Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Python
- Django
- Django REST Framework

### Database
- MySQL
- MySQL Workbench

### AI
- Ollama
- Local AI model

### Development Tools
- Git
- GitHub
- VS Code / Cursor

---

## Simple System Overview

```text
             Students
                 |
                 |
        +--------v---------+
        |     EduCoreX     |
        +--------+---------+
                 |
      +----------+----------+
      |          |          |
      v          v          v
   Alumni     Mentors    Opportunities
      |          |          |
      +----------+----------+
                 |
                 v
          Higher Study
          & Career Support

                 +
                 |
            AI Assistant
              (Ollama)
