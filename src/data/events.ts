import type { EventData } from "@/types/events";

export const eventSeed: EventData = {
  users: [
    { id: "usr-1", name: "Alya Putri", email: "alya@binus.ac.id", nim: "2602111111", phoneNumber: "081234567890", universityId: "binus", studyProgramId: "cs", graduateBatch: "2026" },
    { id: "usr-2", name: "Bima Pratama", email: "bima@binus.ac.id", nim: "2602111112", phoneNumber: "081234567891", universityId: "binus", studyProgramId: "cs", graduateBatch: "2026" },
    { id: "usr-3", name: "Citra Anindita", email: "citra@binus.ac.id", nim: "2602111113", phoneNumber: "081234567892", universityId: "binus", studyProgramId: "is", graduateBatch: "2026" },
    { id: "usr-4", name: "Daffa Mahendra", email: "daffa@binus.ac.id", nim: "2602111114", phoneNumber: "081234567893", universityId: "binus", studyProgramId: "cs", graduateBatch: "2026" },
    { id: "admin-1", name: "Nadia Rahma", email: "nadia@himti.org" },
  ],
  events: [
    { id: "evt-techno-2026", name: "TECHNO 2026: Wondrous Wonderland", publicDescription: "A welcoming journey for new School of Computer Science students to meet their community.", coverImageUrl: "/himti-icon.svg", status: "OPEN", createdAt: "2026-04-12T08:00:00+07:00", createdBy: "admin-1", updatedAt: "2026-07-08T10:30:00+07:00" },
    { id: "evt-hackathon-2026", name: "HIMTI Hackathon 2026", publicDescription: "Build, learn, and compete in a focused 24-hour campus hackathon.", status: "DRAFT", createdAt: "2026-06-04T08:00:00+07:00", createdBy: "admin-1", updatedAt: "2026-07-05T09:00:00+07:00" },
    { id: "evt-archive", name: "TECHNO 2025", publicDescription: "Previous year welcoming event.", status: "ARCHIVED", createdAt: "2025-04-12T08:00:00+07:00", createdBy: "admin-1", updatedAt: "2025-09-01T08:00:00+07:00" },
  ],
  subevents: [
    { id: "sub-jkt", eventId: "evt-techno-2026", name: "TECHNO Greater Jakarta", publicDescription: "Meet future classmates and experience the first chapter of TECHNO together.", privateDescription: "Open four check-in lanes. Committee call time is 07:00.", type: "WELCOMING_PARTY", startsAt: "2026-08-17T09:00:00+07:00", endsAt: "2026-08-17T16:00:00+07:00", locationName: "BINUS Anggrek Campus", locationAddress: "Jl. Kebon Jeruk Raya No. 27, Jakarta Barat", locationUrl: "https://maps.google.com", capacity: 150, maxTicketsPerUser: 1, registrationOpensAt: "2026-06-01T09:00:00+07:00", registrationClosesAt: "2026-08-10T23:59:00+07:00", editLockAt: "2026-08-11T00:00:00+07:00", autoConfirmWhenComplete: false, status: "OPEN", createdAt: "2026-04-14T09:00:00+07:00", createdBy: "admin-1", updatedAt: "2026-07-08T10:00:00+07:00" },
    { id: "sub-smg", eventId: "evt-techno-2026", name: "TECHNO Semarang", publicDescription: "A local welcoming experience for BINUS Semarang students.", privateDescription: "Venue confirmation due 25 July.", type: "WELCOMING_PARTY", startsAt: "2026-08-24T09:00:00+07:00", endsAt: "2026-08-24T15:00:00+07:00", locationName: "BINUS Semarang", locationAddress: "POJ Avenue, Semarang", capacity: 80, maxTicketsPerUser: 1, registrationOpensAt: "2026-06-15T09:00:00+07:00", registrationClosesAt: "2026-08-17T23:59:00+07:00", editLockAt: "2026-08-18T00:00:00+07:00", autoConfirmWhenComplete: true, status: "OPEN", createdAt: "2026-04-14T09:00:00+07:00", createdBy: "admin-1", updatedAt: "2026-07-06T12:00:00+07:00" },
    { id: "sub-hack", eventId: "evt-hackathon-2026", name: "Hackathon Final", publicDescription: "The final 24-hour product challenge.", privateDescription: "Sponsor brief is still pending.", type: "COMPETITION", startsAt: "2026-11-20T08:00:00+07:00", endsAt: "2026-11-21T12:00:00+07:00", locationName: "BINUS Syahdan Campus", locationAddress: "Jl. K. H. Syahdan No. 9", capacity: 120, maxTicketsPerUser: 1, registrationOpensAt: "2026-09-01T09:00:00+07:00", registrationClosesAt: "2026-11-10T23:59:00+07:00", editLockAt: "2026-11-11T00:00:00+07:00", autoConfirmWhenComplete: false, status: "DRAFT", createdAt: "2026-06-05T09:00:00+07:00", createdBy: "admin-1", updatedAt: "2026-07-05T09:00:00+07:00" },
  ],
  paymentSettings: [
    { id: "pay-setting-jkt", subeventId: "sub-jkt", isPaymentRequired: true, bankName: "BCA", accountName: "KOMTIG HIMTI", accountNumber: "1234567890", paymentInstructions: "Include the bundle reference or your full name in the transfer note.", proofDeadline: "2026-08-10T23:59:00+07:00", acceptedMimeTypes: ["image/jpeg", "image/png", "application/pdf"], maximumFileSizeBytes: 5_000_000 },
    { id: "pay-setting-smg", subeventId: "sub-smg", isPaymentRequired: false, acceptedMimeTypes: ["image/jpeg", "image/png"], maximumFileSizeBytes: 5_000_000 },
  ],
  ticketOptions: [
    { id: "ticket-jkt-ind", subeventId: "sub-jkt", name: "Individual", description: "One participant admission.", type: "INDIVIDUAL", price: 25000, currency: "IDR", capacity: 90, salesOpensAt: "2026-06-01T09:00:00+07:00", salesClosesAt: "2026-08-10T23:59:00+07:00", status: "OPEN" },
    { id: "ticket-jkt-bundle", subeventId: "sub-jkt", name: "Squad of 3", description: "Register with two friends under one reference.", type: "BUNDLE", price: 60000, currency: "IDR", bundleSize: 3, capacity: 60, salesOpensAt: "2026-06-01T09:00:00+07:00", salesClosesAt: "2026-08-05T23:59:00+07:00", status: "OPEN" },
    { id: "ticket-smg", subeventId: "sub-smg", name: "General admission", type: "INDIVIDUAL", price: 0, currency: "IDR", capacity: 80, salesOpensAt: "2026-06-15T09:00:00+07:00", salesClosesAt: "2026-08-17T23:59:00+07:00", status: "OPEN" },
    { id: "ticket-hack", subeventId: "sub-hack", name: "Team of 4", type: "BUNDLE", price: 150000, currency: "IDR", bundleSize: 4, capacity: 120, status: "DRAFT" },
  ],
  forms: [
    { id: "form-profile", name: "Participant Profile", description: "Contact and academic details used by the committee.", purpose: "MAIN_REGISTRATION", status: "OPEN", createdAt: "2026-04-10T08:00:00+07:00", updatedAt: "2026-07-02T08:00:00+07:00", createdBy: "admin-1" },
    { id: "form-diet", name: "Dietary & Accessibility", description: "Meal and accessibility requirements.", purpose: "ADDITIONAL_INFORMATION", status: "OPEN", createdAt: "2026-04-11T08:00:00+07:00", updatedAt: "2026-07-02T08:00:00+07:00", createdBy: "admin-1" },
    { id: "form-transport", name: "Transportation Details", description: "Departure and return preferences.", purpose: "TRANSPORTATION", status: "DRAFT", createdAt: "2026-04-12T08:00:00+07:00", createdBy: "admin-1" },
  ],
  formVersions: [
    { id: "fv-profile-1", formId: "form-profile", versionNumber: 1, status: "PUBLISHED", publishedAt: "2026-04-10T09:00:00+07:00" },
    { id: "fv-diet-1", formId: "form-diet", versionNumber: 1, status: "PUBLISHED", publishedAt: "2026-04-11T09:00:00+07:00" },
    { id: "fv-transport-1", formId: "form-transport", versionNumber: 1, status: "DRAFT" },
  ],
  formSections: [
    { id: "fs-profile", formVersionId: "fv-profile-1", title: "Your details", description: "Tell us how to reach you.", orderIndex: 0 },
    { id: "fs-academic", formVersionId: "fv-profile-1", title: "Academic information", orderIndex: 1 },
    { id: "fs-diet", formVersionId: "fv-diet-1", title: "Diet and access", orderIndex: 0 },
  ],
  formQuestions: [
    { id: "fq-phone", formVersionId: "fv-profile-1", formSectionId: "fs-profile", label: "WhatsApp number", fieldKey: "phone_number", fieldType: "PHONE", placeholder: "08xxxxxxxxxx", isRequired: true, orderIndex: 0 },
    { id: "fq-email", formVersionId: "fv-profile-1", formSectionId: "fs-profile", label: "Active email", fieldKey: "active_email", fieldType: "EMAIL", isRequired: true, orderIndex: 1 },
    { id: "fq-major", formVersionId: "fv-profile-1", formSectionId: "fs-academic", label: "Study program", fieldKey: "study_program", fieldType: "DROPDOWN", isRequired: true, orderIndex: 0 },
    { id: "fq-diet", formVersionId: "fv-diet-1", formSectionId: "fs-diet", label: "Dietary requirements", fieldKey: "dietary_requirements", fieldType: "LONG_TEXT", helpText: "Include allergies and dietary restrictions.", isRequired: false, orderIndex: 0 },
  ],
  formQuestionOptions: [
    { id: "fqo-cs", formQuestionId: "fq-major", label: "Computer Science", value: "cs", orderIndex: 0, isActive: true },
    { id: "fqo-is", formQuestionId: "fq-major", label: "Information Systems", value: "is", orderIndex: 1, isActive: true },
  ],
  subeventForms: [
    { id: "sf-jkt-profile", subeventId: "sub-jkt", formVersionId: "fv-profile-1", purpose: "MAIN_REGISTRATION", completionStage: "DURING_REGISTRATION", isRequired: true, blocksConfirmation: true, orderIndex: 0, dueAt: "2026-08-10T23:59:00+07:00" },
    { id: "sf-jkt-diet", subeventId: "sub-jkt", formVersionId: "fv-diet-1", purpose: "ADDITIONAL_INFORMATION", completionStage: "POST_REGISTRATION", isRequired: false, blocksConfirmation: false, orderIndex: 1, dueAt: "2026-08-14T23:59:00+07:00" },
  ],
  registrations: [
    { id: "reg-alya", userId: "usr-1", subeventId: "sub-jkt", ticketOptionId: "ticket-jkt-bundle", ticketNameSnapshot: "Squad of 3", priceSnapshot: 60000, finalAmountSnapshot: 60000, status: "PENDING_REVIEW", submittedAt: "2026-07-01T10:00:00+07:00", lastEditedAt: "2026-07-02T09:20:00+07:00", createdAt: "2026-07-01T10:00:00+07:00", updatedAt: "2026-07-02T10:00:00+07:00" },
    { id: "reg-bima", userId: "usr-2", subeventId: "sub-jkt", ticketOptionId: "ticket-jkt-bundle", ticketNameSnapshot: "Squad of 3", priceSnapshot: 60000, finalAmountSnapshot: 60000, status: "PENDING_REVIEW", submittedAt: "2026-07-01T11:00:00+07:00", createdAt: "2026-07-01T11:00:00+07:00", updatedAt: "2026-07-02T10:00:00+07:00" },
    { id: "reg-citra", userId: "usr-3", subeventId: "sub-jkt", ticketOptionId: "ticket-jkt-ind", ticketNameSnapshot: "Individual", priceSnapshot: 25000, finalAmountSnapshot: 25000, status: "REQUIRES_CORRECTION", correctionReason: "Please upload a clearer payment proof.", submittedAt: "2026-07-03T11:00:00+07:00", lastReviewedAt: "2026-07-03T14:00:00+07:00", createdAt: "2026-07-03T11:00:00+07:00", updatedAt: "2026-07-03T14:00:00+07:00" },
    { id: "reg-daffa", userId: "usr-4", subeventId: "sub-smg", ticketOptionId: "ticket-smg", ticketNameSnapshot: "General admission", priceSnapshot: 0, finalAmountSnapshot: 0, status: "CONFIRMED", submittedAt: "2026-07-04T09:00:00+07:00", confirmedAt: "2026-07-04T09:01:00+07:00", createdAt: "2026-07-04T09:00:00+07:00", updatedAt: "2026-07-04T09:01:00+07:00" },
  ],
  formSubmissions: [
    { id: "fsub-alya", registrationId: "reg-alya", subeventFormId: "sf-jkt-profile", status: "PENDING_REVIEW", submittedAt: "2026-07-01T10:00:00+07:00", lastEditedAt: "2026-07-02T09:20:00+07:00", reviewedAt: "2026-07-01T16:00:00+07:00" },
    { id: "fsub-bima", registrationId: "reg-bima", subeventFormId: "sf-jkt-profile", status: "PENDING_REVIEW", submittedAt: "2026-07-01T11:00:00+07:00" },
    { id: "fsub-citra", registrationId: "reg-citra", subeventFormId: "sf-jkt-profile", status: "REQUIRES_CORRECTION", correctionReason: "Confirm your contact number.", submittedAt: "2026-07-03T11:00:00+07:00", reviewedAt: "2026-07-03T14:00:00+07:00" },
    { id: "fsub-daffa", registrationId: "reg-daffa", subeventFormId: "sf-smg-profile", status: "APPROVED", submittedAt: "2026-07-04T09:00:00+07:00", reviewedAt: "2026-07-04T09:01:00+07:00" },
  ],
  formAnswers: [
    { id: "fa-alya-phone", formSubmissionId: "fsub-alya", formQuestionId: "fq-phone", textValue: "081234567890" },
    { id: "fa-alya-email", formSubmissionId: "fsub-alya", formQuestionId: "fq-email", textValue: "alya@binus.ac.id" },
    { id: "fa-alya-major", formSubmissionId: "fsub-alya", formQuestionId: "fq-major", selectedOptionIds: ["fqo-cs"] },
    { id: "fa-citra-phone", formSubmissionId: "fsub-citra", formQuestionId: "fq-phone", textValue: "081234567892" },
  ],
  payments: [
    { id: "payment-alya", registrationId: "reg-alya", baseAmount: 60000, expectedAmount: 60000, status: "PENDING_REVIEW" },
    { id: "payment-bima", registrationId: "reg-bima", baseAmount: 60000, expectedAmount: 60000, status: "PENDING_REVIEW" },
    { id: "payment-citra", registrationId: "reg-citra", baseAmount: 25000, expectedAmount: 25000, status: "REJECTED", rejectionReason: "The account number and transfer amount are unreadable.", reviewedAt: "2026-07-03T14:00:00+07:00" },
    { id: "payment-daffa", registrationId: "reg-daffa", baseAmount: 0, expectedAmount: 0, status: "NOT_REQUIRED" },
  ],
  paymentProofs: [
    { id: "proof-alya", paymentId: "payment-alya", fileId: "file-proof-bundle", isCurrent: true, uploadedAt: "2026-07-02T09:25:00+07:00" },
    { id: "proof-alya-old", paymentId: "payment-alya", fileId: "file-proof-old", isCurrent: false, uploadedAt: "2026-07-01T10:00:00+07:00", replacedAt: "2026-07-02T09:25:00+07:00" },
    { id: "proof-bima", paymentId: "payment-bima", fileId: "file-proof-bundle", isCurrent: true, uploadedAt: "2026-07-01T11:00:00+07:00" },
    { id: "proof-citra", paymentId: "payment-citra", fileId: "file-proof-citra", isCurrent: true, uploadedAt: "2026-07-03T11:00:00+07:00" },
  ],
  bundleGroups: [{ id: "bundle-squad", ticketOptionId: "ticket-jkt-bundle", leaderUserId: "usr-1", referenceCode: "TECHNO-SQUAD-7K2", requiredMemberCount: 3, totalPriceSnapshot: 60000, status: "WAITING_FOR_MEMBERS" }],
  bundleMembers: [
    { bundleGroupId: "bundle-squad", registrationId: "reg-alya", role: "LEADER", joinedAt: "2026-07-01T10:00:00+07:00" },
    { bundleGroupId: "bundle-squad", registrationId: "reg-bima", role: "MEMBER", joinedAt: "2026-07-01T11:00:00+07:00" },
  ],
  registrationNotes: [{ id: "note-citra", registrationId: "reg-citra", content: "Asked participant to replace the proof before Friday.", createdBy: "admin-1", createdAt: "2026-07-03T14:00:00+07:00" }],
  activityLogs: [
    { id: "log-alya-created", registrationId: "reg-alya", type: "REGISTRATION_CREATED", description: "Registration started", createdAt: "2026-07-01T09:35:00+07:00" },
    { id: "log-alya-submitted", registrationId: "reg-alya", type: "REGISTRATION_SUBMITTED", description: "Registration submitted for review", createdAt: "2026-07-01T10:00:00+07:00" },
    { id: "log-alya-edited", registrationId: "reg-alya", type: "ANSWERS_EDITED", description: "WhatsApp number was updated after initial review", actorUserId: "usr-1", createdAt: "2026-07-02T09:20:00+07:00" },
    { id: "log-citra-correction", registrationId: "reg-citra", type: "CORRECTION_REQUESTED", description: "Clearer payment proof requested", actorUserId: "admin-1", createdAt: "2026-07-03T14:00:00+07:00" },
  ],
  files: [
    { id: "file-proof-bundle", publicUrl: "/himti-icon.svg", originalName: "transfer-60000.jpg", mimeType: "image/jpeg", sizeBytes: 128000, sha256: "same-proof" },
    { id: "file-proof-old", publicUrl: "/himti-icon.svg", originalName: "transfer-old.jpg", mimeType: "image/jpeg", sizeBytes: 98000, sha256: "old-proof" },
    { id: "file-proof-citra", publicUrl: "/himti-icon.svg", originalName: "blurred-proof.jpg", mimeType: "image/jpeg", sizeBytes: 98000, sha256: "citra-proof" },
  ],
};

export const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
