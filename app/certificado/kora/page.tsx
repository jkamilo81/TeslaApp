import type { Metadata } from 'next'
import PrintButton from '@/components/PrintButton'

export const metadata: Metadata = {
  title: 'Certificado de Entrenamiento — Kora | MedServ',
  description:
    'Registro privado de entrenamiento emitido por MedServ / Private training record issued by MedServ.',
  robots: { index: false, follow: false },
  // This document is shared outside the family, so it should not carry the
  // host app's branding when saved to a home screen.
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'MedServ' },
}

/**
 * Certificate data is intentionally static.
 *
 * A certificate is a snapshot of what was assessed on the issue date, so it
 * must not silently change if the pets table is edited later. It is also a
 * public page, and the pets table is protected by family-scoped RLS, so an
 * anonymous request could not read it anyway.
 */
const CERT = {
  number: 'MS-2026-07-0001',
  issuedOn: '2026-07-26',
  validUntil: '2028-07-31',
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
    title: { es: 'Médica Veterinaria Zootecnista, CES', en: 'Doctor of Veterinary Medicine & Animal Science, CES' },
    registration: 'T.P. 37688 COMVEZCOL',
  },
  issuer: {
    name: 'MedServ',
    nit: '901946461',
    email: 'coordinacionmed@medserv.com.co',
  },
  verifyUrl: '/certificado/kora',
}

function formatDate(iso: string, locale: 'es-CO' | 'en-GB') {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function yearsBetween(fromIso: string, toIso: string) {
  const from = new Date(`${fromIso}T00:00:00`)
  const to = new Date(`${toIso}T00:00:00`)
  let years = to.getFullYear() - from.getFullYear()
  const monthDelta = to.getMonth() - from.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && to.getDate() < from.getDate())) years--
  return years
}

/** Field row with a Spanish label above its English counterpart. */
function Field({ es, en, value }: { es: string; en: string; value: string }) {
  return (
    <div className="border-b border-neutral-200 py-2.5 print:py-0.5">
      <dt className="font-label text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        <span lang="es">{es}</span>
        <span aria-hidden="true"> / </span>
        <span lang="en">{en}</span>
      </dt>
      <dd className="mt-0.5 font-body text-[15px] font-medium text-neutral-900">{value}</dd>
    </div>
  )
}

