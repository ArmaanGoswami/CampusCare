# Role and Goal
You are an expert academic writer and computer science researcher. I need you to help me write a formal, IEEE-format research paper about my project, "Smart Resolve: A Comprehensive Campus Complaint Management System".

# Project Overview
"Smart Resolve" is a cross-platform (Web & Mobile Android) application designed to efficiently handle, track, and resolve various issues across a college campus or organization. It connects students and staff with administrators who manage and assign maintenance, IT, and general campus task tickets.

# Key Features and Technical Stack
- **Frontend Architecture:** Single Page Application structured with **React** and **Vite**. Packaged as a native Android application using **Capacitor**.
- **Backend Architecture:** RESTful API built with **Python**, **Flask**, and Flask-CORS. 
- **Database System:** Utilizes **TiDB** (a cloud-native MySQL-compatible database) for standard production workloads, with an automatic fallback mechanism to a local **SQLite** database to ensure zero downtime and offline resilience.
- **AI/ML Integration:** Leverages the **HuggingFace Serverless Inference API** (using the `facebook/bart-large-mnli` model) for intelligent text parsing. This allows the system to conduct automated zero-shot classification to categorize, label, and properly route complaints based solely on user-provided natural language descriptions.
- **Third-Party Automations:** 
  - **Google Sheets Sync:** Automatically mirrors submitted complaints into a designated Google Sheet for administrative backup, accessibility, and offline reporting.
  - **Firebase Cloud Messaging (FCM):** Delivers real-time mobile push notifications to alert administrators instantaneously when a new system issue is submitted.
- **Role-Based Workflows:** Distinct interfaces for Standard Users (who submit and track issues in a "My Reports" view) and Administrators (who possess a "Manage" and "Analytics" view to survey workloads and close tickets).

# Paper Requirements
Please write the research paper draft meticulously organizing the following sections:
1. **Abstract:** Outline the problem of manual or fragmented campus complaint workflows, the proposed digital solution (Smart Resolve), and the measurable impact of combining AI-driven categorization with cross-platform resilience.
2. **Introduction:** Detail the background, motivation, and objectives behind creating a unified resolution system. Outline the structure of the paper.
3. **Literature Review:** Discuss existing ticketing methodologies, the rise of mobile-first campus ecosystems, and the current applications of zero-shot classification LLMs (like BART) in issue routing and triage.
4. **Methodology & System Architecture:** Detail the decoupled microservice-like architecture. Discuss the React/Capacitor mobile wrapper, the Flask backend, the TiDB cloud database with its SQLite fallback mechanism, and the seamless integration of FCM & Google Sheets. Break down the AI categorization workflow.
5. **Implementation & Features:** Highlight the crucial user journeys: Complaint submission, AI automated processing, real-time push notifications for administrators, fail-safe data syncing, and resolution status updates.
6. **Results & Discussion:** Discuss the system's performance, noting the offline resilience of the data architecture, the accuracy and latency of the HuggingFace model in classifying academic/maintenance issues, and overall user experience enhancements.
7. **Conclusion & Future Scope:** Summarize the fundamental achievements of the project and list potential future enhancements (e.g., predictive analytics for recurring issues, IoT hardware integration for automated reporting).
8. **References:** Generate relevant IEEE-formatted placeholder references for the technologies, frameworks, and academic concepts utilized.

# Writing Guidelines
- Adopt a formal, academic tone suitable for a peer-reviewed computer science journal or conference.
- Emphasize the novel integration elements: AI zero-shot classification, dual-database fault tolerance, seamless Google Sheets backup, and real-time FCM notifications within a unified React/Capacitor and Flask stack.
- Formulate coherent transitions, avoid passive voice where feasible, and synthesize the technological choices thoroughly.

**Please begin by generating the complete draft of the research paper based on these specifications.**
