export type Lang = 'en' | 'ta'

export const LANG_COOKIE = 'na_lang'

type Entry = { en: string; ta: string }

/**
 * Central English/Tamil dictionary. Tamil strings are written in plain,
 * everyday language so a first-time user with basic literacy can follow.
 */
const dict = {
  // ---- Brand / shell -------------------------------------------------------
  appName: { en: 'Namma Avadi', ta: 'நம்மா ஆவடி' },
  tagline: { en: 'TVK Member System', ta: 'TVK உறுப்பினர் அமைப்பு' },
  home: { en: 'Home', ta: 'முகப்பு' },
  adminLogin: { en: 'Admin Login', ta: 'நிர்வாக உள்நுழைவு' },
  dashboard: { en: 'Dashboard', ta: 'டாஷ்போர்டு' },
  members: { en: 'Members', ta: 'உறுப்பினர்கள்' },
  wardOverview: { en: 'Ward Overview', ta: 'வார்டு மேலோட்டம்' },
  reports: { en: 'Reports & Export', ta: 'அறிக்கைகள்' },
  settings: { en: 'Settings', ta: 'அமைப்புகள்' },
  logout: { en: 'Logout', ta: 'வெளியேறு' },
  openMenu: { en: 'Open menu', ta: 'மெனுவைத் திற' },
  closeMenu: { en: 'Close menu', ta: 'மெனுவை மூடு' },

  // ---- Language toggle -----------------------------------------------------
  english: { en: 'English', ta: 'English' },
  tamil: { en: 'தமிழ்', ta: 'தமிழ்' },
  changeLanguage: { en: 'Change language', ta: 'மொழியை மாற்று' },

  // ---- Common actions ------------------------------------------------------
  save: { en: 'Save changes', ta: 'சேமி' },
  saving: { en: 'Saving…', ta: 'சேமிக்கிறது…' },
  cancel: { en: 'Cancel', ta: 'ரத்து செய்' },
  edit: { en: 'Edit', ta: 'திருத்து' },
  view: { en: 'View', ta: 'பார்க்க' },
  remove: { en: 'Remove', ta: 'நீக்கு' },
  delete: { en: 'Delete', ta: 'நீக்கு' },
  confirm: { en: 'Confirm', ta: 'உறுதி செய்' },
  download: { en: 'Download', ta: 'பதிவிறக்கு' },
  copy: { en: 'Copy', ta: 'நகல்' },
  search: { en: 'Search', ta: 'தேடுக' },
  apply: { en: 'Apply', ta: 'பயன்படுத்து' },
  clear: { en: 'Clear', ta: 'அழி' },
  previous: { en: 'Previous', ta: 'முந்தையது' },
  next: { en: 'Next', ta: 'அடுத்தது' },
  pageOf: { en: 'Page', ta: 'பக்கம்' },
  of: { en: 'of', ta: '/' },
  total: { en: 'Total', ta: 'மொத்தம்' },
  membersUnit: { en: 'members', ta: 'உறுப்பினர்கள்' },
  memberUnit: { en: 'member', ta: 'உறுப்பினர்' },
  viewAll: { en: 'View all', ta: 'எல்லாம் பார்க்க' },

  // ---- Field labels (shared by registration + admin profile) ---------------
  fullName: { en: 'Full Name *', ta: 'முழு பெயர் *' },
  fatherName: { en: "Father's Name *", ta: 'தந்தையின் பெயர் *' },
  mobileNumber: { en: 'Mobile Number *', ta: 'கைபேசி எண் *' },
  dateOfBirth: { en: 'Date of Birth *', ta: 'பிறந்த தேதி *' },
  email: { en: 'Email *', ta: 'மின்னஞ்சல் *' },
  address: { en: 'Address *', ta: 'முகவரி *' },
  aadhaarNumber: { en: 'Aadhaar Number *', ta: 'ஆதார் எண் *' },
  voterId: { en: 'Voter ID *', ta: 'வாக்காளர் அட்டை எண் *' },
  place: { en: 'Place *', ta: 'இடம் *' },
  ward: { en: 'Ward *', ta: 'வார்டு *' },
  religion: { en: 'Religion *', ta: 'மதம் *' },
  community: { en: 'Community (Caste name) *', ta: 'சமூகம் (சாதிப் பெயர்) *' },
  casteCategory: { en: 'Caste Category *', ta: 'வகுப்பு பிரிவு *' },
  occupation: { en: 'Occupation *', ta: 'தொழில் *' },
  bloodGroup: { en: 'Blood Group *', ta: 'இரத்த வகை *' },
  registeredOn: { en: 'Registered', ta: 'பதிவு தேதி' },
  tvkIdDoc: { en: 'TVK ID', ta: 'TVK அட்டை' },
  photoDoc: { en: 'Photo', ta: 'புகைப்படம்' },
  aadhaarDoc: { en: 'Aadhaar', ta: 'ஆதார்' },
  voterIdDoc: { en: 'Voter ID', ta: 'வாக்காளர் அட்டை' },

  selectPlace: { en: 'Select place…', ta: 'இடத்தைத் தேர்ந்தெடுங்கள்…' },
  selectWard: { en: 'Select ward…', ta: 'வார்டைத் தேர்ந்தெடுங்கள்…' },
  selectReligion: { en: 'Select religion…', ta: 'மதத்தைத் தேர்ந்தெடுங்கள்…' },
  selectCasteCategory: { en: 'Select category…', ta: 'பிரிவைத் தேர்ந்தெடுங்கள்…' },
  selectBloodGroup: { en: 'Select blood group…', ta: 'இரத்த வகையைத் தேர்ந்தெடுங்கள்…' },

  // ---- Placeholders --------------------------------------------------------
  phFullName: { en: 'e.g. Murugan K', ta: 'எ.கா. முருகன் க' },
  phFatherName: { en: "e.g. Kannan M", ta: 'எ.கா. கண்ணன் ம' },
  phMobile: { en: '10-digit mobile', ta: '10 எண்ணிலான கைபேசி எண்' },
  phEmail: { en: 'name@example.com', ta: 'name@example.com' },
  phAddress: {
    en: 'House no, street, area, city',
    ta: 'வீட்டு எண், தெரு, பகுதி, நகரம்',
  },
  phAadhaar: { en: '12-digit Aadhaar', ta: '12 எண்ணிலான ஆதார் எண்' },
  phVoterId: { en: 'e.g. ABC1234567', ta: 'எ.கா. ABC1234567' },
  phOccupation: {
    en: 'e.g. Farmer, Driver, Teacher',
    ta: 'எ.கா. விவசாயம், ஓட்டுநர், ஆசிரியர்',
  },
  phCommunity: {
    en: 'Type your caste / community name',
    ta: 'உங்கள் சாதி / சமூகப் பெயரை எழுதுங்கள்',
  },

  // ---- Validation messages -------------------------------------------------
  errRequired: { en: 'This field is required.', ta: 'இந்தப் புலம் அவசியம்.' },
  errFullName: { en: 'Full name is required.', ta: 'முழு பெயர் அவசியம்.' },
  errFatherName: { en: "Father's name is required.", ta: 'தந்தையின் பெயர் அவசியம்.' },
  errMobile: { en: 'Enter a valid 10-digit mobile number.', ta: 'சரியான 10 எண்ணிலான கைபேசி எண்ணை உள்ளிடுங்கள்.' },
  errMobileRequired: { en: 'Mobile number is required.', ta: 'கைபேசி எண் அவசியம்.' },
  errDobRequired: { en: 'Date of birth is required.', ta: 'பிறந்த தேதி அவசியம்.' },
  errDobFuture: { en: 'Date of birth cannot be in the future.', ta: 'பிறந்த தேதி எதிர்காலத்தில் இருக்க முடியாது.' },
  errEmailRequired: { en: 'Email is required.', ta: 'மின்னஞ்சல் அவசியம்.' },
  errEmailInvalid: { en: 'Enter a valid email address.', ta: 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடுங்கள்.' },
  errAddress: { en: 'Address is required.', ta: 'முகவரி அவசியம்.' },
  errAadhaarRequired: { en: 'Aadhaar number is required.', ta: 'ஆதார் எண் அவசியம்.' },
  errAadhaarInvalid: { en: 'Enter a valid 12-digit Aadhaar number.', ta: 'சரியான 12 எண்ணிலான ஆதார் எண்ணை உள்ளிடுங்கள்.' },
  errVoterRequired: { en: 'Voter ID is required.', ta: 'வாக்காளர் அட்டை எண் அவசியம்.' },
  errVoterInvalid: { en: 'Enter a valid Voter ID (e.g. ABC1234567).', ta: 'சரியான வாக்காளர் எண்ணை உள்ளிடுங்கள் (எ.கா. ABC1234567).' },
  errPlaceRequired: { en: 'Please select a place.', ta: 'இடத்தைத் தேர்ந்தெடுங்கள்.' },
  errWardRequired: { en: 'Please select a ward.', ta: 'வார்டைத் தேர்ந்தெடுங்கள்.' },
  errWardRange: { en: 'Selected ward is not valid for this place.', ta: 'இந்த இடத்திற்கு இந்த வார்டு பொருந்தாது.' },
  errReligionRequired: { en: 'Please select a religion.', ta: 'மதத்தைத் தேர்ந்தெடுங்கள்.' },
  errCommunityRequired: { en: 'Community name is required.', ta: 'சமூகப் பெயர் அவசியம்.' },
  errCasteRequired: { en: 'Please select a caste category.', ta: 'வகுப்பு பிரிவைத் தேர்ந்தெடுங்கள்.' },
  errOccupationRequired: { en: 'Occupation is required.', ta: 'தொழில் அவசியம்.' },
  errBloodRequired: { en: 'Please select a blood group.', ta: 'இரத்த வகையைத் தேர்ந்தெடுங்கள்.' },
  errReviewFields: { en: 'Please review the highlighted fields.', ta: 'குறிக்கப்பட்ட புலங்களை சரிபார்த்து சரிசெய்யுங்கள்.' },
  errSubmitRequired: { en: 'Please fill all the required fields to submit the form.', ta: 'சமர்ப்பிக்க அனைத்து அவசியப் புலங்களையும் நிரப்புங்கள்.' },
  errFileType: { en: 'files are allowed only.', ta: 'கோப்புகள் மட்டுமே அனுமதிக்கப்படும்.' },
  errFileSize: { en: 'File size must be 5 MB or less.', ta: 'கோப்பின் அளவு 5 MB-க்கு குறைவாக இருக்க வேண்டும்.' },
  errDocRequired: { en: 'This document is required.', ta: 'இந்த ஆவணம் அவசியம்.' },

  // ---- Registration form ---------------------------------------------------
  regTitle: { en: 'TVK Member Registration', ta: 'TVK உறுப்பினர் பதிவு' },
  regSubtitle: {
    en: 'Thiruninravur · Avadi · Thiruverkadu',
    ta: 'திருநின்றவூர் · ஆவடி · திருவேற்காடு',
  },
  stepPersonal: { en: 'Personal Details', ta: 'தனிப்பட்ட விவரங்கள்' },
  stepIdentity: { en: 'Identity', ta: 'அடையாள விவரங்கள்' },
  stepPlaceWard: { en: 'Place & Ward', ta: 'இடம் & வார்டு' },
  stepCommunity: { en: 'Community Details', ta: 'சமூக விவரங்கள்' },
  stepDocuments: { en: 'Documents', ta: 'ஆவணங்கள்' },
  docsNoteBadge: { en: 'Required · max 5 MB each', ta: 'அவசியம் · ஒவ்வொன்றும் அதிகபட்சம் 5 MB' },
  docsNoteFooter: {
    en: 'All four documents are required. They are uploaded securely and stored privately.',
    ta: 'நான்கு ஆவணங்களும் அவசியம். அவை பாதுகாப்பாக பதிவேற்றப்பட்டு தனியார் இடத்தில் சேமிக்கப்படும்.',
  },
  chooseFile: { en: 'Choose file', ta: 'கோப்பைத் தேர்வு செய்' },
  uploading: { en: 'Uploading', ta: 'பதிவேற்றுகிறது' },
  registerMember: { en: 'Register Member', ta: 'உறுப்பினரைப் பதிவு செய்' },
  registering: { en: 'Registering…', ta: 'பதிவு செய்யப்படுகிறது…' },
  successTitle: { en: 'Member registered successfully.', ta: 'உறுப்பினர் வெற்றிகரமாகப் பதிவு செய்யப்பட்டார்.' },
  successBody: {
    en: 'The member has been added to the Namma Avadi database.',
    ta: 'உறுப்பினர் நம்மா ஆவடி பட்டியலில் சேர்க்கப்பட்டார்.',
  },
  memberId: { en: 'Member ID', ta: 'உறுப்பினர் எண்' },
  copyMemberId: { en: 'Copy Member ID', ta: 'உறுப்பினர் எண்ணை நகலெடு' },
  memberIdCopied: { en: 'Member ID copied!', ta: 'உறுப்பினர் எண் நகலெடுக்கப்பட்டது!' },
  viewMemberProfile: { en: 'View Member Profile', ta: 'உறுப்பினர் விவரத்தைப் பார்' },
  registerAnother: { en: 'Register another member', ta: 'மற்றொரு உறுப்பினரைப் பதிவு செய்' },
  duplicateTitle: { en: 'Possible existing member found', ta: 'ஏற்கனவே பதிவு செய்யப்பட்ட உறுப்பினர் இருக்கலாம்' },
  duplicateBody: {
    en: 'This mobile, Aadhaar or Voter ID may already be registered. Please verify before continuing.',
    ta: 'இந்தக் கைபேசி எண், ஆதார் அல்லது வாக்காளர் எண் ஏற்கனவே பதிவு செய்யப்பட்டிருக்கலாம். தொடரும் முன் சரிபார்க்கவும்.',
  },
  registerAnyway: { en: 'Register anyway', ta: 'இருந்தும் பதிவு செய்' },

  // ---- Home page -----------------------------------------------------------
  homeBadge: { en: 'Thiruninravur · Avadi · Thiruverkadu', ta: 'திருநின்றவூர் · ஆவடி · திருவேற்காடு' },
  homeTitle: { en: 'TVK Member Registration & Tracking', ta: 'TVK உறுப்பினர் பதிவு & கண்காணிப்பு' },
  homeBody: {
    en: 'Register TVK members, track place and ward-wise distribution, manage profiles with documents, and export reports — all in one secure system.',
    ta: 'TVK உறுப்பினர்களைப் பதிவு செய்யுங்கள், இடம் மற்றும் வார்டு வாரியாகக் கண்காணியுங்கள், ஆவணங்களுடன் நிர்வகியுங்கள், அறிக்கைகளை பதிவிறக்குங்கள் — எல்லாம் ஒரே பாதுகாப்பான அமைப்பில்.',
  },
  registerAMember: { en: 'Register a Member', ta: 'உறுப்பினரைப் பதிவு செய்' },
  adminDashboard: { en: 'Admin Dashboard', ta: 'நிர்வாக டாஷ்போர்டு' },
  footerNote: { en: 'Authorized access only.', ta: 'அனுமதிக்கப்பட்டவர்கள் மட்டுமே பயன்படுத்த வேண்டும்.' },
  footerReg: {
    en: 'Authorized personnel only · Namma Avadi — TVK Member System',
    ta: 'அனுமதிக்கப்பட்டவர்கள் மட்டுமே · நம்மா ஆவடி — TVK உறுப்பினர் அமைப்பு',
  },

  // ---- Admin login ---------------------------------------------------------
  loginSubtitle: { en: 'TVK Member System — Admin Login', ta: 'TVK உறுப்பினர் அமைப்பு — நிர்வாக உள்நுழைவு' },
  userId: { en: 'User ID', ta: 'பயனர் ஐடி' },
  password: { en: 'Password', ta: 'கடவுச்சொல்' },
  phUserId: { en: 'Enter your user ID', ta: 'உங்கள் பயனர் ஐடியை உள்ளிடுங்கள்' },
  signIn: { en: 'Sign in', ta: 'உள்நுழை' },
  signingIn: { en: 'Signing in…', ta: 'உள்நுழைகிறது…' },
  loginFootnote: {
    en: 'Authorized personnel only. All access is logged and audited.',
    ta: 'அனுமதிக்கப்பட்டவர்கள் மட்டுமே. அனைத்து அணுகலும் பதிவு செய்யப்படும்.',
  },

  // ---- Dashboard -----------------------------------------------------------
  totalMembersLabel: { en: 'Total Members', ta: 'மொத்த உறுப்பினர்கள்' },
  heroSubline: {
    en: 'Across Thiruninravur, Avadi and Thiruverkadu',
    ta: 'திருநின்றவூர், ஆவடி மற்றும் திருவேற்காடு முழுவதும்',
  },
  viewAllMembers: { en: 'View all members', ta: 'எல்லா உறுப்பினர்களையும் பார்' },
  viewWardOverview: { en: 'View ward overview', ta: 'வார்டு மேலோட்டத்தைப் பார்' },
  membersByWard: { en: 'Members by Ward', ta: 'வார்டு வாரியாக உறுப்பினர்கள்' },
  recentRegistrations: { en: 'Recent Registrations', ta: 'சமீபத்திய பதிவுகள்' },
  noMembersYet: { en: 'No members yet', ta: 'இன்னும் உறுப்பினர்கள் இல்லை' },
  noMembersHint: {
    en: 'Members can be added from the registration page.',
    ta: 'பதிவு பக்கத்தின் மூலம் உறுப்பினர்களைச் சேர்க்கலாம்.',
  },
  unableDashboard: { en: 'Unable to load dashboard', ta: 'டாஷ்போர்டை ஏற்ற முடியவில்லை' },
  shareTitle: { en: 'Register Members', ta: 'உறுப்பினர்களைப் பதிவு செய்யுங்கள்' },
  shareBody: {
    en: 'Scan the QR to open the member registration form on any phone, or send the link directly to members via WhatsApp, Messages, Email or any installed app.',
    ta: 'QR-ஐ ஸ்கேன் செய்து எந்த ஃபோனிலும் பதிவு படிவத்தைத் திறலாம், அல்லது இணைப்பை WhatsApp, செய்தி, மின்னஞ்சல் மூலம் நேரடியாக அனுப்பலாம்.',
  },
  invite: { en: 'Invite', ta: 'அழை' },
  opening: { en: 'Opening…', ta: 'திறக்கிறது…' },
  linkCopied: { en: 'Registration link copied.', ta: 'பதிவு இணைப்பு நகலெடுக்கப்பட்டது.' },
  linkShared: { en: 'Registration link shared.', ta: 'பதிவு இணைப்பு பகிரப்பட்டது.' },
  qrAlt: { en: 'QR code for member registration', ta: 'உறுப்பினர் பதிவுக்கான QR குறியீடு' },
  copyLinkAria: { en: 'Copy registration link', ta: 'பதிவு இணைப்பை நகலெடு' },

  // ---- Members list --------------------------------------------------------
  membersTitle: { en: 'Members', ta: 'உறுப்பினர்கள்' },
  membersSub: {
    en: 'Browse and filter all registered TVK members.',
    ta: 'பதிவு செய்யப்பட்ட எல்லா TVK உறுப்பினர்களையும் பாருங்கள்.',
  },
  allPlaces: { en: 'All places', ta: 'எல்லா இடங்களும்' },
  allWards: { en: 'All wards', ta: 'எல்லா வார்டுகளும்' },
  fromDate: { en: 'From date', ta: 'இருந்து தேதி' },
  toDate: { en: 'To date', ta: 'வரை தேதி' },
  quickRange: { en: 'Quick range', ta: 'விரைவு காலம்' },
  allTime: { en: 'All time', ta: 'எல்லா காலமும்' },
  thisWeek: { en: 'This week', ta: 'இந்த வாரம்' },
  thisMonth: { en: 'This month', ta: 'இந்த மாதம்' },
  foundCount: { en: 'found', ta: 'உறுப்பினர்கள் கண்டறியப்பட்டனர்' },
  newestFirst: { en: 'Newest first', ta: 'புதியவை முதலில்' },
  colMember: { en: 'Member', ta: 'உறுப்பினர்' },
  colName: { en: 'Name', ta: 'பெயர்' },
  colMobile: { en: 'Mobile', ta: 'கைபேசி' },
  colWard: { en: 'Ward', ta: 'வார்டு' },
  colPlace: { en: 'Place', ta: 'இடம்' },
  colRegistered: { en: 'Registered', ta: 'பதிவு தேதி' },
  colActions: { en: 'Actions', ta: 'செயல்கள்' },
  colTotalMembers: { en: 'Total Members', ta: 'மொத்த உறுப்பினர்கள்' },
  viewProfile: { en: 'View Profile', ta: 'விவரம் பார்' },
  noMembersFound: { en: 'No members found', ta: 'உறுப்பினர்கள் இல்லை' },
  noMembersFoundHint: {
    en: 'Try adjusting your search or filters. New members can be added from the registration page.',
    ta: 'தேடல் அல்லது வடிகட்டல்களை மாற்றிப் பாருங்கள். புதிய உறுப்பினர்களை பதிவு பக்கத்தில் சேர்க்கலாம்.',
  },
  searchPlaceholder: {
    en: 'Search by Member ID, name, father name, mobile or voter ID…',
    ta: 'உறுப்பினர் எண், பெயர், தந்தையின் பெயர், கைபேசி அல்லது வாக்காளர் எண் மூலம் தேடுங்கள்…',
  },
  wardN: { en: 'Ward', ta: 'வார்டு' },

  // ---- Member profile ------------------------------------------------------
  backToMembers: { en: '← Back to members', ta: '← உறுப்பினர்களுக்கு திரும்பு' },
  personalDetails: { en: 'Personal Details', ta: 'தனிப்பட்ட விவரங்கள்' },
  locationSection: { en: 'Location', ta: 'இருப்பிடம்' },
  identitySection: { en: 'Identity', ta: 'அடையாளம்' },
  documentsSection: { en: 'Documents', ta: 'ஆவணங்கள்' },
  editMember: { en: 'Edit Member', ta: 'உறுப்பினரைத் திருத்து' },
  uploaded: { en: 'Uploaded', ta: 'பதிவேற்றப்பட்டது' },
  noDocsYet: { en: 'No documents uploaded yet.', ta: 'இன்னும் ஆவணங்கள் ஏதும் பதிவேற்றப்படவில்லை.' },
  docsPrivateNote: {
    en: 'Documents are stored privately. Download links expire after one hour.',
    ta: 'ஆவணங்கள் தனியாராக சேமிக்கப்படுகின்றன. பதிவிறக்க இணைப்புகள் ஒரு மணி நேரத்தில் காலாவதியாகும்.',
  },
  addReplaceDocs: { en: 'Add or replace documents (max 5 MB each):', ta: 'ஆவணங்களைச் சேர் அல்லது மாற்று (அதிகபட்சம் 5 MB):' },
  uploadNew: { en: 'Upload new', ta: 'புதியதை பதிவேற்று' },
  permanentlyDeleteQ: { en: 'Permanently delete', ta: 'நிரந்தரமாக நீக்கவா?' },

  // ---- Wards page ----------------------------------------------------------
  wardsSub: {
    en: 'Member distribution across Thiruninravur, Avadi and Thiruverkadu ·',
    ta: 'திருநின்றவூர், ஆவடி, திருவேற்காடு ஆகிய இடங்களில் உறுப்பினர் பரவல் ·',
  },
  totalMembersShort: { en: 'total members', ta: 'மொத்த உறுப்பினர்கள்' },
  viewMembersBtn: { en: 'View members', ta: 'உறுப்பினர்களைப் பார்' },
  unableWardData: { en: 'Unable to load ward data', ta: 'வார்டு தரவை ஏற்ற முடியவில்லை' },

  // ---- Reports -------------------------------------------------------------
  reportsSub: {
    en: 'Export member data and ward summaries. Aadhaar numbers are never exported.',
    ta: 'உறுப்பினர் தரவு மற்றும் வார்டு சுருக்கங்களை பதிவிறக்குங்கள். ஆதார் எண்கள் ஒருபோதும் ஏற்றுமதி செய்யப்படாது.',
  },
  wardSummaryTitle: { en: 'Place & Ward Member Summary', ta: 'இடம் & வார்டு வாரியான சுருக்கம்' },
  wardSummarySub: { en: 'Place-wise and ward-wise member counts with totals.', ta: 'இடம் மற்றும் வார்டு வாரியான உறுப்பினர் எண்ணிக்கை.' },
  exportExcel: { en: 'Export Excel', ta: 'Excel பதிவிறக்கு' },
  exportCsv: { en: 'Export CSV', ta: 'CSV பதிவிறக்கு' },
  unableSummary: { en: 'Unable to load ward summary.', ta: 'வார்டு சுருக்கத்தை ஏற்ற முடியவில்லை.' },
  memberExportTitle: { en: 'Member Data Export', ta: 'உறுப்பினர் தரவு ஏற்றுமதி' },
  memberExportSub: {
    en: 'Export all members, a selected ward, or a filtered set. Aadhaar numbers are never included.',
    ta: 'எல்லா உறுப்பினர்களையும், தேர்ந்தெடுத்த வார்டையும் அல்லது வடிகட்டிய பட்டியலையும் பதிவிறக்கலாம். ஆதார் எண்கள் சேர்க்கப்படாது.',
  },
  exportsNote: {
    en: 'Exports are available only to authorized admins. Exported files contain no Aadhaar numbers.',
    ta: 'ஏற்றுமதி அனுமதிக்கப்பட்ட நிர்வாகிகளுக்கு மட்டுமே. பதிவிறக்கமான கோப்புகளில் ஆதார் எண்கள் இல்லை.',
  },
  registeredFrom: { en: 'Registered from', ta: 'பதிவு இருந்து தேதி' },
  registeredTo: { en: 'Registered to', ta: 'பதிவு வரை தேதி' },

  // ---- Settings ------------------------------------------------------------
  accountSecurity: { en: 'Account and security settings.', ta: 'கணக்கு மற்றும் பாதுகாப்பு அமைப்புகள்.' },
  adminAccount: { en: 'Admin Account', ta: 'நிர்வாகக் கணக்கு' },
  role: { en: 'Role', ta: 'பங்கு' },
  roleAdmin: { en: 'Admin', ta: 'நிர்வாகி' },
  changePasswordTitle: { en: 'Change Password', ta: 'கடவுச்சொல்லை மாற்று' },
  dataPrivacy: { en: 'Data Privacy', ta: 'தரவு தனியுரிமை' },
  privacyBullets: {
    en: 'Member documents are stored in a private bucket — never public URLs.|Aadhaar numbers are masked in all normal views and excluded from exports.|Member data is visible only to authenticated admins.',
    ta: 'உறுப்பினர் ஆவணங்கள் தனியார் இடத்தில் சேமிக்கப்படுகின்றன — பொது இணைப்புகள் இல்லை.|ஆதார் எண்கள் எல்லா இடங்களிலும் மறைக்கப்பட்டு ஏற்றுமதியில் விலக்கப்படுகின்றன.|உறுப்பினர் தரவு உள்நுழைந்த நிர்வாகிகளுக்கு மட்டுமே தெரியும்.',
  },
  newPassword: { en: 'New Password *', ta: 'புதிய கடவுச்சொல் *' },
  confirmPassword: { en: 'Confirm Password *', ta: 'கடவுச்சொல்லை உறுதி செய் *' },
  phNewPassword: { en: 'At least 8 characters', ta: 'குறைந்தது 8 எழுத்துகள்' },
  phConfirmPassword: { en: 'Repeat new password', ta: 'புதிய கடவுச்சொல்லை மீண்டும் உள்ளிடுங்கள்' },
  updatePassword: { en: 'Update Password', ta: 'கடவுச்சொல்லை மாற்று' },
  updating: { en: 'Updating…', ta: 'மாற்றப்படுகிறது…' },
  passwordUpdated: { en: 'Password updated successfully.', ta: 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது.' },
  pwdMinError: { en: 'Password must be at least 8 characters.', ta: 'கடவுச்சொல் குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்.' },
  pwdMismatch: { en: 'Passwords do not match.', ta: 'கடவுச்சொல் பொருந்தவில்லை.' },
} satisfies Record<string, Entry>

export type DictKey = keyof typeof dict

/** Translate helper: t('members') -> localized string. */
export function getT(lang: Lang): (key: DictKey) => string {
  return (key: DictKey) => dict[key][lang]
}

export function tr(lang: Lang, key: DictKey): string {
  return dict[key][lang]
}
