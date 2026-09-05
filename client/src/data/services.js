/**
 * Content for the four Services category landing pages.
 * Each explains what Shaktiworld offers in that area and provides
 * curated external resource links.
 *
 * Copy follows PROJECT_SPEC.md § Non-Goals:
 *  - We connect, inform, and support.
 *  - We are not a crisis service, not legal counsel, not medical providers.
 */
export const serviceCategories = {
  health: {
    slug: 'health',
    title: 'Health',
    heading: 'Access health information and resources',
    description:
      'Browse curated health resources shared by our community. From preventive care and nutrition to reproductive health and elder care, find information that helps you make informed decisions for yourself and your family.',
    disclaimer: 'medical',
    defaultVisibility: 'members_only',
    resources: [
      {
        title: 'WHO Women\u2019s Health',
        url: 'https://www.who.int/health-topics/women-s-health',
        description: 'World Health Organization resources on women\u2019s health topics.',
      },
      {
        title: 'National Health Portal (India)',
        url: 'https://www.nhp.gov.in/',
        description: 'Government of India health information and services.',
      },
      {
        title: 'Planned Parenthood',
        url: 'https://www.plannedparenthood.org/',
        description: 'Reproductive and sexual health information and clinic locator.',
      },
    ],
  },

  mental_wellbeing: {
    slug: 'mental-wellbeing',
    title: 'Mental Wellbeing',
    heading: 'Find support for your mental health',
    description:
      'Explore resources for stress, anxiety, grief, and emotional wellbeing. Whether you\u2019re looking for self-care practices, peer support, or guidance on finding a therapist, our community has curated information to help you take the next step.',
    disclaimer: 'medical',
    defaultVisibility: 'members_only',
    resources: [
      {
        title: 'NIMHANS (India)',
        url: 'https://nimhans.ac.in/',
        description: 'National Institute of Mental Health and Neurosciences — services and helplines.',
      },
      {
        title: 'Mental Health America',
        url: 'https://www.mhanational.org/',
        description: 'Screening tools, resources, and community support.',
      },
      {
        title: 'iCall (Tata Institute)',
        url: 'https://icallhelpline.org/',
        description: 'Free telephone and email-based counselling in India.',
      },
    ],
  },

  domestic_violence: {
    slug: 'domestic-violence',
    title: 'Domestic Violence',
    heading: 'Connect with resources and support',
    description:
      'If you or someone you know is experiencing domestic violence, you are not alone. This section connects you with verified organisations, helplines, and legal information. Your submissions here are private to moderators by default \u2014 they are never shared publicly unless you choose otherwise.',
    disclaimer: 'legal',
    additionalDisclaimer: 'crisis',
    defaultVisibility: 'private_to_moderators',
    resources: [
      {
        title: 'National Commission for Women (India)',
        url: 'https://ncw.nic.in/',
        description: 'File complaints and access legal protections under Indian law.',
      },
      {
        title: 'National Domestic Violence Hotline (US)',
        url: 'https://www.thehotline.org/',
        description: 'Confidential support, safety planning, and local referrals.',
      },
      {
        title: 'Protection of Women from Domestic Violence Act, 2005',
        url: 'https://wcd.nic.in/act/protection-women-domestic-violence-act-2005',
        description: 'Full text of the Indian domestic violence protection law.',
      },
    ],
  },

  dowry: {
    slug: 'dowry',
    title: 'Dowry Support',
    heading: 'Information on dowry laws and support',
    description:
      'Access information about dowry prohibition laws, your legal rights, and support organisations. This section exists to inform and connect \u2014 your privacy is protected, and submissions are private to moderators by default.',
    disclaimer: 'legal',
    additionalDisclaimer: 'crisis',
    defaultVisibility: 'private_to_moderators',
    resources: [
      {
        title: 'Dowry Prohibition Act, 1961',
        url: 'https://wcd.nic.in/act/dowry-prohibition-act-1961',
        description: 'Full text of the Indian anti-dowry law.',
      },
      {
        title: 'Women Helpline 181',
        url: 'https://wcd.nic.in/',
        description: 'Government 24/7 helpline for women in distress.',
      },
      {
        title: 'National Legal Services Authority',
        url: 'https://nalsa.gov.in/',
        description: 'Free legal aid for eligible women across India.',
      },
    ],
  },
}

/**
 * Category key from URL slug.
 */
export function categoryFromSlug(slug) {
  const map = {
    'health': 'health',
    'mental-wellbeing': 'mental_wellbeing',
    'domestic-violence': 'domestic_violence',
    'dowry': 'dowry',
  }
  return map[slug] || null
}
