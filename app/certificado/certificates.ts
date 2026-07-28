/**
 * Certificate registry, keyed by URL slug (/certificado/[slug]).
 *
 * Certificate data is intentionally static, not read from the database:
 * a certificate is a snapshot of what was assessed on the issue date, so it
 * must not silently change if the pets table is edited later. It is also a
 * public page, and the pets table is protected by family-scoped RLS, so an
 * anonymous request could not read it anyway.
 *
 * To issue a new certificate, add an entry here.
 */

interface Bilingual {
  es: string
  en: string
}

export interface Certificate {
  number: string
  issuedOn: string
  validUntil: string
  title: Bilingual
  subtitle: Bilingual
  animal: {
    name: string
    species: Bilingual
    breed: Bilingual
    sex: Bilingual
    birthDate: string
  }
  owners: { name: string; idLabel: string; id: string }[]
  contactEmail: string
  professional: {
    name: string
    title: Bilingual
    registration: string
  }
  issuer: {
    name: string
    nit: string
    email: string
  }
  /**
   * Attestation prose, split so the page can bold the issuer and animal name:
   * "{issuer} {intro} {ANIMAL NAME}{body}"
   */
  attestation: {
    intro: Bilingual
    body: Bilingual
  }
}

export const CERTIFICATES: Record<string, Certificate> = {
  kora: {
    number: 'MS-2026-07-0001',
    issuedOn: '2026-07-26',
    validUntil: '2028-07-31',
    title: { es: 'Certificado de Entrenamiento', en: 'Training Certificate' },
    subtitle: {
      es: 'Perro de asistencia y apoyo emocional',
      en: 'Assistance & Emotional Support Dog',
    },
    animal: {
      name: 'Kora',
      species: { es: 'Canino', en: 'Canine' },
      breed: { es: 'Criolla (mestiza)', en: 'Criolla (mixed breed)' },
      sex: { es: 'Hembra', en: 'Female' },
      birthDate: '2021-05-18',
    },
    owners: [
      { name: 'Katherine Giraldo Garcés', idLabel: 'C.C.', id: '1152186995' },
      { name: 'Juan Camilo Agudelo', idLabel: 'C.C.', id: '3438286' },
    ],
    contactEmail: 'ktgiraldogarces@gmail.com',
    professional: {
      name: 'Natalia Fontán Espinal',
      title: {
        es: 'Médica Veterinaria Zootecnista, CES',
        en: 'Doctor of Veterinary Medicine & Animal Science, CES',
      },
      registration: 'T.P. 37688 COMVEZCOL',
    },
    issuer: {
      name: 'MedServ',
      nit: '901946461',
      email: 'coordinacionmed@medserv.com.co',
    },
    attestation: {
      intro: {
        es: 'hace constar que la canina',
        en: 'certifies that the dog',
      },
      body: {
        es: ', identificada en este documento, ha completado satisfactoriamente el programa de entrenamiento avanzado como perro de asistencia y apoyo emocional impartido por esta entidad. Durante el proceso, la canina demostró obediencia bajo distintos niveles de distracción, comportamiento estable y socialmente apropiado en espacios públicos, y la ejecución consistente de las tareas de asistencia y acompañamiento para las que fue entrenada. La valoración final del comportamiento y del estado de salud fue realizada por la profesional que suscribe este documento.',
        en: ', identified in this document, has successfully completed the advanced assistance and emotional support dog training programme delivered by this organisation. Throughout the programme she demonstrated obedience under varying levels of distraction, stable and socially appropriate behaviour in public settings, and consistent performance of the assistance and companionship tasks for which she was trained. The final behavioural and health assessment was carried out by the professional signing below.',
      },
    },
  },
}
