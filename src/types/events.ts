export type LifecycleStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
export type EventStatus = LifecycleStatus;
export type SubeventStatus = LifecycleStatus;
export type SubeventType = "MAIN_EVENT" | "WORKSHOP" | "SEMINAR" | "COMPETITION" | "WELCOMING_PARTY" | "DOMESTIC_STUDY_TOUR" | "INTERNATIONAL_STUDY_TOUR" | "COMPANY_VISIT" | "OTHER";
export type TicketType = "INDIVIDUAL" | "BUNDLE";
export type TicketStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "SOLD_OUT" | "ARCHIVED";
export type FormStatus = LifecycleStatus;
export type FormVersionStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type FormPurpose = "MAIN_REGISTRATION" | "TRANSPORTATION" | "ACCOMMODATION" | "ADDITIONAL_INFORMATION" | "OTHER";
export type FormCompletionStage = "DURING_REGISTRATION" | "POST_REGISTRATION";
export type FormFieldType = "SHORT_TEXT" | "LONG_TEXT" | "EMAIL" | "PHONE" | "NUMBER" | "DATE" | "TIME" | "DROPDOWN" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "CHECKBOX" | "FILE_UPLOAD" | "IMAGE_UPLOAD" | "INFORMATION";
export type RegistrationStatus = "DRAFT" | "SUBMITTED" | "PENDING_REVIEW" | "REQUIRES_CORRECTION" | "CONFIRMED" | "REJECTED" | "CANCELLED";
export type FormSubmissionStatus = "DRAFT" | "SUBMITTED" | "PENDING_REVIEW" | "APPROVED" | "REQUIRES_CORRECTION";
export type PaymentStatus = "NOT_REQUIRED" | "AWAITING_UPLOAD" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
export type BundleStatus = "WAITING_FOR_MEMBERS" | "PENDING_VALIDATION" | "APPROVED" | "REJECTED" | "CANCELLED";
export type ActivityType = "REGISTRATION_CREATED" | "REGISTRATION_SUBMITTED" | "ANSWERS_EDITED" | "REVIEW_REQUESTED" | "REGISTRATION_APPROVED" | "REGISTRATION_REJECTED" | "CORRECTION_REQUESTED" | "PAYMENT_APPROVED" | "PAYMENT_REJECTED" | "BUNDLE_APPROVED" | "BUNDLE_REJECTED" | "NOTE_ADDED";

export interface User { id: string; name: string; email: string; nim?: string; universityId?: string; studyProgramId?: string; graduateBatch?: string; phoneNumber?: string; }
export interface Event { id: string; name: string; publicDescription?: string; coverImageUrl?: string; status: EventStatus; createdAt: string; createdBy: string; updatedAt?: string; updatedBy?: string; }
export interface Subevent { id: string; eventId: string; name: string; publicDescription?: string; privateDescription?: string; type: SubeventType; startsAt: string; endsAt: string; locationName?: string; locationAddress?: string; locationUrl?: string; capacity?: number; maxTicketsPerUser: number; registrationOpensAt?: string; registrationClosesAt?: string; editLockAt?: string; autoConfirmWhenComplete: boolean; status: SubeventStatus; createdAt: string; createdBy: string; updatedAt?: string; updatedBy?: string; }
export interface PaymentSetting { id: string; subeventId: string; isPaymentRequired: boolean; bankName?: string; accountName?: string; accountNumber?: string; paymentInstructions?: string; proofDeadline?: string; acceptedMimeTypes: string[]; maximumFileSizeBytes?: number; }
export interface TicketOption { id: string; subeventId: string; name: string; description?: string; type: TicketType; price: number; currency: string; bundleSize?: number; capacity?: number; salesOpensAt?: string; salesClosesAt?: string; status: TicketStatus; }
export interface FormQuestionOption { id: string; formQuestionId: string; label: string; value: string; orderIndex: number; isActive: boolean; }
export interface FormQuestion { id: string; formVersionId: string; formSectionId: string; label: string; fieldKey: string; fieldType: FormFieldType; helpText?: string; placeholder?: string; isRequired: boolean; validationConfig?: Record<string, unknown>; orderIndex: number; }
export interface FormSection { id: string; formVersionId: string; title: string; description?: string; orderIndex: number; }
export interface FormVersion { id: string; formId: string; versionNumber: number; status: FormVersionStatus; publishedAt?: string; }
export interface Form { id: string; name: string; description?: string; purpose: FormPurpose; status: FormStatus; createdAt: string; updatedAt?: string; createdBy: string; }
export interface SubeventForm { id: string; subeventId: string; formVersionId: string; purpose: FormPurpose; completionStage: FormCompletionStage; isRequired: boolean; blocksConfirmation: boolean; orderIndex: number; availableFrom?: string; dueAt?: string; }
export interface Registration { id: string; userId: string; subeventId: string; ticketOptionId: string; ticketNameSnapshot: string; priceSnapshot: number; finalAmountSnapshot: number; status: RegistrationStatus; correctionReason?: string; submittedAt?: string; confirmedAt?: string; lastEditedAt?: string; lastReviewedAt?: string; createdAt: string; updatedAt: string; }
export interface FormSubmission { id: string; registrationId: string; subeventFormId: string; status: FormSubmissionStatus; correctionReason?: string; submittedAt?: string; lastEditedAt?: string; reviewedAt?: string; }
export interface FormAnswer { id: string; formSubmissionId: string; formQuestionId: string; textValue?: string; numberValue?: number; booleanValue?: boolean; dateTimeValue?: string; fileId?: string; selectedOptionIds?: string[]; }
export interface Payment { id: string; registrationId: string; baseAmount: number; expectedAmount: number; status: PaymentStatus; rejectionReason?: string; reviewedAt?: string; }
export interface PaymentProof { id: string; paymentId: string; fileId: string; isCurrent: boolean; uploadedAt: string; replacedAt?: string; }
export interface BundleGroup { id: string; ticketOptionId: string; leaderUserId: string; referenceCode: string; requiredMemberCount: number; totalPriceSnapshot: number; status: BundleStatus; rejectionReason?: string; }
export interface BundleMember { bundleGroupId: string; registrationId: string; role: "LEADER" | "MEMBER"; joinedAt: string; }
export interface RegistrationNote { id: string; registrationId: string; content: string; createdBy: string; createdAt: string; }
export interface ActivityLog { id: string; registrationId: string; type: ActivityType; description: string; actorUserId?: string; createdAt: string; }
export interface FileRecord { id: string; publicUrl?: string; originalName: string; mimeType: string; sizeBytes: number; sha256?: string; }

export interface EventData {
  users: User[]; events: Event[]; subevents: Subevent[]; paymentSettings: PaymentSetting[]; ticketOptions: TicketOption[];
  forms: Form[]; formVersions: FormVersion[]; formSections: FormSection[]; formQuestions: FormQuestion[]; formQuestionOptions: FormQuestionOption[]; subeventForms: SubeventForm[];
  registrations: Registration[]; formSubmissions: FormSubmission[]; formAnswers: FormAnswer[]; payments: Payment[]; paymentProofs: PaymentProof[];
  bundleGroups: BundleGroup[]; bundleMembers: BundleMember[]; registrationNotes: RegistrationNote[]; activityLogs: ActivityLog[]; files: FileRecord[];
}
