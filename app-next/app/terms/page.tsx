import type { Metadata } from "next";
import Link from "next/link";
import { Bullets, Clause, LegalShell, Mail, Term } from "@/components/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing access to and use of PageMD's AI-powered telephone answering and paging platform.",
};

const Caps = ({ children }: { children: React.ReactNode }) => (
  <p className="text-ink text-[0.82rem] leading-6 tracking-wide uppercase">
    {children}
  </p>
);

export default function Terms() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Terms of Service"
      meta="Effective June 25, 2025 · Last updated June 25, 2025"
      notice={{
        title: "Not a medical device",
        body: (
          <>
            PageMD is an administrative communications tool. It is not a medical
            device, does not provide medical diagnoses or advice, and is not a
            substitute for professional clinical judgment. PageMD does not
            replace your triage protocols, it supports them by ensuring calls
            are captured and routed. Always maintain independent clinical
            oversight of all patient communications.
          </>
        ),
      }}
      intro={
        <>
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
            and use of the services provided by PageMD, Inc.
            (&ldquo;PageMD,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;), including the pagemd.ai website and our
            AI-powered telephone answering and paging platform (collectively,
            the &ldquo;Service&rdquo;). By accessing the Service or clicking
            &ldquo;I agree,&rdquo; you (&ldquo;Clinic,&rdquo; &ldquo;you,&rdquo;
            or &ldquo;your&rdquo;) agree to be bound by these Terms.
          </p>
          <p>
            If you are entering into these Terms on behalf of a medical practice
            or other entity, you represent that you have authority to bind that
            entity.
          </p>
        </>
      }
    >
      <Clause n={1} title="The Service">
        <p>
          PageMD provides AI-assisted inbound call handling for outpatient
          medical clinics. The Service answers calls on your behalf, conducts
          structured intake conversations, generates paging summaries, and
          routes them to designated clinical staff. Features and availability
          may change over time as the product evolves.
        </p>
        <p>
          During the early-access period, the Service is provided for evaluation
          and feedback purposes. We will communicate the transition to a paid
          subscription with reasonable advance notice.
        </p>
      </Clause>

      <Clause n={2} title="Eligibility and Account">
        <Bullets
          items={[
            "You must be a duly licensed healthcare provider or an authorized representative of one to use the Service in a clinical setting.",
            "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.",
            "You agree to provide accurate, current, and complete registration information and to update it as necessary.",
            "You must be at least 18 years of age to create an account.",
          ]}
        />
      </Clause>

      <Clause n={3} title="HIPAA and Business Associate Agreement">
        <p>
          If you are a covered entity or business associate under HIPAA, your
          use of the Service to process Protected Health Information
          (&ldquo;PHI&rdquo;) requires execution of a Business Associate
          Agreement (&ldquo;BAA&rdquo;) with PageMD prior to transmitting any
          PHI through the Service.
        </p>
        <p>
          By entering into a BAA with PageMD, each party agrees to handle PHI
          only as permitted by HIPAA and the BAA. If a BAA has not been
          executed, you may not use the Service to process PHI. Please contact{" "}
          <Mail /> to obtain a BAA.
        </p>
        <p>
          You remain solely responsible for ensuring your own HIPAA compliance,
          including obtaining valid patient authorizations where required,
          maintaining your Notice of Privacy Practices, and fulfilling all
          covered-entity obligations.
        </p>
      </Clause>

      <Clause n={4} title="Acceptable Use">
        <p>You agree not to:</p>
        <Bullets
          items={[
            "Use the Service for any unlawful purpose or in violation of applicable law, including HIPAA and state privacy laws.",
            "Use the Service to handle emergency calls requiring immediate dispatch (e.g. 911-level emergencies) — the Service is not designed for emergency response.",
            "Misrepresent the nature of the Service to patients (e.g. represent PageMD as a human operator without appropriate disclosure).",
            "Attempt to reverse-engineer, decompile, or extract the underlying AI models or software.",
            "Interfere with or disrupt the Service or its infrastructure.",
            "Use the Service to send spam, unsolicited communications, or engage in any abusive conduct.",
          ]}
        />
      </Clause>

      <Clause n={5} title="Patient Consent and Disclosure">
        <p>
          You are responsible for obtaining all legally required patient
          consents for recording and AI-processing of calls, and for providing
          any required disclosures under applicable federal and state law
          (including state wiretapping statutes, which may require two-party
          consent). PageMD will provide call-opening language designed to inform
          callers that the call is automated and may be recorded, but you are
          ultimately responsible for compliance with disclosure requirements in
          your jurisdiction.
        </p>
      </Clause>

      <Clause n={6} title="Fees and Payment">
        <p>
          During the early-access period, the Service is provided at no charge.
          Upon general availability, we will publish a pricing schedule and
          provide at least 30 days&rsquo; notice before charging any fees.
          Continued use after that date constitutes your agreement to the
          applicable fees. All fees are exclusive of applicable taxes.
        </p>
      </Clause>

      <Clause n={7} title="Intellectual Property">
        <p>
          PageMD and its licensors retain all intellectual property rights in
          the Service, including the AI models, software, brand, and
          documentation. These Terms grant you a limited, non-exclusive,
          non-transferable license to use the Service as described herein. You
          retain ownership of your clinic&rsquo;s data (call recordings,
          transcripts, patient information) that you provide to the Service.
        </p>
        <p>
          By using the Service, you grant PageMD a limited license to process
          your data as necessary to provide and improve the Service, consistent
          with our{" "}
          <Link
            href="/privacy"
            className="text-accent underline underline-offset-4"
          >
            Privacy Policy
          </Link>{" "}
          and any applicable BAA.
        </p>
      </Clause>

      <Clause n={8} title="Confidentiality">
        <p>
          Each party agrees to keep the other&rsquo;s confidential information
          (including, without limitation, proprietary technology, pricing, and
          business plans) confidential and to use it only as necessary to
          fulfill obligations under these Terms. PHI is governed by the
          applicable BAA and HIPAA, not this section.
        </p>
      </Clause>

      <Clause n={9} title="Disclaimers">
        <Caps>
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo; without warranties of any kind, express or implied,
          including but not limited to warranties of merchantability, fitness
          for a particular purpose, or non-infringement.
        </Caps>
        <p>
          PageMD does not warrant that the Service will be error-free,
          uninterrupted, or that AI-generated transcripts and summaries will be
          accurate in all cases. You are responsible for reviewing AI-generated
          output and for all clinical decisions made on the basis of information
          routed by the Service.
        </p>
      </Clause>

      <Clause n={10} title="Limitation of Liability">
        <Caps>
          To the maximum extent permitted by law, PageMD&rsquo;s total liability
          to you for any claims arising from or related to the Service shall not
          exceed the greater of (a) the fees paid by you to PageMD in the three
          months preceding the claim or (b) one hundred dollars (USD $100).
        </Caps>
        <Caps>
          In no event will PageMD be liable for any indirect, incidental,
          special, consequential, or punitive damages, including lost profits,
          loss of data, or harm to patients, even if advised of the possibility
          of such damages.
        </Caps>
        <p>
          Some jurisdictions do not allow certain limitations of liability; in
          such jurisdictions, the above limitations apply to the greatest extent
          permitted by law.
        </p>
      </Clause>

      <Clause n={11} title="Indemnification">
        <p>
          You agree to indemnify, defend, and hold harmless PageMD and its
          officers, directors, employees, and agents from and against any
          claims, liabilities, damages, losses, or expenses (including
          reasonable attorneys&rsquo; fees) arising out of or related to: (a)
          your use of the Service in violation of these Terms; (b) your failure
          to obtain required patient consents or provide required disclosures;
          (c) your violation of applicable law, including HIPAA; or (d) your
          clinical decisions made in reliance on Service output.
        </p>
      </Clause>

      <Clause n={12} title="Term and Termination">
        <p>
          These Terms remain in effect until terminated. Either party may
          terminate at any time by providing written notice. PageMD may suspend
          or terminate your access immediately if you violate these Terms or if
          continued access poses a risk of harm to patients, third parties, or
          PageMD. Upon termination, your right to use the Service ceases and we
          will handle your data in accordance with our Privacy Policy and any
          applicable BAA.
        </p>
      </Clause>

      <Clause n={13} title="Governing Law and Disputes">
        <p>
          These Terms are governed by the laws of the State of Delaware, without
          regard to conflict-of-law principles. Any dispute not resolved by
          good-faith negotiation within 30 days shall be resolved by binding
          arbitration under the American Arbitration Association&rsquo;s
          Commercial Rules, with proceedings in English. Class-action and
          jury-trial rights are waived to the extent permitted by law. Nothing
          herein prevents either party from seeking injunctive relief in any
          court of competent jurisdiction.
        </p>
      </Clause>

      <Clause n={14} title="Changes to These Terms">
        <p>
          We may update these Terms from time to time. When we do, we will
          revise the &ldquo;Last updated&rdquo; date above. For material
          changes, we will notify registered clinics by email at least 14 days
          before the changes take effect. Continued use of the Service after the
          effective date constitutes acceptance of the revised Terms. If you
          object to any change, your sole remedy is to stop using the Service.
        </p>
      </Clause>

      <Clause n={15} title="General">
        <Term label="Entire agreement.">
          These Terms, together with our Privacy Policy and any executed BAA,
          constitute the entire agreement between you and PageMD regarding the
          Service.
        </Term>
        <Term label="Severability.">
          If any provision of these Terms is found unenforceable, that provision
          will be modified to the minimum extent necessary, and the remaining
          provisions will remain in full force.
        </Term>
        <Term label="Waiver.">
          Failure to enforce any right or provision of these Terms is not a
          waiver of that right or provision.
        </Term>
        <Term label="Assignment.">
          You may not assign these Terms without PageMD&rsquo;s prior written
          consent. PageMD may assign these Terms in connection with a merger or
          acquisition.
        </Term>
        <Term label="Force majeure.">
          PageMD is not liable for delays or failures caused by circumstances
          beyond our reasonable control.
        </Term>
      </Clause>

      <Clause n={16} title="Contact Us">
        <p>
          Questions about these Terms may be directed to PageMD, Inc. at{" "}
          <Mail />.
        </p>
      </Clause>
    </LegalShell>
  );
}
