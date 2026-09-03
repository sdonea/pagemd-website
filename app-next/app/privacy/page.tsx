import type { Metadata } from "next";
import Link from "next/link";
import { Bullets, Clause, LegalShell, Mail, Term } from "@/components/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How PageMD collects, uses, discloses, and protects information, including its obligations as a HIPAA Business Associate.",
};

export default function Privacy() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Privacy Policy"
      meta="Effective June 25, 2025 · Last updated June 25, 2025"
      notice={{
        title: "HIPAA notice",
        body: (
          <>
            When PageMD processes calls on behalf of a covered entity (such as a
            medical clinic), PageMD acts as a Business Associate under HIPAA. In
            that capacity we enter into a Business Associate Agreement (
            &ldquo;BAA&rdquo;) with the covered entity and handle Protected
            Health Information (&ldquo;PHI&rdquo;) only as permitted by HIPAA
            and that BAA. This Policy does not replace or limit any applicable
            BAA.
          </>
        ),
      }}
      intro={
        <>
          <p>
            PageMD, Inc. (&ldquo;PageMD,&rdquo; &ldquo;we,&rdquo;
            &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates an AI-powered
            telephone answering and paging service for outpatient medical
            clinics. This Privacy Policy explains how we collect, use, disclose,
            and protect information when you visit pagemd.ai (the
            &ldquo;Site&rdquo;) or use our services (the &ldquo;Service&rdquo;).
          </p>
          <p>
            By using the Site or Service you agree to this Policy. If you do not
            agree, please do not use the Site or Service.
          </p>
        </>
      }
    >
      <Clause n={1} title="Information We Collect">
        <p>We collect information in the following ways:</p>
        <Term label="Clinic and account information.">
          When a clinic signs up or contacts us, we collect business contact
          details (name, clinic name, email address, phone number) and billing
          information.
        </Term>
        <Term label="Call data.">
          The Service records and transcribes inbound phone calls made to a
          clinic&rsquo;s PageMD line. These recordings and transcripts may
          contain Protected Health Information about patients, including names,
          dates of birth, medications, symptoms, and other clinical details.
          Such data is processed solely on behalf of the clinic under our BAA.
        </Term>
        <Term label="Structured paging output.">
          We generate structured intake summaries and route them to designated
          providers. These summaries may include PHI and are handled under the
          applicable BAA.
        </Term>
        <Term label="Website usage data.">
          We collect standard log data (IP address, browser type, pages viewed,
          referring URLs, timestamps) when you visit the Site. We may use
          cookies or similar technologies to maintain session state and analyze
          traffic.
        </Term>
        <Term label="Communications.">
          If you email us or submit our early-access form, we retain your
          message and contact details.
        </Term>
        <Term label="Interactive demo.">
          The on-site demo uses synthetic (fictional) patient scenarios. No real
          PHI is transmitted during the demo.
        </Term>
      </Clause>

      <Clause n={2} title="How We Use Information">
        <Bullets
          items={[
            "Deliver, operate, and improve the Service, including training and refining AI models using de-identified or aggregate data.",
            "Process and route calls on behalf of clinics as directed by each clinic.",
            "Respond to inquiries and provide customer support.",
            "Send product updates, early-access notifications, and service announcements (you may opt out at any time).",
            "Comply with legal obligations and enforce our Terms of Service.",
            "Detect and prevent fraud, abuse, or security incidents.",
          ]}
        />
        <p className="text-ink">
          We do not sell personal information or PHI to third parties. We do not
          use PHI to train AI models without explicit written consent from the
          relevant covered entity.
        </p>
      </Clause>

      <Clause n={3} title="How We Share Information">
        <p>We may share information with:</p>
        <Term label="Service providers.">
          Cloud infrastructure, telephony, and analytics vendors that process
          data on our behalf under appropriate data-protection agreements (and,
          where required, BAAs).
        </Term>
        <Term label="The clinic you call.">
          Call recordings, transcripts, and structured paging outputs are shared
          with the clinic that engaged us. How that clinic further uses patient
          information is governed by its own HIPAA obligations.
        </Term>
        <Term label="Legal or regulatory authorities.">
          If required by law, court order, or to protect our rights or the
          rights of others.
        </Term>
        <Term label="Business transfers.">
          In connection with a merger, acquisition, or sale of assets, subject
          to the acquirer honoring this Policy and any applicable BAAs.
        </Term>
      </Clause>

      <Clause n={4} title="HIPAA and Business Associate Obligations">
        <p>As a Business Associate, PageMD:</p>
        <Bullets
          items={[
            "Uses and discloses PHI only as permitted by the applicable BAA and HIPAA.",
            "Implements administrative, physical, and technical safeguards to protect the confidentiality, integrity, and availability of electronic PHI (ePHI) as required by the HIPAA Security Rule.",
            "Reports any known breach of unsecured PHI to the covered entity within the timeframe specified in the applicable BAA.",
            "Ensures that its subcontractors who access PHI agree to the same obligations.",
          ]}
        />
        <p>
          If you are a patient whose call was processed by PageMD on behalf of a
          clinic, please contact that clinic directly to exercise your HIPAA
          rights (access, amendment, accounting of disclosures, etc.). PageMD
          will cooperate with covered entities in responding to patient rights
          requests as required by HIPAA.
        </p>
      </Clause>

      <Clause n={5} title="Data Retention">
        <p>
          We retain call recordings and transcripts for the period specified in
          the applicable BAA (typically the minimum required for HIPAA
          compliance, generally six years from creation or last effective date).
          Account and billing information is retained for as long as necessary
          to provide the Service and meet our legal obligations. Website log
          data is typically retained for 90 days.
        </p>
      </Clause>

      <Clause n={6} title="Security">
        <p>
          We implement industry-standard technical and organizational measures
          to protect information against unauthorized access, alteration,
          disclosure, or destruction. This includes encryption in transit (TLS
          1.2+) and at rest, access controls, and regular security reviews.
          However, no method of transmission or storage is 100% secure, and we
          cannot guarantee absolute security.
        </p>
      </Clause>

      <Clause n={7} title="Cookies and Tracking">
        <p>
          The Site uses essential cookies for session management and may use
          analytics cookies (such as simple, privacy-respecting analytics) to
          understand traffic patterns. We do not use third-party advertising or
          behavioral-tracking cookies. You may disable cookies in your browser
          settings; some features may not function correctly if you do.
        </p>
      </Clause>

      <Clause n={8} title="Third-Party Links">
        <p>
          The Site may contain links to third-party websites. We are not
          responsible for the privacy practices of those sites and encourage you
          to read their privacy policies.
        </p>
      </Clause>

      <Clause n={9} title="Children's Privacy">
        <p>
          The Site and Service are intended for healthcare professionals and are
          not directed at children under 13. We do not knowingly collect
          personal information from children under 13. If we learn we have done
          so, we will delete it promptly.
        </p>
      </Clause>

      <Clause n={10} title="California Residents (CCPA)">
        <p>
          If you are a California resident, you have the right to know what
          personal information we collect about you, to request deletion of that
          information, and to opt out of the sale of your personal information.
          We do not sell personal information. To exercise your rights, contact
          us at <Mail />. We will not discriminate against you for exercising
          your privacy rights.
        </p>
      </Clause>

      <Clause n={11} title="Changes to This Policy">
        <p>
          We may update this Policy from time to time. When we do, we will
          revise the &ldquo;Last updated&rdquo; date at the top and, for
          material changes, notify affected clinics by email. Continued use of
          the Service after the effective date constitutes acceptance of the
          revised Policy.
        </p>
      </Clause>

      <Clause n={12} title="Contact Us">
        <p>
          Questions, concerns, or requests regarding this Policy or our privacy
          practices may be directed to PageMD, Inc. at <Mail />.
        </p>
        <p>
          See also our{" "}
          <Link
            href="/terms"
            className="text-accent underline underline-offset-4"
          >
            Terms of Service
          </Link>
          .
        </p>
      </Clause>
    </LegalShell>
  );
}
