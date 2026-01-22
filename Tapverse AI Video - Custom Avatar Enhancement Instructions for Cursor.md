# Tapverse AI Video - Custom Avatar Enhancement Instructions for Cursor

**Document Date**: January 18, 2026  
**Prepared By**: Manus AI Agent  
**Status**: READY FOR IMPLEMENTATION

---

## 1.0 OBJECTIVE

To enhance the Tapverse AI Video module by implementing a dedicated **"My Avatars"** section. This will allow users to create, manage, and use their own custom HeyGen Instant Avatars and Voice Clones for video generation, providing a more personalized and scalable experience.

## 2.0 OVERVIEW

This enhancement is divided into three main parts:

1.  **Part 1: UI for "My Avatars" Section** - Create a new page and wizard for avatar creation and management.
2.  **Part 2: Backend Logic for Avatar Creation** - Implement API endpoints and webhooks to handle avatar creation with HeyGen.
3.  **Part 3: Integration with Video Creation Wizards** - Update existing video wizards to include custom avatars.

## 3.0 PART 1: UI FOR "MY AVATARS" SECTION

### 3.1 Create New Page: `MyAvatars.js`

**File Location**: `frontend/src/pages/MyAvatars.js`

**Purpose**: This page will serve as the central hub for users to view and manage their custom avatars.

**Implementation Details**:

1.  **Navigation**: Add a link to this page in the main user navigation menu (e.g., under "Settings" or as a top-level item).
2.  **Avatar Gallery**: Display a gallery of the user's existing custom avatars. Each avatar should be represented by a thumbnail image.
3.  **Create Button**: Include a prominent button with the text **"Create New Avatar"** that launches the `CreateAvatarWizard` component.

### 3.2 Create New Component: `CreateAvatarWizard.js`

**File Location**: `frontend/src/components/wizards/CreateAvatarWizard.js`

**Purpose**: A step-by-step wizard to guide users through the avatar creation process.

**Wizard Steps**:

#### Step 1: Instructions & Consent

-   **Instructions**: Display clear, simple instructions for recording a high-quality video, based on HeyGen's requirements. Use a clean, easy-to-read format.
    -   *Example Text*: "Look directly at the camera," "Use good lighting," "Avoid background noise."
-   **Consent Checkbox**: Crucially, include a consent checkbox with the following text: **"I confirm that I am the person in this video and I consent to the creation of a digital avatar of myself."**
    -   The "Next" button must be disabled until this checkbox is checked.

#### Step 2: Video Upload

-   **File Uploader**: Implement a file uploader for users to submit their video file (MP4 or MOV).
-   **Transcription**: Include a `textarea` where the user must transcribe the exact words spoken in the video. This is a HeyGen requirement for verification.

#### Step 3: Confirmation & Submission

-   **Summary**: Show a summary of the uploaded video and transcription.
-   **Submit Button**: A button with the text **"Submit for Creation"** will trigger the backend API call to start the avatar creation process.

## 4.0 PART 2: BACKEND LOGIC FOR AVATAR CREATION

### 4.1 Create New Endpoint: `POST /api/avatars/create-instant-avatar`

**File Location**: `backend/src/routes/avatars.js` (or similar)

**Purpose**: To receive the user's video and transcription, and initiate the avatar creation process with HeyGen.

**Implementation Details**:

1.  **Security**: Ensure this endpoint is protected and only accessible by authenticated users.
2.  **API Call**: Make a server-to-server API call to the HeyGen endpoint for creating an "Instant Avatar." This will likely involve a `multipart/form-data` request.
3.  **Response Handling**: The HeyGen API will return a job ID or avatar ID. Store this ID in your database, associated with the user's account, and set its status to **"processing"**.

### 4.2 Implement Webhook Endpoint: `POST /api/webhooks/heygen-avatar-status`

**File Location**: `backend/src/routes/webhooks.js` (or similar)

**Purpose**: To receive status updates from HeyGen about the avatar creation process.

**Implementation Details**:

1.  **Webhook Configuration**: In your HeyGen account settings, configure a webhook to point to this endpoint.
2.  **Status Updates**: When the avatar is ready (or fails), HeyGen will send a notification to this webhook.
3.  **Database Update**: Your endpoint will parse the notification, find the corresponding avatar in your database using the avatar ID, and update its status from **"processing"** to **"completed"** or **"failed"**.

## 5.0 PART 3: INTEGRATION WITH VIDEO CREATION WIZARDS

### 5.1 Modify Avatar Selection Step

**Files to Modify**:
-   `frontend/src/components/wizards/ShopifyProductWizard.js`
-   `frontend/src/components/wizards/RealEstateWizard.js`

**Purpose**: To allow users to select their custom avatars in the video creation process.

**Implementation Details**:

1.  **Update UI**: The avatar selection step in both wizards needs to be updated to display two sets of avatars:
    -   A list of HeyGen's **"Default Avatars"**.
    -   A list of the user's own **"My Avatars"** (pulled from your database for the logged-in user).
2.  **Choice**: This gives the user the choice to use a generic avatar or their own personal clone for any video they create.

## 6.0 SUMMARY OF CHANGES

| Component | Type | Location | Description |
|---|---|---|---|
| `MyAvatars.js` | New Page | `frontend/src/pages/` | Displays user's custom avatars and launches creation wizard. |
| `CreateAvatarWizard.js` | New Component | `frontend/src/components/wizards/` | Step-by-step wizard for creating custom avatars. |
| `/api/avatars/create-instant-avatar` | New Endpoint | `backend/src/routes/` | Initiates avatar creation with HeyGen. |
| `/api/webhooks/heygen-avatar-status` | New Endpoint | `backend/src/routes/` | Receives status updates from HeyGen. |
| `ShopifyProductWizard.js` | Modified Component | `frontend/src/components/wizards/` | Updated to include custom avatar selection. |
| `RealEstateWizard.js` | Modified Component | `frontend/src/components/wizards/` | Updated to include custom avatar selection. |

By implementing these changes, you will create a scalable and user-friendly system for custom avatar management, significantly enhancing the value of the Tapverse AI Video module.
