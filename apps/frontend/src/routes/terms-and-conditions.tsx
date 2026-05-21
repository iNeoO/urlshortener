import { createFileRoute } from "@tanstack/react-router";
import { Link } from "../components/ui/link";

export const Route = createFileRoute("/terms-and-conditions")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="mx-auto w-full max-w-4xl px-6 py-10 sm:py-14">
			<div className="flex flex-col gap-4 border-b border-(--color-border) pb-8">
				<p className="text-sm font-medium text-(--color-muted)">UrlShortener</p>
				<h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
					Terms and Conditions
				</h1>
				<p className="max-w-3xl text-sm leading-6 text-(--color-muted)">
					Effective date: April 2, 2026
				</p>
				<div className="flex flex-wrap gap-3">
					<Link to="/" variant="secondary">
						Back to home
					</Link>
					<Link to="/sign-up" variant="primary">
						Create an account
					</Link>
				</div>
			</div>

			<div className="mt-8 space-y-8 text-sm leading-7 text-(--color-text)">
				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">1. Purpose</h2>
					<p>
						UrlShortener is an open source service that allows users to create
						short links and consult associated usage statistics, including
						aggregated statistics on clicks, browsers, operating systems,
						devices, referrers, and user roles.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">2. Acceptance</h2>
					<p>
						Use of the service implies full and unconditional acceptance of
						these Terms and Conditions.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						3. Access to the service
					</h2>
					<p>The service is available in particular at:</p>
					<ul className="list-disc space-y-2 pl-6 text-(--color-muted)">
						<li>`https://u.tuturu.io`</li>
						<li>`https://urlshortener.tuturu.io`</li>
					</ul>
					<p>Access to certain features requires creating an account.</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						4. Account creation
					</h2>
					<p>
						The user agrees to provide accurate information during registration,
						including their email address.
					</p>
					<p>
						The user is responsible for keeping their credentials confidential
						and for all activity carried out through their account.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">5. Features</h2>
					<p>The service notably allows:</p>
					<ul className="list-disc space-y-2 pl-6 text-(--color-muted)">
						<li>creation and management of short links;</li>
						<li>consultation of click statistics;</li>
						<li>
							management of access roles according to assigned permissions.
						</li>
					</ul>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						6. Roles and permissions
					</h2>
					<p>
						The service may assign different roles to users, including
						administrator, editor, and reader.
					</p>
					<p>
						Each user may only use features corresponding to their authorization
						level.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						7. Prohibited uses
					</h2>
					<p>It is strictly forbidden to use UrlShortener to:</p>
					<ul className="list-disc space-y-2 pl-6 text-(--color-muted)">
						<li>distribute spam;</li>
						<li>redirect to illegal content;</li>
						<li>carry out phishing, fraud, or scam activities;</li>
						<li>distribute malware, viruses, or harmful code;</li>
						<li>infringe third-party rights;</li>
						<li>bypass security or disrupt operation of the service.</li>
					</ul>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						8. Suspension or termination of access
					</h2>
					<p>
						The publisher reserves the right to suspend or terminate a
						user&apos;s access in case of violation of these Terms and
						Conditions, particularly in case of unlawful or abusive use of the
						service.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">9. Availability</h2>
					<p>
						The service is provided as is, without any guarantee of continuous
						availability.
					</p>
					<p>
						The publisher may temporarily interrupt access for maintenance,
						updates, or corrections.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">10. Liability</h2>
					<p>The user remains solely responsible for:</p>
					<ul className="list-disc space-y-2 pl-6 text-(--color-muted)">
						<li>the links they create;</li>
						<li>the content to which those links redirect;</li>
						<li>how they use the service.</li>
					</ul>
					<p>
						The publisher cannot be held liable for indirect damages, data loss,
						loss of business, or unlawful use carried out by users or third
						parties.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						11. Intellectual property
					</h2>
					<p>UrlShortener software is provided as an open source project.</p>
					<p>
						Unless stated otherwise, service-specific elements, including text,
						graphics, logos, and interfaces, remain protected by applicable
						intellectual property rights.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						12. Personal data
					</h2>
					<p>
						The service processes data required for account management, links,
						roles, and click statistics.
					</p>
					<p>
						No non-essential cookies are used. Only elements strictly necessary
						for authentication and operation of the service may be used.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						13. Changes to the Terms
					</h2>
					<p>
						These Terms and Conditions may be modified at any time. The
						applicable version is the one published online on the date of
						service use.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						14. Governing law
					</h2>
					<p>These Terms and Conditions are governed by French law.</p>
				</section>

				<section className="space-y-3 border-t border-(--color-border) pt-8">
					<h2 className="text-xl font-semibold text-white">15. Contact</h2>
					<p>
						For any question related to the service:
						<br />
						<a
							href="mailto:urlshortener@tuturu.io"
							className="text-(--color-primary) hover:underline"
						>
							urlshortener@tuturu.io
						</a>
					</p>
				</section>
			</div>
		</div>
	);
}
