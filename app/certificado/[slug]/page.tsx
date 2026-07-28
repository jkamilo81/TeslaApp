import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PrintButton from '@/components/PrintButton'
import { CERTIFICATES } from '../certificates'

export function generateStaticParams() {
  return Object.keys(CERTIFICATES).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cert = CERTIFICATES[slug]
  if (!cert) return { title: 'Certificado no encontrado' }
  return {
    title: `${cert.title.es} — ${cert.animal.name} | ${cert.issuer.name}`,
    description: `Registro privado emitido por ${cert.issuer.name} / Private record issued by ${cert.issuer.name}.`,
    robots: { index: false, follow: false },
    // This document is shared outside the family, so it should not carry the
    // host app's branding when saved to a home screen.
    appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: cert.issuer.name },
  }
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

export default async function CertificatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cert = CERTIFICATES[slug]
  if (!cert) notFound()

  const ageAtIssue = yearsBetween(cert.animal.birthDate, cert.issuedOn)
  const issuerInitials = cert.issuer.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <main className="min-h-screen bg-neutral-100 py-8 print:min-h-0 print:bg-white print:py-0">
      {/* Screen-only toolbar */}
      <div className="print-hide mx-auto mb-6 flex max-w-[210mm] flex-col items-start justify-between gap-3 px-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-headline text-xl font-extrabold tracking-tight text-neutral-900">
            Certificado de {cert.animal.name}
          </h1>
          <p className="font-body text-sm text-neutral-600">
            Documento público · Public document
          </p>
        </div>
        <PrintButton label="Imprimir / Print" />
      </div>

      <article className="cert-sheet ambient-shadow-lg print:shadow-none">
        <div className="flex min-h-full flex-col border-[6px] border-double border-primary/70 p-10 sm:p-12 print:min-h-[262mm]">
          {/* Issuer header */}
          <header className="flex items-start justify-between gap-6 border-b border-neutral-300 pb-6 print:pb-2">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary font-headline text-lg font-extrabold text-white print:h-11 print:w-11 print:text-base"
                aria-hidden="true"
              >
                {issuerInitials}
              </div>
              <div>
                <p className="font-headline text-2xl font-extrabold leading-none tracking-tight text-primary">
                  {cert.issuer.name}
                </p>
                <p className="mt-1 font-body text-xs leading-relaxed text-neutral-600">
                  NIT {cert.issuer.nit}
                  <br />
                  {cert.issuer.email}
                </p>
              </div>
            </div>
            <dl className="text-right font-body text-xs text-neutral-600">
              <dt className="font-semibold uppercase tracking-wider text-neutral-500">
                <span lang="es">Certificado N.º</span>
                <span aria-hidden="true"> / </span>
                <span lang="en">Certificate No.</span>
              </dt>
              <dd className="font-mono text-sm font-semibold text-neutral-900">{cert.number}</dd>
            </dl>
          </header>

          {/* Title */}
          <div className="pt-8 text-center print:pt-4">
            <h2 className="font-headline text-[26px] font-extrabold uppercase leading-tight tracking-[0.06em] text-neutral-900 print:text-[21px]">
              <span lang="es">{cert.title.es}</span>
            </h2>
            <p lang="en" className="mt-1 font-headline text-lg font-bold uppercase tracking-[0.08em] text-neutral-500 print:text-sm">
              {cert.title.en}
            </p>
            <p className="mx-auto mt-3 max-w-xl font-body text-sm text-neutral-600 print:mt-2 print:text-xs">
              <span lang="es">{cert.subtitle.es}</span>
              <span aria-hidden="true"> · </span>
              <span lang="en">{cert.subtitle.en}</span>
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
                {formatDate(cert.issuedOn, 'es-CO')}
              </p>
            </div>
            <div>
              <p className="font-label text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                <span lang="es">Válido hasta</span>
                <span aria-hidden="true"> / </span>
                <span lang="en">Valid until</span>
              </p>
              <p className="mt-0.5 font-body text-sm font-semibold text-neutral-900">
                {formatDate(cert.validUntil, 'es-CO')}
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
                <Field es="Nombre" en="Name" value={cert.animal.name} />
                <Field es="Especie" en="Species" value={`${cert.animal.species.es} / ${cert.animal.species.en}`} />
                <Field es="Raza" en="Breed" value={cert.animal.breed.es} />
                <Field es="Sexo" en="Sex" value={`${cert.animal.sex.es} / ${cert.animal.sex.en}`} />
                <Field
                  es="Fecha de nacimiento"
                  en="Date of birth"
                  value={`${formatDate(cert.animal.birthDate, 'es-CO')} (${ageAtIssue} años / ${ageAtIssue} years)`}
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
                {cert.owners.map((owner) => (
                  <Field
                    key={owner.id}
                    es="Propietario"
                    en="Owner"
                    value={`${owner.name} — ${owner.idLabel} ${owner.id}`}
                  />
                ))}
                <Field es="Correo de contacto" en="Contact email" value={cert.contactEmail} />
              </dl>
            </section>
          </div>

          {/* Attestation */}
          <section className="mt-8 grid gap-6 print:mt-4 print:gap-4 sm:grid-cols-2">
            <p lang="es" className="font-body text-[13.5px] leading-relaxed text-neutral-800 print:text-[10.5px] print:leading-snug">
              <span className="font-semibold">{cert.issuer.name}</span> {cert.attestation.intro.es}{' '}
              <span className="font-semibold">{cert.animal.name.toUpperCase()}</span>
              {cert.attestation.body.es}
            </p>
            <p lang="en" className="border-t border-dashed border-neutral-300 pt-4 font-body text-[13.5px] leading-relaxed text-neutral-800 print:text-[10.5px] print:leading-snug sm:border-l sm:border-t-0 sm:border-solid sm:pl-6 sm:pt-0">
              <span className="font-semibold">{cert.issuer.name}</span> {cert.attestation.intro.en}{' '}
              <span className="font-semibold">{cert.animal.name.toUpperCase()}</span>
              {cert.attestation.body.en}
            </p>
          </section>

          {/* Signature */}
          <section className="mt-10 mb-10 flex justify-end print:mt-3 print:mb-3">
            <div className="w-full max-w-xs text-center">
              <div className="h-12 print:h-5" />
              <div className="border-t border-neutral-800 pt-2">
                <p className="font-headline text-base font-bold text-neutral-900">{cert.professional.name}</p>
                <p lang="es" className="mt-0.5 font-body text-xs text-neutral-700">
                  {cert.professional.title.es}
                </p>
                <p className="font-body text-xs font-semibold text-neutral-800">
                  {cert.professional.registration}
                </p>
              </div>
            </div>
          </section>

          {/* Footer — carries a one-line statement of what this document is.
              Kept deliberately brief and unobtrusive, but not removed: without
              it the document reads as an official certification conferring
              access rights, which it is not. */}
          <footer className="mt-auto border-t border-neutral-300 pt-4 print:pt-3">
            <p lang="es" className="font-body text-[9px] leading-snug text-neutral-500">
              Registro privado emitido por {cert.issuer.name}. No constituye una certificación
              oficial ni un registro gubernamental, no está avalado por terceros y por sí solo no confiere derechos
              de acceso.
            </p>
            <p lang="en" className="mt-1 font-body text-[9px] leading-snug text-neutral-500">
              Private record issued by {cert.issuer.name}. It is not an official or government
              certification, is not third-party endorsed, and does not by itself confer access rights.
            </p>
            <div className="mt-3 flex items-end justify-between gap-4 border-t border-neutral-200 pt-3 print:mt-2 print:pt-2">
              <p className="font-body text-[10px] leading-snug text-neutral-500">
                {cert.issuer.name} · NIT {cert.issuer.nit} · {cert.issuer.email}
              </p>
              <p className="font-mono text-[10px] text-neutral-500">{cert.number}</p>
            </div>
          </footer>
        </div>
      </article>
    </main>
  )
}
