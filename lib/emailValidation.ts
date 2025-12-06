// Email validation to prevent fake/spam emails

// List of common disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email',
  'temp-mail.org',
  'yopmail.com',
  'getnada.com',
  'mohmal.com',
  'fakeinbox.com',
  'trashmail.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'bccto.me',
  'chitthi.in',
  'dispostable.com',
  'emailondeck.com',
  'fakemailgenerator.com',
  'maildrop.cc',
  'meltmail.com',
  'mintemail.com',
  'mytrashmail.com',
  'putthisinyourspamdatabase.com',
  'spamgourmet.com',
  'spamhole.com',
  'tempail.com',
  'tempinbox.co.uk',
  'tempmail.net',
  'tempmailaddress.com',
  'tmail.ws',
  'tmpmail.net',
  'trbvm.com',
  'trash-amil.com',
  'trashmail.de',
  'trashmailer.com',
  'tyldd.com',
  'wh4f.org',
  'zippymail.info',
]

// Common spam patterns
const SPAM_PATTERNS = [
  /^test\d*@/i,
  /^admin\d*@/i,
  /^noreply\d*@/i,
  /^no-reply\d*@/i,
  /^spam\d*@/i,
  /^fake\d*@/i,
  /^temp\d*@/i,
  /^tmp\d*@/i,
  /^example\d*@/i,
  /^demo\d*@/i,
]

export function isValidEmail(email: string): { valid: boolean; reason?: string } {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Invalid email format' }
  }

  // Require Gmail/Google Mail for verification
  const domain = email.split('@')[1]?.toLowerCase()
  const allowedDomains = ['gmail.com', 'googlemail.com']
  if (domain && !allowedDomains.includes(domain)) {
    return { valid: false, reason: 'Only Gmail addresses (@gmail.com or @googlemail.com) are allowed for verification' }
  }

  // Domain already extracted above for Gmail check
  // Check for disposable email domains (though Gmail requirement should prevent most)
  if (domain && DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return { valid: false, reason: 'Disposable email addresses are not allowed' }
  }

  // Check for spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(email)) {
      return { valid: false, reason: 'Invalid email address' }
    }
  }

  // Check for suspicious domains (very short or numeric-only)
  if (domain) {
    if (domain.length < 4) {
      return { valid: false, reason: 'Invalid email domain' }
    }
    if (/^\d+\./.test(domain)) {
      return { valid: false, reason: 'Invalid email domain' }
    }
  }

  // Check for common typos/malformed emails
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return { valid: false, reason: 'Invalid email format' }
  }

  return { valid: true }
}


