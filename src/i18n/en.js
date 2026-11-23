/* English copy — every string shown on the website. */

const en = {
  htmlLang: 'en',
  langName: 'English',

  meta: {
    title: 'Wushu Sport Academy — 2027 Student Registration',
    formTitle: 'Student registration — Wushu Sport Academy',
    successTitle: 'Registration complete — Wushu Sport Academy',
    description:
      'Register for Wushu Sport Academy classes in Malaysia. Review the agreement, sign digitally, choose your term fees and upload your payment receipt — all in one place.',
  },

  langToggle: { label: 'Language', en: 'EN', zh: '中文' },

  hero: {
    intake: '2027 Intake · Registration open',
    headlineTop: 'Train the body.',
    headlineAccent: 'Forge the spirit.',
    subhead:
      'A modern Wushu programme for young athletes — discipline, precision and confidence, taught by national-level coaches. Secure your child’s place for the 2027 season in under four minutes.',
    start: 'Start registration',
    viewFees: 'View 2027 fees',
    highlights: [
      'National-level coaching team',
      'Small class ratios',
      'Competition & performance pathway',
    ],
    watermark: '武',
  },

  fees: {
    eyebrow: '2027 Season',
    title: 'Term fees',
    intro:
      'Fees are billed per month and payable at the start of each month. Tick one or more terms during registration — the total is calculated for you.',
    classes: 'classes',
    goodToKnow: 'Good to know:',
    note:
      'Replacement classes are provided only when the academy cancels a session. Parents may not cancel classes on their own.',
    cta: 'Register now',
    close: 'Close',
    termLabel: (term, year) => `Term ${term} · ${year}`,
    classesCount: (sessions) => `${sessions} classes`,
  },

  form: {
    eyebrow: '2027 Intake',
    title: 'Student registration',
    intro:
      'Four short steps: sign the agreement, tell us about the parent and athlete, then choose your term(s) and upload your payment receipt.',
    restored:
      'We restored your draft from this visit — please re-upload your receipt at step 4.',
    backToHome: 'Back to home',
    needHelp: 'Need help?',
    stepOf: (step, total) => `Step ${step} of ${total}`,
    completed: 'Completed',
    continue: 'Continue',
    back: 'Back',
    submit: 'Submit registration',
    submitting: 'Submitting…',
    footerRights: (year, name) => `© ${year} ${name}`,
    previewNote: 'Preview mode — this form is not connected to Google Sheets yet.',

    steps: [
      { title: 'Agreement', meta: 'Terms & signature' },
      { title: 'Parent', meta: 'Your details' },
      { title: 'Athlete', meta: 'Student details' },
      { title: 'Payment', meta: 'Fees & receipt' },
    ],

    agreement: {
      classDetails: {
        title: 'Class details',
        dayLabel: 'Training day',
        timeLabel: 'Time',
        venueLabel: 'Venue',
        note: 'Please check the schedule and venue before you agree to the terms below.',
      },
      title: 'Registration agreement & consent',
      description:
        'Please read the agreement in full, then sign at the bottom of the card. Your signature is turned into an image and attached to a PDF copy of this agreement.',
      boxTitle: 'Terms & Conditions',
      scrollHint: 'Scroll inside the box above to read every clause.',
      consentPre: 'I have read and understood the terms above. I agree to enrol my child at ',
      consentPost:
        ', to pay the class fees every month for the term(s) selected, and to the academy’s arrangement for competitions, performances and events.',
      pdfNote:
        'A PDF agreement containing these terms, your details and this signature is generated automatically and saved to our records. A copy is emailed to you after submission.',
      pdfLanguageNote: 'The signed PDF copy is issued in English.',
      nextLabel: 'I agree, continue',
      footerHint: 'Steps 2–4 take about 3 minutes.',
    },

    signature: {
      label: 'Digital signature',
      awaiting: 'Awaiting signature',
      signed: 'Signed',
      clear: 'Clear',
      placeholder: 'Sign here with your mouse or finger',
      placeholderHint: 'Use your full name as per NRIC',
      note: 'Your signature is converted to an image and attached to the agreement PDF.',
    },

    parent: {
      title: 'Parent / guardian details',
      description:
        'We use these details for the agreement, payment verification and all academy communication.',
      name: 'Full name (as per NRIC)',
      namePlaceholder: 'e.g. Ahmad bin Abdullah',
      ic: 'NRIC (MyKad)',
      icPlaceholder: '900101-14-5678',
      icHint: '12 digits — it is formatted for you as you type.',
      phone: 'Mobile number',
      phonePlaceholder: '012-345 6789',
      phoneHint: 'Malaysian format — 012-345 6789 or 011-2345 6789.',
      email: 'Email address',
      emailPlaceholder: 'you@email.com',
      emailHint: 'The confirmation email and agreement copy go to this address.',
      relationship: 'Relationship with athlete',
      relationshipPlaceholder: 'Please select…',
      relationships: [
        { value: 'mother', label: 'Mother' },
        { value: 'father', label: 'Father' },
        { value: 'guardian', label: 'Legal guardian' },
        { value: 'grandparent', label: 'Grandparent' },
        { value: 'sibling', label: 'Sibling' },
        { value: 'other', label: 'Other family member' },
      ],
      footerHint: 'Your details are only shared with the academy admin team.',
    },

    athlete: {
      title: 'Athlete details',
      description:
        'Tell us about the student joining the programme. The NRIC also determines the athlete’s age.',
      name: 'English name (as per NRIC)',
      namePlaceholder: 'e.g. Ahmad Daniel bin Ahmad',
      chineseName: 'Chinese name (as per NRIC)',
      chineseNamePlaceholder: 'e.g. 陈家豪',
      chineseNameHint: 'Used on competition entry forms and certificates.',
      ic: 'NRIC (MyKad)',
      icPlaceholder: '120305-06-7890',
      icHint: 'Age is calculated from the birth year in the NRIC.',
      ageAuto: 'Age (auto-calculated)',
      ageEmpty: 'Enter the NRIC to see the age',
      yearsOld: (age) => `${age} years old`,
      ageNote: 'Based on birth year only, as in the NRIC (month and day are ignored).',
      gender: 'Gender',
      genders: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Prefer not to say', label: 'Prefer not to say' },
      ],
      school: 'Current school',
      schoolPlaceholder: 'e.g. SJK(C) Chung Kwo',
      className: 'Class / level',
      classNamePlaceholder: 'e.g. Standard 4 · Joy',
      footerHint: 'Please double-check the spelling of the name.',
    },

    payment: {
      title: 'Payment & receipt',
      description:
        'Select every term you are enrolling for. The amount due is added up automatically, then transfer and upload your receipt.',
      selectTerms: 'Select payment term(s)',
      noneSelected: 'No term selected yet',
      summary: (count, sessions) =>
        `${count} term${count > 1 ? 's' : ''} · ${sessions} classes`,
      bankTitle: 'Bank transfer details',
      bankVerified: 'Verified',
      labels: {
        bank: 'Bank',
        accountName: 'Account name',
        accountNumber: 'Account number',
      },
      copy: (label) => `Copy ${label}`,
      copied: 'Copied',
      totalDue: 'Total amount due',
      selectAtLeastOne: 'Select at least one term',
      receipt: 'Upload payment receipt',
      required: 'Required',
      bankInstructions:
        'Please transfer the total amount due, then upload a clear screenshot or photo of the transaction receipt below. Registration is only confirmed once our admin has verified the payment.',
      uploadTitle: 'Tap to upload, or drag your file here',
      uploadHint: 'Screenshot or photo of your transfer confirmation · JPG, PNG or PDF · max 12 MB',
      processing: 'Processing your receipt…',
      uploadedReady: 'Uploaded and ready',
      removeReceipt: 'Remove receipt',
      receiptPreview: 'Receipt preview',
      submitAlert:
        'When you press Submit registration, we save your details to our enrolment records, generate your signed agreement PDF and email a copy to you. Our admin team verifies your receipt within one working day.',
      submitNote:
        'Your information and receipt are sent over a secure connection and are only accessible to the academy admin team.',
      footerHint: 'You will receive a confirmation email with your agreement attached.',
    },

    errors: {
      parentName: 'Please enter your full name as per NRIC.',
      nameLetters: 'Please use letters only.',
      parentIc: 'Please enter a valid 12-digit Malaysian NRIC (e.g. 900101-14-5678).',
      parentPhone: 'Please enter a valid Malaysian mobile number (e.g. 012-345 6789).',
      parentEmail: 'Please enter a valid email address.',
      parentRelationship: 'Please select your relationship with the athlete.',
      athleteName: 'Please enter the athlete’s full name.',
      athleteChineseName: 'Please enter the Chinese name.',
      athleteIc: 'Please enter a valid 12-digit Malaysian NRIC.',
      athleteAge:
        'The age could not be calculated — please check the first 6 digits of the NRIC.',
      athleteGender: 'Please select a gender.',
      athleteSchool: 'Please enter the current school.',
      athleteClass: 'Please enter your school class.',
      agreed: 'Please tick the consent checkbox to continue.',
      signature: 'Please sign in the box above.',
      agreementAlert: 'Please tick the consent box and sign in the box before continuing.',
      terms: 'Please select at least one payment term.',
      receipt: 'Please upload your payment receipt.',
      receiptType: 'Please upload an image (JPG, PNG) or a PDF of your payment receipt.',
      fileTooLarge: (mb) => `That file is larger than ${mb} MB. Please upload a smaller file.`,
      fileUnreadable: 'That file could not be read. Please try another one.',
      submit: 'Something went wrong. Please try again.',
    },
  },

  success: {
    title: 'Registration received',
    subtitle: 'Welcome to the Academy',
    leadBefore: (firstName) => `${firstName}. A confirmation email with the signed agreement attached is on its way to `,
    leadAfter: '.',
    reference: 'Reference',
    rows: {
      athlete: 'Athlete',
      parent: 'Parent',
      terms: 'Term(s)',
      total: 'Total paid',
      receipt: 'Receipt',
    },
    receiptUploaded: 'Uploaded',
    download: 'Download agreement',
    backHome: 'Back to home',
    nextTitle: 'What happens next',
    nextSteps: [
      'Our admin verifies your payment receipt.',
      'Keep the agreement PDF safe — it is your signed copy of the terms.',
    ],
    demoTitle: 'Preview mode:',
    demoBody:
      ' no data was stored and no email was sent. Add your Google Apps Script URL to .env to switch the live connection on.',
    noEmail: 'Didn’t get the email within 10 minutes? Check spam, or write to ',
    another: 'Register another athlete',
  },

  terms: {
    heading: 'Terms & Conditions',
    list: [
      'I, the student/parent/guardian, confirm that all information provided above is true and correct.',
      'I understand that Wushu is a high-intensity sport and agree to bear any risk of injury during training.',
      'The Academy reserves the right to adjust training times or venues when necessary and will notify in advance.',
      'Fees paid are strictly non-refundable under all circumstances.',
      'I agree to follow all instructions, rules, and arrangements set by the Academy and coaches.',
      'Replacement classes are only provided when the Academy cancels a session; parents may not cancel classes on their own.',
      'If the student cannot attend due to sickness or other reasons, leave must be applied for with admin and coach; unapproved absences will be recorded.',
      'School team athletes must attend all training, maintain good attitude, and accept strict training and discipline.',
      'Students with injuries or illness should not attend training; any consequences are at their own risk.',
      'If a student is injured during training, parents consent to and authorize us to provide immediate medical assistance, including sending the student to the nearest clinic if needed.',
      'Any injury resulting from fighting between athletes or any accident shall be the sole responsibility of the individuals involved; the Academy will not be liable for any medical fees.',
      'The Academy is not responsible for any valuables belonging to students or parents.',
      'Fighting, quarrelling, bully, poor attitude, or refusing to cooperate with training may result in removal from the school team and the Academy.',
      'Eating, consuming snacks and sweets are not allowed during training.',
      'Parents are not allowed to interfere with professional training plans or discipline set by the coaches.',
      'Parents must send and pick up their children on time and are fully responsible for transport safety.',
      'Training sessions may be recorded or photographed for publicity; parents who do not consent must inform the Academy in writing.',
    ],
  },

  /* Labels used inside the generated agreement PDF (always English). */
  pdf: {
    subtitle: 'STUDENT REGISTRATION & FEE AGREEMENT',
    reference: 'REFERENCE',
    date: 'DATE',
    s1: 'Parent / Guardian particulars',
    s2: 'Athlete particulars',
    s3: 'Enrolled programme & fees',
    s4: 'Terms & conditions',
    s5: 'Declaration & signature',
    parentName: 'Full name (as per NRIC)',
    parentIc: 'NRIC (MyKad)',
    parentPhone: 'Mobile number',
    parentEmail: 'Email address',
    parentRel: 'Relationship with athlete',
    athleteName: 'Full name',
    athleteCn: 'Chinese name',
    athleteIc: 'NRIC',
    athleteAge: 'Age',
    athleteGender: 'Gender',
    athleteSchool: 'Current school',
    athleteClass: 'School Class',
    yearsOld: (age) => `${age} years old`,
    colTerm: 'TERM',
    colPeriod: 'PERIOD',
    colSessions: 'SESSIONS',
    colAmount: 'AMOUNT',
    classes: 'classes',
    totalLabel: 'TOTAL AMOUNT PAYABLE',
    paymentTo: 'Payment to',
    declaration:
      'I, the parent / guardian named above, confirm that I have read and understood the terms and conditions of Wushu Sport Academy, that I enrol my child of my own accord, and that I accept responsibility for the payment of all applicable class fees. I consent to the use of my electronic signature below, which is legally binding and equivalent to a handwritten signature.',
    authorisedSignature: 'AUTHORISED SIGNATURE',
    page: (page, total) => `Page ${page} of ${total}`,
    footerRef: (academy, companyNo, ref) => `${academy} · SSM No. ${companyNo} · Reference ${ref}`,
    generatedNote: 'This document was generated electronically at the time of registration.',
  },
};

export default en;