export default function KoraCertificatePage() {
  const ageAtIssue = yearsBetween(CERT.animal.birthDate, CERT.issuedOn)

  return (
    <main className="min-h-screen bg-neutral-100 py-8 print:min-h-0 print:bg-white print:py-0">
      {/* Screen-only toolbar */}
      <div className="print-hide mx-auto mb-6 flex max-w-[210mm] flex-col items-start justify-between gap-3 px-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-headline text-xl font-extrabold tracking-tight text-neutral-900">
            Certificado de Kora
          </h1>
          <p className="font-body text-sm text-neutral-600">
            Documento público · Public document
          </p>
        </div>
        <PrintButton label="Imprimir / Print" />
      </div>

      <article className="cert-sheet ambient-shadow-lg print:shadow-none">
        <div className="flex min-h-full flex-col border-[6px] border-double border-primary/70 p-10 sm:p-12 print:min-h-0">
          {/* Issuer header */}
          <header className="flex items-start justify-between gap-6 border-b border-neutral-300 pb-6 print:pb-2">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary font-headline text-lg font-extrabold text-white print:h-11 print:w-11 print:text-base"
                aria-hidden="true"
              >
                MS
              </div>
              <div>
                <p className="font-headline text-2xl font-extrabold leading-none tracking-tight text-primary">
                  {CERT.issuer.name}
                </p>
                <p className="mt-1 font-body text-xs leading-relaxed text-neutral-600">
                  NIT {CERT.issuer.nit}
                  <br />
                  {CERT.issuer.email}
                </p>
              </div>
            </div>
            <dl className="text-right font-body text-xs text-neutral-600">
              <dt className="font-semibold uppercase tracking-wider text-neutral-500">
                <span lang="es">Certificado N.º</span>
                <span aria-hidden="true"> / </span>
                <span lang="en">Certificate No.</span>
              </dt>
              <dd className="font-mono text-sm font-semibold text-neutral-900">{CERT.number}</dd>
            </dl>
          </header>

          {/* Title */}
          <div className="pt-8 text-center print:pt-4">
            <h2 className="font-headline text-[26px] font-extrabold uppercase leading-tight tracking-[0.06em] text-neutral-900 print:text-[21px]">
              <span lang="es">Certificado de Entrenamiento</span>
            </h2>
            <p lang="en" className="mt-1 font-headline text-lg font-bold uppercase tracking-[0.08em] text-neutral-500 print:text-sm">
              Training Certificate
            </p>
            <p className="mx-auto mt-3 max-w-xl font-body text-sm text-neutral-600 print:mt-2 print:text-xs">
              <span lang="es">Perro de asistencia y apoyo emocional</span>
              <span aria-hidden="true"> · </span>
              <span lang="en">Assistance &amp; Emotional Support Dog</span>
            </p>
          </div>

          {/* Validity */}
          <div className="mt-7 grid grid-cols-2 gap-4 rounded-lg bg-neutral-50 px-5 py-4 print:mt-3 print:py-2">
            <div>
              <p className="font-label text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                <span lang="es">Fecha de emisión</span>
                <span aria-hidden="true"> / </span>
                <span lang="en">Date of issue</span>
              </p>
              <p className="mt-0.5 font-body text-sm font-semibold text-neutral-900">
                {formatDate(CERT.issuedOn, 'es-CO')}
              </p>
            </div>
            <div>
              <p className="font-label text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                <span lang="es">Válido hasta</span>
                <span aria-hidden="true"> / </span>
                <span lang="en">Valid until</span>
              </p>
              <p className="mt-0.5 font-body text-sm font-semibold text-neutral-900">
                {formatDate(CERT.validUntil, 'es-CO')}
              </p>
            </div>
          </div>

          {/* Animal + owners */}
          <div className="mt-8 grid gap-x-10 gap-y-0 sm:grid-cols-2 print:mt-4">
            <section>
              <h3 className="font-headline text-sm font-bold uppercase tracking-[0.1em] text-primary">
                <span lang="es">Datos del animal</span>
                <span aria-hidden="true"> / </span>
                <span lang="en">Animal details</span>
              </h3>
              <dl className="mt-2">
                <Field es="Nombre" en="Name" value={CERT.animal.name} />
                <Field es="Especie" en="Species" value={`${CERT.animal.species.es} / ${CERT.animal.species.en}`} />
                <Field es="Raza" en="Breed" value={CERT.animal.breed.es} />
                <Field es="Sexo" en="Sex" value={`${CERT.animal.sex.es} / ${CERT.animal.sex.en}`} />
                <Field
                  es="Fecha de nacimiento"
                  en="Date of birth"
                  value={`${formatDate(CERT.animal.birthDate, 'es-CO')} (${ageAtIssue} años / ${ageAtIssue} years)`}
                />
              </dl>
            </section>

            <section className="mt-8 sm:mt-0">
              <h3 className="font-headline text-sm font-bold uppercase tracking-[0.1em] text-primary">
                <span lang="es">Propietarios</span>
                <span aria-hidden="true"> / </span>
                <span lang="en">Owners</span>
              </h3>
              <dl className="mt-2">
                {CERT.owners.map((owner) => (
                  <Field
                    key={owner.id}
                    es="Propietario"
                    en="Owner"
                    value={`${owner.name} — ${owner.idLabel} ${owner.id}`}
                  />
                ))}
                <Field es="Correo de contacto" en="Contact email" value={CERT.contactEmail} />
              </dl>
            </section>
          </div>

          {/* Attestation */}
          <section className="mt-8 grid gap-6 print:mt-4 print:gap-4 sm:grid-cols-2">
            <p lang="es" className="font-body text-[13.5px] leading-relaxed text-neutral-800 print:text-[10.5px] print:leading-snug">
              <span className="font-semibold">{CERT.issuer.name}</span> hace constar que la canina{' '}
              <span className="font-semibold">{CERT.animal.name.toUpperCase()}</span>, identificada en este
              documento, ha completado satisfactoriamente el programa de entrenamiento avanzado como perro de
              asistencia y apoyo emocional impartido por esta entidad. Durante el proceso, la canina demostró
              obediencia bajo distintos niveles de distracción, comportamiento estable y socialmente apropiado en
              espacios públicos, y la ejecución consistente de las tareas de asistencia y acompañamiento para las
              que fue entrenada. La valoración final del comportamiento y del estado de salud fue realizada por la
              profesional que suscribe este documento.
            </p>
            <p lang="en" className="border-t border-dashed border-neutral-300 pt-4 font-body text-[13.5px] leading-relaxed text-neutral-800 print:text-[10.5px] print:leading-snug sm:border-l sm:border-t-0 sm:border-solid sm:pl-6 sm:pt-0">
              <span className="font-semibold">{CERT.issuer.name}</span> certifies that the dog{' '}
              <span className="font-semibold">{CERT.animal.name.toUpperCase()}</span>, identified in this
              document, has successfully completed the advanced assistance and emotional support dog training
              programme delivered by this organisation. Throughout the programme she demonstrated obedience under
              varying levels of distraction, stable and socially appropriate behaviour in public settings, and
              consistent performance of the assistance and companionship tasks for which she was trained. The
              final behavioural and health assessment was carried out by the professional signing below.
            </p>
          </section>

          {/* Signature */}
          <section className="mt-10 mb-10 flex justify-end print:mt-3 print:mb-3">
            <div className="w-full max-w-xs text-center">
              <div className="h-12 print:h-5" />
              <div className="border-t border-neutral-800 pt-2">
                <p className="font-headline text-base font-bold text-neutral-900">{CERT.professional.name}</p>
                <p lang="es" className="mt-0.5 font-body text-xs text-neutral-700">
                  {CERT.professional.title.es}
                </p>
                <p className="font-body text-xs font-semibold text-neutral-800">
                  {CERT.professional.registration}
                </p>
              </div>
            </div>
          </section>

          {/* Scope of the document */}
          <aside className="mt-auto rounded-lg border border-neutral-300 bg-neutral-50 px-5 py-4 print:py-3">
            <h4 className="mb-2 font-label text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-600">
              <span lang="es">Alcance de este documento</span>
              <span aria-hidden="true"> / </span>
              <span lang="en">Scope of this document</span>
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <p lang="es" className="font-body text-[9.5px] leading-snug text-neutral-600 print:leading-tight">
              Este certificado es un registro privado emitido por {CERT.issuer.name} y refleja únicamente el
              entrenamiento impartido por esta entidad y la valoración de la profesional firmante. No constituye
              una certificación oficial ni un registro gubernamental. No está avalado, acreditado ni respaldado por
              Assistance Dogs International, IAABC, US Service Animals ni ninguna otra entidad acreditadora. Por sí
              solo no confiere derechos de acceso a espacios públicos, transporte aéreo ni vivienda: dichos
              derechos se rigen por la legislación aplicable en cada jurisdicción.
            </p>
            <p lang="en" className="font-body text-[9.5px] leading-snug text-neutral-600 print:leading-tight">
              This certificate is a private record issued by {CERT.issuer.name} and reflects only the training
              delivered by this organisation and the assessment of the signing professional. It is not an official
              or government certification. It is not endorsed, accredited or otherwise backed by Assistance Dogs
              International, IAABC, US Service Animals or any other accrediting body. On its own it does not grant
              rights of access to public spaces, air travel or housing; such rights are governed by the applicable
              law of each jurisdiction.
            </p>
            </div>
          </aside>

          {/* Footer */}
          <footer className="mt-5 flex items-end justify-between gap-4 border-t border-neutral-300 pt-4 print:mt-3 print:pt-3">
            <p className="font-body text-[10px] leading-snug text-neutral-500">
              {CERT.issuer.name} · NIT {CERT.issuer.nit} · {CERT.issuer.email}
            </p>
            <p className="font-mono text-[10px] text-neutral-500">{CERT.number}</p>
          </footer>
        </div>
      </article>
    </main>
  )
}
