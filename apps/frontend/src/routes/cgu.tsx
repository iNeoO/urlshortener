import { createFileRoute } from "@tanstack/react-router";
import { Link } from "../components/ui/link";

export const Route = createFileRoute("/cgu")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="mx-auto w-full max-w-4xl px-6 py-10 sm:py-14">
			<div className="flex flex-col gap-4 border-b border-(--color-border) pb-8">
				<p className="text-sm font-medium text-(--color-muted)">UrlShortener</p>
				<h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
					Conditions Générales d&apos;Utilisation
				</h1>
				<p className="max-w-3xl text-sm leading-6 text-(--color-muted)">
					Date d&apos;effet : 2 avril 2026
				</p>
				<div className="flex flex-wrap gap-3">
					<Link to="/" variant="secondary">
						Retour à l&apos;accueil
					</Link>
					<Link to="/sign-up" variant="primary">
						Créer un compte
					</Link>
				</div>
			</div>

			<div className="mt-8 space-y-8 text-sm leading-7 text-(--color-text)">
				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">1. Objet</h2>
					<p>
						UrlShortener est un service open source permettant de créer des
						liens courts et de consulter des statistiques d&apos;usage
						associées, notamment des statistiques agrégées de clics, de
						navigateurs, de systèmes d&apos;exploitation, d&apos;appareils, de
						référents et de rôles utilisateurs.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">2. Acceptation</h2>
					<p>
						L&apos;utilisation du service implique l&apos;acceptation pleine et
						entière des présentes CGU.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						3. Accès au service
					</h2>
					<p>Le service est accessible notamment depuis :</p>
					<ul className="list-disc space-y-2 pl-6 text-(--color-muted)">
						<li>`https://u.tuturu.io`</li>
						<li>`https://urlshortener.tuturu.io`</li>
					</ul>
					<p>
						L&apos;accès à certaines fonctionnalités nécessite la création
						d&apos;un compte.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						4. Création de compte
					</h2>
					<p>
						L&apos;utilisateur s&apos;engage à fournir des informations exactes
						lors de son inscription, notamment son adresse email.
					</p>
					<p>
						L&apos;utilisateur est responsable de la confidentialité de ses
						identifiants et de toute activité réalisée depuis son compte.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						5. Fonctionnalités
					</h2>
					<p>Le service permet notamment :</p>
					<ul className="list-disc space-y-2 pl-6 text-(--color-muted)">
						<li>la création et la gestion de liens courts ;</li>
						<li>la consultation de statistiques de clics ;</li>
						<li>
							la gestion de rôles d&apos;accès selon les permissions attribuées.
						</li>
					</ul>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						6. Rôles et permissions
					</h2>
					<p>
						Le service peut attribuer différents rôles aux utilisateurs,
						notamment administrateur, éditeur et lecteur.
					</p>
					<p>
						Chaque utilisateur ne peut utiliser que les fonctionnalités
						correspondant à son niveau d&apos;autorisation.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						7. Utilisations interdites
					</h2>
					<p>Il est strictement interdit d&apos;utiliser UrlShortener pour :</p>
					<ul className="list-disc space-y-2 pl-6 text-(--color-muted)">
						<li>diffuser du spam ;</li>
						<li>rediriger vers des contenus illégaux ;</li>
						<li>mener des activités de phishing, fraude ou escroquerie ;</li>
						<li>
							diffuser des logiciels malveillants, virus ou codes nuisibles ;
						</li>
						<li>porter atteinte aux droits de tiers ;</li>
						<li>
							contourner la sécurité ou perturber le fonctionnement du service.
						</li>
					</ul>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						8. Suspension ou suppression d&apos;accès
					</h2>
					<p>
						L&apos;éditeur se réserve le droit de suspendre ou supprimer
						l&apos;accès d&apos;un utilisateur en cas de violation des présentes
						CGU, notamment en cas d&apos;usage illicite ou abusif du service.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">9. Disponibilité</h2>
					<p>
						Le service est fourni en l&apos;état, sans garantie de disponibilité
						continue.
					</p>
					<p>
						L&apos;éditeur peut interrompre temporairement l&apos;accès pour
						maintenance, évolution ou correction.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						10. Responsabilité
					</h2>
					<p>L&apos;utilisateur demeure seul responsable :</p>
					<ul className="list-disc space-y-2 pl-6 text-(--color-muted)">
						<li>des liens qu&apos;il crée ;</li>
						<li>des contenus vers lesquels ces liens redirigent ;</li>
						<li>de l&apos;usage qu&apos;il fait du service.</li>
					</ul>
					<p>
						L&apos;éditeur ne pourra être tenu responsable des dommages
						indirects, pertes de données, pertes d&apos;exploitation ou usages
						illicites réalisés par des utilisateurs ou des tiers.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						11. Propriété intellectuelle
					</h2>
					<p>Le logiciel UrlShortener est proposé comme projet open source.</p>
					<p>
						Sauf mention contraire, les éléments spécifiques du service,
						notamment les textes, graphismes, logos et interfaces, restent
						protégés par les droits de propriété intellectuelle applicables.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						12. Données personnelles
					</h2>
					<p>
						Le service traite notamment les données nécessaires à la gestion des
						comptes, des liens, des rôles et des statistiques de clics.
					</p>
					<p>
						Aucun cookie non essentiel n&apos;est utilisé. Seuls les éléments
						strictement nécessaires à l&apos;authentification et au
						fonctionnement du service peuvent être employés.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						13. Modification des CGU
					</h2>
					<p>
						Les présentes CGU peuvent être modifiées à tout moment. La version
						applicable est celle publiée en ligne à la date d&apos;utilisation
						du service.
					</p>
				</section>

				<section className="space-y-3">
					<h2 className="text-xl font-semibold text-white">
						14. Droit applicable
					</h2>
					<p>Les présentes CGU sont soumises au droit français.</p>
				</section>

				<section className="space-y-3 border-t border-(--color-border) pt-8">
					<h2 className="text-xl font-semibold text-white">15. Contact</h2>
					<p>
						Pour toute question relative au service :
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
