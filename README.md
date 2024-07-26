# Health Records Repository

## Overview

This web application is designed to streamline the process of patient registration and record management. It provides features for capturing patient information, viewing patient records, and ensures that only authorized staff members have access to sensitive data.

## Features

### 1. Employee/Nurse Registration

- **Form Creation:** A comprehensive form to capture Employee
 details, including RN, Last Name, First Name, Middle Name, and Profile Photo.
- **Form Handling:** Built using ReactJS, this feature handles form submission and provides user feedback upon successful registration.
- **Validation:** Ensures that all required fields are completed accurately before submission.
- **Data Storage:** Utilizes Firebase Firestore or Realtime Database to securely store patient information.
- **User Feedback:** Displays a success message upon successful patient registration.

### 2. Patient Registration

- **Form Creation:** A comprehensive form to capture patient details, including name, date of birth, gender, contact information, and medical history.
- **Form Handling:** Built using ReactJS, this feature handles form submission and provides user feedback upon successful registration.
- **Validation:** Ensures that all required fields are completed accurately before submission.
- **Data Storage:** Utilizes Firebase Firestore or Realtime Database to securely store patient information.
- **User Feedback:** Displays a success message upon successful patient registration.

### 3. View Patient Records

- **Dashboard:** A dedicated page or dashboard for authorized staff to view a list of patient records.
- **Data Retrieval:** Fetches patient data from Firebase Firestore or Realtime Database and displays it in a user-friendly format (table or cards).
- **Search and Filter:** Allows users to search and filter patient records by criteria such as name or date of birth.
- **Access Control:** Implements Firebase authentication to restrict access to authorized users only.
- **Pagination/Infinite Scroll:** Supports pagination or infinite scroll for handling large sets of patient records efficiently.

## Technologies Used

- **ReactJS:** For building dynamic and responsive user interfaces.
- **Firebase:** For real-time database management and user authentication.
- **Tailwind CSS:** For styling and responsive design.
- **SweetAlert2:** For enhanced user feedback with stylish alert dialogs.

## Future Enhancements

- **Outpatient Management:** Adding functionalities to handle outpatient registrations and records.
- **Inpatient Management:** Implementing features to manage inpatient details and track their status.
- **Emergency Room Management:** Creating a module for managing emergency room resources and patient intake.
- **Billing for Rooms:** Introducing billing functionalities for patient room charges and related expenses.

## Installation and Setup

1. **Clone the Repository:**
    ```bash
    git clone <repository-url>
    ```

2. **Navigate to Project Directory:**
    ```bash
    cd <project-directory>
    ```

3. **Install Dependencies:**
    ```bash
    npm install
    ```
4. **Open in Browser:**

    Open your browser and navigate to [http://localhost:3000](http://localhost:3000).