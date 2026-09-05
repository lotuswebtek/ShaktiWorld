/**
 * Structured legal drafts for Shaktiworld.
 * These are product drafts, not legal advice.
 * Every [REVIEW WITH LAWYER] block marks a decision counsel must confirm
 * before this text is treated as operative.
 */

export const CURRENT_LEGAL = {
  terms: '2026-09-03-draft-1',
  privacy: '2026-09-03-draft-1',
  guidelines: '2026-09-03-draft-1',
  volunteer: '2026-09-03-draft-1',
  content: '2026-09-03-draft-1',
}

export const LEGAL_UPDATED = '3 September 2026'

const review = (title, items) => ({
  marker: '[REVIEW WITH LAWYER]',
  title,
  items,
})

export const legalDocuments = {
  terms: {
    slug: 'terms',
    title: 'Terms of Use',
    version: CURRENT_LEGAL.terms,
    updated: LEGAL_UPDATED,
    summary:
      'These Terms describe how you may use Shaktiworld. They are a draft for counsel review and are not yet a binding legal instrument.',
    sections: [
      {
        heading: '1. Who we are',
        paragraphs: [
          'Shaktiworld is a community platform for women. It connects members with information, peer conversation, events, and member-shared listings. It does not deliver results on anyone’s behalf.',
          'The platform and its volunteers do not provide medical services, legal services, or emergency services. If you or someone else is in immediate danger, contact local emergency services or a crisis helpline.',
        ],
      },
      {
        heading: '2. Eligibility and accounts',
        paragraphs: [
          'Membership is intended for women. You must provide accurate information and complete identity verification before accessing community sections that require a verified account.',
          'You are responsible for activity under your account. Do not share your login. Notify us if you believe your account has been used without your permission.',
        ],
        review: review('Age, jurisdiction, and who may join', [
          'Confirm minimum age (18 vs 21 vs other) for each country of operation.',
          'Confirm whether the product is limited to women as a lawful single-sex community space in each target jurisdiction (India, US, others).',
          'Confirm how identity verification interacts with anti-discrimination and data-protection law.',
        ]),
      },
      {
        heading: '3. What the platform is — and is not',
        paragraphs: [
          'Shaktiworld hosts public marketing pages and verified-member community spaces, including Services information, Listening, Jobs, a small-business directory, Events, and Resources.',
          'We do not operate as a crisis service, law firm, medical practice, counsellor, or employment agency. Volunteers and moderators are not clinicians, attorneys, or emergency responders.',
          'Information on the platform is for connection and context. It is not a diagnosis, treatment plan, legal strategy, safety plan, or job placement.',
        ],
      },
      {
        heading: '4. User-to-user interactions',
        paragraphs: [
          'Members may post, reply, list businesses, share job notices, and send or reveal contact details. Those interactions are between members. Shaktiworld does not supervise, guarantee, or take responsibility for what members say or do to one another on or off the platform.',
          'You decide what you share. Consider using a private window on a shared device. Do not assume another member is who they claim to be.',
        ],
        review: review('Duty of care for peer conversations', [
          'Confirm the scope of liability for user-generated content and peer support (Listening, support requests, DMs if added later).',
          'Confirm whether additional warnings are required for domestic-violence and dowry-related conversations.',
        ]),
      },
      {
        heading: '5. Job listings',
        paragraphs: [
          'The Jobs area is a member-to-member noticeboard. We do not vet employers, verify vacancies, interview candidates, or place anyone in a role.',
          'Compensation ranges are supplied by the person posting. Research listings independently. Contact details are shown only to verified members; viewing them is logged internally.',
        ],
      },
      {
        heading: '6. Business listings',
        paragraphs: [
          'The directory lists home-based and other member businesses. We do not inspect, certify, insure, or take payment for those businesses.',
          'Any arrangement you make with a listed business is solely between you and that member.',
        ],
      },
      {
        heading: '7. Support conversations',
        paragraphs: [
          'Support requests and Listening posts may be reviewed by volunteers or staff so they can point you to information or other members. That review is not counselling, casework, or advocacy.',
          'We do not monitor conversations in real time. We may not see a message quickly, or at all.',
        ],
      },
      {
        heading: '8. Limitation of liability',
        paragraphs: [
          'To the fullest extent permitted by applicable law, Shaktiworld, its organisers, directors, staff, and volunteers are not liable for loss, harm, or dispute arising from:',
          '• user-to-user interactions, including posts, replies, messages, and meetings arranged through the platform;',
          '• job listings, skills profiles, or any hiring conversation;',
          '• business directory listings or any purchase or service arranged through a listing;',
          '• any support conversation, including health, mental wellbeing, domestic violence, or dowry-related requests;',
          '• identity-verification decisions, account suspension, or content removal;',
          '• downtime, lost data, or unauthorised access despite reasonable precautions.',
          'The platform and its volunteers do not provide medical, legal, or emergency services, and they are not liable for any decision you make based on information found here.',
        ],
        review: review('Caps, disclaimers, and consumer law', [
          'Confirm whether a monetary cap, “as-is” disclaimer, and exclusion of consequential damages are enforceable in India, Texas/US, and any other launch jurisdiction.',
          'Confirm required consumer-protection language that cannot be disclaimed.',
          'Confirm volunteer vs entity liability (unincorporated collective vs company).',
          'Name the contracting entity and governing law once counsel chooses them.',
        ]),
      },
      {
        heading: '9. Acceptable use',
        paragraphs: [
          'Do not use the platform to harass, threaten, impersonate, scrape, or publish another person’s private information. Do not post content that is illegal in your location. Follow the Community Guidelines and Content Policy.',
          'We may remove content, limit features, or suspend accounts when we believe these Terms have been broken. We do not promise that we will catch every violation.',
        ],
      },
      {
        heading: '10. Changes',
        paragraphs: [
          `The current version of these Terms is ${CURRENT_LEGAL.terms}. We may publish a new version. Continued use after a new version is posted may be treated as acceptance — counsel must confirm the correct mechanism (checkbox, notice period, or both).`,
        ],
        review: review('How new versions bind existing members', [
          'Choose: clickwrap on next login, email notice plus continued use, or mandatory re-consent.',
          'Confirm record-keeping needed to prove acceptance (version + timestamp + user id).',
        ]),
      },
      {
        heading: '11. Contact',
        paragraphs: [
          'Questions about these Terms: houston@shaktiworld.org. This address is for administrative contact, not emergency help.',
        ],
      },
    ],
  },

  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    version: CURRENT_LEGAL.privacy,
    updated: LEGAL_UPDATED,
    summary:
      'This draft explains what information Shaktiworld collects, including identity documents, and how members can ask for deletion. It is not a finished privacy notice.',
    sections: [
      {
        heading: '1. Who this notice is for',
        paragraphs: [
          'This notice describes how Shaktiworld handles personal information of people who visit public pages, create an account, or submit identity documents for verification.',
        ],
        review: review('Controller and processors', [
          'Name the legal entity that is the data controller / data fiduciary.',
          'List processors: Clerk (authentication), Supabase or other PostgreSQL/storage host, email or hosting providers.',
          'Map DPDP Act (India), GDPR (if EU users), and relevant US state privacy laws.',
        ]),
      },
      {
        heading: '2. Information we collect',
        paragraphs: [
          'Account and profile: name, email, phone, WhatsApp, city, state, country, photo, bio, and authentication identifiers from Clerk.',
          'Community content you choose to post: Listening posts and replies, support requests, job posts, seeker profiles, business listings, RSVPs, and reports.',
          'Technical data: approximate device/browser data needed to run the site. We aim not to log email, name, phone, address, or IP in application logs.',
        ],
      },
      {
        heading: '3. Identity documents — what is collected',
        paragraphs: [
          'To verify that an account belongs to a real person, we ask you to upload one identity document. Accepted types are: Aadhaar card, passport, driving licence, student ID, or other government ID.',
          'We store: (1) the document type you selected, (2) the image or PDF file, and (3) review status (submitted, under review, approved, rejected) plus any rejection reason written by a reviewer.',
          'We do not extract, copy, or store the identification number printed on the document. No automated OCR or ID parsing is used. Review is manual.',
        ],
      },
      {
        heading: '4. Identity documents — why we collect them',
        paragraphs: [
          'Document images are used only to decide whether to mark an account as verified, so community spaces are limited to real people rather than anonymous or automated accounts.',
          'They are not used for credit checks, government reporting, marketing, or sale to third parties.',
        ],
        review: review('Lawful basis for ID collection', [
          'Confirm lawful basis under DPDP / GDPR / other (consent, legitimate interest, or legal obligation).',
          'Confirm whether Aadhaar images may be collected at all, and whether masking or virtual ID is required.',
          'Confirm student-ID and other non-passport documents are acceptable for this purpose.',
        ]),
      },
      {
        heading: '5. Identity documents — where they are stored',
        paragraphs: [
          'Files are stored in a private object-storage bucket. The application never generates a public URL for these files.',
          'Reviewers open a short-lived signed URL (minutes, not days) to look at the file, then the link expires.',
          'The database stores only the document type and a storage key pointing at that private file — not the ID number.',
        ],
        review: review('Storage location and subprocessors', [
          'Confirm the bucket region (for example US vs India) and whether cross-border transfer language is required.',
          'Name the storage vendor in the final notice (currently drafted around a private Supabase bucket).',
          'Confirm encryption-at-rest and access-logging requirements.',
        ]),
      },
      {
        heading: '6. Identity documents — retention period',
        paragraphs: [
          'The file is kept while verification is in progress.',
          'After an account is approved, the file is retained for 90 days for dispute resolution, then permanently deleted from the private bucket.',
          'The database may keep the document type and review outcome (approved/rejected) without the file, so we can show you why a decision was made.',
        ],
        review: review('90-day post-approval retention', [
          'Confirm 90 days is appropriate, or set a different period.',
          'Confirm retention for rejected submissions, suspended accounts, and legal holds.',
          'Confirm whether review outcome records must also be deleted on request.',
        ]),
      },
      {
        heading: '7. Identity documents — who can view them',
        paragraphs: [
          'You can see the status of your own verification, not a copy of the file, in your account flow.',
          'Moderators and admins assigned to verification review can open the file through short-lived signed URLs. Other members cannot see your document.',
          'We do not share identity documents with advertisers, other members, or the public.',
        ],
        review: review('Staff access and subprocessors', [
          'Confirm whether contractors, hosting support, or law-enforcement requests need a separate disclosure.',
          'Confirm logging of every document view (audit_log already records moderator actions).',
        ]),
      },
      {
        heading: '8. Identity documents — how to request deletion',
        paragraphs: [
          'Email houston@shaktiworld.org from the address on your account and ask us to delete your identity document and/or your account.',
          'We will delete the stored file from the private bucket when the request is verified as coming from the account holder, unless a longer hold is required by law or an active dispute.',
          'Deleting the document file may also mean we cannot keep the account in a verified state. You can close the account instead of remaining unverified.',
          'Do not include a copy of the ID number in your email. We do not need it, and we do not store it.',
        ],
        review: review('Deletion SLA and exceptions', [
          'Set a response timeline (for example 30 days) required by applicable law.',
          'List lawful exceptions (ongoing investigation, tax, litigation hold).',
          'Confirm identity-proofing for deletion requests without collecting more ID numbers.',
        ]),
      },
      {
        heading: '9. Other sharing',
        paragraphs: [
          'We do not sell personal information.',
          'Crisis helpline numbers shown on the site are public resources. Clicking them does not send your support-request text to those services.',
        ],
      },
      {
        heading: '10. Your choices',
        paragraphs: [
          'You may edit profile fields, hide a business listing, cancel an RSVP, or ask us to close your account.',
          'Some records (for example audit logs of moderator actions, or a copy of these Terms you accepted) may be kept in limited form for security and accountability.',
        ],
      },
    ],
  },

  guidelines: {
    slug: 'community-guidelines',
    title: 'Community Guidelines',
    version: CURRENT_LEGAL.guidelines,
    updated: LEGAL_UPDATED,
    summary:
      'How we ask members to show up in Listening, Services, Jobs, and the directory. These are community norms, not a promise of safety.',
    sections: [
      {
        heading: '1. Purpose',
        paragraphs: [
          'Shaktiworld is a space to connect, inform, and support one another. It is not therapy, legal advice, or an emergency room.',
        ],
      },
      {
        heading: '2. Speak from your own experience',
        paragraphs: [
          'Use “I” more than “you.” Do not pressure anyone to disclose more than they choose. Respect anonymous posts — do not try to identify the author.',
        ],
      },
      {
        heading: '3. No harassment or hate',
        paragraphs: [
          'Do not attack people based on caste, religion, race, disability, sexuality, gender identity, or age. Do not share another member’s private contact details without their permission.',
        ],
        review: review('Protected characteristics and enforcement', [
          'Align the protected-characteristic list with applicable law in each country.',
          'Confirm whether single-sex membership rules need an explicit guideline of their own.',
        ]),
      },
      {
        heading: '4. Crisis and harm',
        paragraphs: [
          'If someone appears to be in immediate danger, point them to local emergency services or a listed helpline. Do not attempt to intervene as a rescuer through the platform.',
          'Do not post instructions for self-harm, violence, or illegal activity.',
        ],
      },
      {
        heading: '5. Listings and promotions',
        paragraphs: [
          'Job and business posts must be honest. Do not list roles or services you cannot actually offer. Compensation range is required on job notices.',
        ],
      },
      {
        heading: '6. Reporting',
        paragraphs: [
          'Use the report control on posts and replies. Moderators review reports; we do not promise a particular outcome or timeline.',
        ],
      },
    ],
  },

  volunteer: {
    slug: 'volunteer-agreement',
    title: 'Volunteer / Moderator Agreement',
    version: CURRENT_LEGAL.volunteer,
    updated: LEGAL_UPDATED,
    summary:
      'Draft duties and limits for people who review identity documents, support requests, or community reports. Volunteers are not staff clinicians or lawyers.',
    sections: [
      {
        heading: '1. Role',
        paragraphs: [
          'You may be asked to review identity documents, support requests, Listening reports, or to publish events and resources if you are an admin.',
          'You act as a volunteer for a community platform. You do not become a doctor, lawyer, social worker, or emergency responder by taking this role.',
        ],
        review: review('Volunteer vs employee status', [
          'Confirm volunteer status under US/India labour law, expense reimbursement, and background-check requirements.',
          'Confirm whether moderators must be 18+ and located in specific countries.',
        ]),
      },
      {
        heading: '2. Confidentiality',
        paragraphs: [
          'Do not copy, download, or share identity documents except through the product’s signed-URL flow. Do not paste ID numbers into notes, email, or chat — we do not store those numbers.',
          'Support requests and Listening reports may contain sensitive stories. Discuss them only with other authorised reviewers inside the product.',
        ],
      },
      {
        heading: '3. What you must not do',
        paragraphs: [
          'Do not give medical, legal, or immigration advice. Do not tell someone you will keep them safe or find them a job.',
          'Do not contact a member off-platform about their support request unless the product workflow expressly assigns you that task and the member asked to be contacted.',
        ],
      },
      {
        heading: '4. Records',
        paragraphs: [
          'Actions you take (approve, reject, add a note, resolve a report) are written to an audit log. Do not attempt to delete that log.',
        ],
      },
      {
        heading: '5. Stepping down',
        paragraphs: [
          'You may leave the volunteer role at any time by writing to houston@shaktiworld.org. Access will be removed. Confidentiality continues after you leave.',
        ],
      },
    ],
  },

  content: {
    slug: 'content-policy',
    title: 'Content Policy',
    version: CURRENT_LEGAL.content,
    updated: LEGAL_UPDATED,
    summary:
      'What may be published on Shaktiworld, who can publish it, and how we handle removal. This is a draft enforcement policy, not a court order.',
    sections: [
      {
        heading: '1. Who can publish',
        paragraphs: [
          'Events and in-house Resources are admin-created only. Members may publish Listening posts, replies, job notices, seeker profiles, business listings, and support requests, subject to verification and these rules.',
        ],
      },
      {
        heading: '2. Prohibited content',
        paragraphs: [
          'We do not allow: sexual content involving minors; credible threats; doxxing; malware; spam; fraudulent job or business listings; or content that offers medical treatment, legal representation, or emergency response as if it came from Shaktiworld.',
        ],
        review: review('Illegal-content duties', [
          'Map IT Act / intermediary rules (India) and US DMCA / CDA 230 posture.',
          'Confirm CSAM reporting obligations and a designated grievance officer if required.',
          'Confirm whether political advertising or fundraising needs extra rules.',
        ]),
      },
      {
        heading: '3. Visibility',
        paragraphs: [
          'Support requests default to private-to-moderators for domestic violence and dowry categories. Listening posts from accounts less than seven days old go to a pre-publication queue.',
        ],
      },
      {
        heading: '4. Removal',
        paragraphs: [
          'We may hide, refuse, or delete content that breaks this policy or the law. We may not notify you in every case, especially where notice could increase risk to another person.',
        ],
        review: review('Notice-and-takedown procedure', [
          'Draft a user-facing appeals path if required by law.',
          'Confirm preservation of removed content for investigations.',
        ]),
      },
      {
        heading: '5. Intellectual property',
        paragraphs: [
          'You keep rights in what you create. You grant Shaktiworld a licence to host and display it on the service. Do not upload work you do not have the right to share.',
        ],
        review: review('Licence scope', [
          'Confirm whether the licence should be worldwide, royalty-free, and survive account deletion for residual backups.',
        ]),
      },
    ],
  },
}

export const legalNav = [
  { to: '/terms', slug: 'terms', label: 'Terms of Use' },
  { to: '/privacy', slug: 'privacy', label: 'Privacy Policy' },
  { to: '/community-guidelines', slug: 'guidelines', label: 'Community Guidelines' },
  { to: '/volunteer-agreement', slug: 'volunteer', label: 'Volunteer / Moderator Agreement' },
  { to: '/content-policy', slug: 'content', label: 'Content Policy' },
]
